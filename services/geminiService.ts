
import { GeoLocation, Restaurant } from "../types";

/**
 * Generates a high-quality 3D mascot image using Gemini 3 Pro Image (Nano Banana Pro).
 */
export const generateMascotImage = async (): Promise<string | null> => {
  try {
    // 1. Ensure a valid paid API key is selected (Required for Pro Image models)
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        const success = await (window as any).aistudio.openSelectKey();
        if (!success) {
          console.warn("User cancelled API key selection for image generation.");
          return null;
        }
      }
    }

    // 2. Create a fresh instance with the (potentially new) key
    // Check if key exists to avoid constructor errors
    if (!import.meta.env.VITE_GEMINI_API_KEY) {       console.warn("No API Key available for generation");
       return null;
    }
    
    const genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
    // 3. Call the Pro Image model
    // UPDATED PROMPT: "Chris Do" Inspiration -> Thick Black Glasses + Clean Design
    const response = await genAI.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            text: "A award-winning 3D render of a cute fox mascot character with the vibe of a creative director. The fox is wearing thick black rectangular designer glasses (bold, matte black) and a tall white chef's hat. The fox has soft orange fur and a confident, friendly expression. It is holding a silver whisk. Pixar-style animation render, 8k resolution, studio lighting, ambient occlusion, photorealistic materials, clean white background."
          }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      }
    });

    // 4. Extract and return the base64 image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Failed to generate mascot:", error);
    return null;
  }
};

/**
 * Fetches up to 3 random restaurant recommendations based on location.
 * @param locationQuery - The user's input location or "current location"
 * @param cuisine - The selected cuisine type (e.g., "Fast Food", "Mexican", "Any")
 * @param excludeNames - A list of restaurant names to strictly exclude from the result
 * @param coords - Optional GPS coordinates
 * @param radius - Search radius in miles
 */
// API base URL - uses Cloud Function backend instead of direct Gemini API
const API_BASE = import.meta.env.PROD
  ? import.meta.env.VITE_API_BASE_URL || "https://us-central1-noupick-prod.cloudfunctions.net"
  : import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5001/noupick-staging/us-central1";

export const getRandomRestaurants = async (
  locationQuery: string,
  cuisine: string = "Any",
  excludeNames: string[] = [],
  coords?: GeoLocation,
  radius: string = "15"
): Promise<{ restaurants: Restaurant[]; rawText: string }> => {

  // Call Cloud Function backend instead of direct Gemini API (SECURITY FIX)
  try {
    const response = await fetch(`${API_BASE}/api/restaurants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locationQuery, cuisine, excludeNames, coords, radius })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.rawText?.includes("NO_MATCHES_FOUND")) {
      return { restaurants: [], rawText: data.rawText };
    }

    const parsedRestaurants = parseResponse(data.rawText, data.groundingChunks || []);
    return { restaurants: parsedRestaurants, rawText: data.rawText };
  } catch (error: any) {
    console.error("Restaurant search error:", error);
    throw error;
  }
};

const parseResponse = (text: string, chunks: any[]): Restaurant[] => {
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
};
