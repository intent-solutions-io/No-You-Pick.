/**
 * Cloud Run Entry Point
 * Wraps Cloud Functions v2 handlers for Cloud Run deployment
 */

import express from 'express';

const app = express();

// Parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Main API endpoint for restaurant search
app.post('/api/restaurants', async (req, res) => {
  // Cloud Functions v2 handlers expect request/response objects
  // We'll create a wrapper that mimics the Cloud Functions interface
  try {
    // Call the original api handler from index.ts
    // For Cloud Run, we need to extract the handler function
    // This is a workaround - we'll call the logic directly

    // Import the handler logic
    const { VertexAI } = await import('@google-cloud/vertexai');
    const REGION = 'us-central1';  // Try us-central1
    const MODEL_NAME = 'gemini-2.0-flash-exp';

    const ALLOWED_ORIGINS = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://localhost:5173',
      /\.web\.app$/,
      /\.firebaseapp\.com$/,
      /noupick.*\.web\.app$/
    ];

    // CORS handling
    const origin = req.headers.origin;
    const isOriginAllowed = (origin?: string): boolean => {
      if (!origin) return false;
      return ALLOWED_ORIGINS.some(allowed => {
        if (typeof allowed === 'string') {
          return origin === allowed;
        }
        return allowed.test(origin);
      });
    };

    if (isOriginAllowed(origin)) {
      res.set('Access-Control-Allow-Origin', origin);
    }

    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Max-Age', '3600');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    // Parse request body
    const body = req.body;

    if (!body.locationQuery) {
      res.status(400).json({
        error: 'Bad request',
        message: 'locationQuery is required'
      });
      return;
    }

    const {
      locationQuery,
      cuisine = 'Any',
      excludeNames = [],
      coords: _coords,
      radius = '15'
    } = body;

    try {
      // Initialize Vertex AI client (uses ADC - no API key needed!)
      const project = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || 'noupick-staging';
      const vertex = new VertexAI({ project, location: REGION });
      const model = vertex.getGenerativeModel({ model: MODEL_NAME });

      const makeRequest = async (retries = 1): Promise<any> => {
        try {
          const cuisineInstruction = cuisine && cuisine !== 'Any'
            ? `STRICTLY find "${cuisine}" restaurants. If 0 found, return "NO_MATCHES_FOUND".`
            : `Find 3 distinct places (mix of styles). Randomize the selection.`;

          const excludeInstruction = excludeNames.length > 0
            ? `EXCLUDE these names strictly: ${excludeNames.join(', ')}.`
            : '';

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
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
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
      const text = vertexResponse.response?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('\n') || '';

      if (text.includes('NO_MATCHES_FOUND')) {
        res.status(200).json({
          restaurants: [],
          rawText: text
        });
        return;
      }

      // Parse response
      const parseResponse = (text: string, chunks: any[]): any[] => {
        const restaurants: any[] = [];
        const items = text.split('---SEPARATOR---');

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

            const relatedChunk = chunks.find((c: any) =>
              c.web?.title?.toLowerCase().includes(name.toLowerCase()) ||
              c.maps?.title?.toLowerCase().includes(name.toLowerCase())
            );

            const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + (addressMatch ? addressMatch[1] : ''))}`;
            const mapLink = relatedChunk?.maps?.uri || relatedChunk?.web?.uri || fallbackUrl;

            restaurants.push({
              id: `rest-${index}-${Date.now()}`,
              name: name,
              cuisine: cuisineMatch ? cuisineMatch[1].trim() : 'Variety',
              address: addressMatch ? addressMatch[1].trim() : 'Nearby',
              rating: ratingMatch ? ratingMatch[1].trim() : 'N/A',
              openStatus: statusMatch ? statusMatch[1].trim() : 'Check hours',
              reason: reasonMatch ? reasonMatch[1].trim() : 'Worth a try!',
              googleMapLink: mapLink
            });
          }
        });

        return restaurants.slice(0, 3);
      };

      const chunks = vertexResponse.response?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const parsedRestaurants = parseResponse(text, chunks);

      res.status(200).json({
        restaurants: parsedRestaurants,
        rawText: text
      });

    } catch (error: any) {
      console.error('Gemini API Error:', error);

      const statusCode = error.status || 500;
      const message = statusCode === 500
        ? 'Internal server error'
        : error.message || 'An error occurred';

      res.status(statusCode).json({
        error: 'API Error',
        message: message
      });
    }
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({
      error: 'Internal error',
      message: 'An unexpected error occurred'
    });
  }
});

// Handle OPTIONS for CORS preflight on specific routes
app.options('/health', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.status(204).send('');
});

app.options('/api/restaurants', (req, res) => {
  const origin = req.headers.origin;
  if (origin) {
    res.set('Access-Control-Allow-Origin', origin);
  }
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Max-Age', '3600');
  res.status(204).send('');
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`NoYouPick API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API endpoint: http://localhost:${PORT}/api/restaurants`);
});
