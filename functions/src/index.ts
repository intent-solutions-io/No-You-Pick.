/**
 * NoYouPick Cloud Functions
 *
 * Vertex AI Gemini proxy with rate limiting and CORS support.
 * Uses Application Default Credentials (ADC) - NO API KEY NEEDED!
 * Accepts the same parameters as the frontend geminiService.ts
 * to minimize frontend changes during migration.
 */

import { onRequest } from "firebase-functions/v2/https";
import { VertexAI } from "@google-cloud/vertexai";

// Vertex AI configuration - automatically uses ADC (no secrets needed!)
const REGION = "us-central1";
const MODEL_NAME = "gemini-1.5-flash-002";

// Types matching frontend types.ts
interface GeoLocation {
  lat: number;
  lng: number;
}

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  reason: string;
  address: string;
  rating: string;
  openStatus: string;
  googleMapLink?: string;
}

interface RestaurantRequest {
  locationQuery: string;
  cuisine?: string;
  excludeNames?: string[];
  coords?: GeoLocation;
  radius?: string;
}

interface RestaurantResponse {
  restaurants: Restaurant[];
  rawText: string;
}

// Rate limiting store (in-memory for single instance)
// For production scale, use Redis or Firestore
const rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();

const RATE_LIMIT_MAX = 10; // requests per window
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5000",
  "http://localhost:5173",
  /\.web\.app$/,
  /\.firebaseapp\.com$/,
  /noupick.*\.web\.app$/
];

/**
 * Check if origin is allowed
 */
function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return false;

  return ALLOWED_ORIGINS.some(allowed => {
    if (typeof allowed === "string") {
      return origin === allowed;
    }
    return allowed.test(origin);
  });
}

/**
 * Get client IP for rate limiting
 */
function getClientIP(request: any): string {
  return (
    request.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    request.headers["x-real-ip"] ||
    request.ip ||
    "unknown"
  );
}

/**
 * Check and update rate limit for IP
 */
function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetTime) {
    // New window
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX - entry.count,
    resetIn: entry.resetTime - now
  };
}

/**
 * Parse Gemini response into Restaurant objects
 * Matches the parsing logic from frontend geminiService.ts
 */
function parseResponse(text: string, chunks: any[]): Restaurant[] {
  const restaurants: Restaurant[] = [];
  const items = text.split("---SEPARATOR---");

  items.forEach((item, index) => {
    const nameMatch = item.match(/Name:\s*(.+)/);
    if (nameMatch && nameMatch[1]) {
      const name = nameMatch[1].trim();
      if (!name) return;

      const cuisineMatch = item.match(/Cuisine:\s*(.+)/);
      const addressMatch = item.match(/Address:\s*(.+)/);
      const ratingMatch = item.match(/Rating:\s*(.+)/);
      const statusMatch = item.match(/Status:\s*(.+)/);
      const reasonMatch = item.match(/Reason:\s*(.+)/);

      const relatedChunk = chunks.find(c =>
        c.web?.title?.toLowerCase().includes(name.toLowerCase()) ||
        c.maps?.title?.toLowerCase().includes(name.toLowerCase())
      );

      const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + " " + (addressMatch ? addressMatch[1] : ""))}`;
      const mapLink = relatedChunk?.maps?.uri || relatedChunk?.web?.uri || fallbackUrl;

      restaurants.push({
        id: `rest-${index}-${Date.now()}`,
        name: name,
        cuisine: cuisineMatch ? cuisineMatch[1].trim() : "Variety",
        address: addressMatch ? addressMatch[1].trim() : "Nearby",
        rating: ratingMatch ? ratingMatch[1].trim() : "N/A",
        openStatus: statusMatch ? statusMatch[1].trim() : "Check hours",
        reason: reasonMatch ? reasonMatch[1].trim() : "Worth a try!",
        googleMapLink: mapLink
      });
    }
  });

  return restaurants.slice(0, 3);
}

/**
 * Main API endpoint - Vertex AI Gemini proxy for restaurant recommendations
 *
 * POST /api/restaurants
 * Body: RestaurantRequest
 * Response: RestaurantResponse
 *
 * Uses Application Default Credentials (ADC) - no secrets needed!
 */
export const api = onRequest(
  {
    region: REGION,
    memory: "512MiB",
    timeoutSeconds: 60,
    minInstances: 0,
    maxInstances: 10,
    cors: false // We handle CORS manually for more control
  },
  async (request, response) => {
    // Handle CORS
    const origin = request.headers.origin;

    if (isOriginAllowed(origin)) {
      response.set("Access-Control-Allow-Origin", origin);
    }

    response.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.set("Access-Control-Max-Age", "3600");

    // Handle preflight
    if (request.method === "OPTIONS") {
      response.status(204).send("");
      return;
    }

    // Only allow POST for restaurant endpoint
    if (request.method !== "POST") {
      response.status(405).json({ error: "Method not allowed" });
      return;
    }

    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP);

    response.set("X-RateLimit-Limit", String(RATE_LIMIT_MAX));
    response.set("X-RateLimit-Remaining", String(rateLimit.remaining));
    response.set("X-RateLimit-Reset", String(Math.ceil(rateLimit.resetIn / 1000)));

    if (!rateLimit.allowed) {
      response.status(429).json({
        error: "Rate limit exceeded",
        message: `Too many requests. Try again in ${Math.ceil(rateLimit.resetIn / 1000)} seconds.`,
        retryAfter: Math.ceil(rateLimit.resetIn / 1000)
      });
      return;
    }

    // Parse request body
    const body = request.body as RestaurantRequest;

    if (!body.locationQuery) {
      response.status(400).json({
        error: "Bad request",
        message: "locationQuery is required"
      });
      return;
    }

    const {
      locationQuery,
      cuisine = "Any",
      excludeNames = [],
      coords: _coords,  // Reserved for future location-based grounding
      radius = "15"
    } = body;

    try {
      // Initialize Vertex AI client (uses ADC - no API key needed!)
      const project = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
      const vertex = new VertexAI({ project, location: REGION });
      const model = vertex.getGenerativeModel({ model: MODEL_NAME });

      const makeRequest = async (retries = 1): Promise<any> => {
        try {
          const cuisineInstruction = cuisine && cuisine !== "Any"
            ? `STRICTLY find "${cuisine}" restaurants. If 0 found, return "NO_MATCHES_FOUND".`
            : `Find 3 distinct places (mix of styles). Randomize the selection.`;

          const excludeInstruction = excludeNames.length > 0
            ? `EXCLUDE these names strictly: ${excludeNames.join(", ")}.`
            : "";

          const randomSeed = Math.floor(Math.random() * 1000000);

          const prompt = `
            Session ID: ${randomSeed}
            Act as a restaurant picker engine.
            Search within ${radius} miles of "${locationQuery}".

            CRITICAL INSTRUCTION: High randomness required.
            - Do NOT just pick the top rated result every time.
            - Do NOT just pick the closest result every time.
            - You MUST pick 3 different places.
            - Dig deeper into the search results to find variety.

            ${cuisineInstruction}
            ${excludeInstruction}

            Return up to 3 results.

            Output format per restaurant (Use "---SEPARATOR---" between items):
            Name: [Exact Name]
            Cuisine: [Short Type]
            Address: [Short Address]
            Rating: [Number]
            Status: [Open/Closed]
            Reason: [Max 10 words punchy reason]

            Example:
            Name: Joe's Pizza
            Cuisine: Pizza
            Address: 123 Main
            Rating: 4.5
            Status: Open
            Reason: Best deep dish in town, super cheesy.
            ---SEPARATOR---
          `;

          return await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          });
        } catch (error: any) {
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return makeRequest(retries - 1);
          }
          throw error;
        }
      };

      const vertexResponse = await makeRequest();
      const text = vertexResponse.response?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("\n") || "";

      if (text.includes("NO_MATCHES_FOUND")) {
        response.status(200).json({
          restaurants: [],
          rawText: text
        } as RestaurantResponse);
        return;
      }

      const chunks = vertexResponse.response?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const parsedRestaurants = parseResponse(text, chunks);

      response.status(200).json({
        restaurants: parsedRestaurants,
        rawText: text
      } as RestaurantResponse);

    } catch (error: any) {
      console.error("Gemini API Error:", error);

      // Don't expose internal errors to client
      const statusCode = error.status || 500;
      const message = statusCode === 500
        ? "Internal server error"
        : error.message || "An error occurred";

      response.status(statusCode).json({
        error: "API Error",
        message: message
      });
    }
  }
);

/**
 * Health check endpoint
 */
export const health = onRequest(
  {
    region: REGION,
    memory: "128MiB",
    timeoutSeconds: 10
  },
  async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    });
  }
);
