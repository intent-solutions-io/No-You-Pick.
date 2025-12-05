
import { GoogleGenAI } from "@google/genai";
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
    if (!process.env.API_KEY) {
       console.warn("No API Key available for generation");
       return null;
    }
    
    const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // 3. Call the Pro Image model
    const response = await genAI.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            text: "3D render of a cute, anthropomorphic fox chef mascot character. The fox is standing confidently, holding a wooden spoon or whisk. Wearing a pristine white chef's hat. Realistic, fluffy, detailed orange and white fur, large expressive glossy eyes. Isolated on a pure solid white background (Hex #FFFFFF). High contrast between subject and background. No shadow on the floor. Pixar style, cinematic lighting, ultra-detailed, 8k resolution."
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
export const getRandomRestaurants = async (
  locationQuery: string,
  cuisine: string = "Any",
  excludeNames: string[] = [],
  coords?: GeoLocation,
  radius: string = "15"
): Promise<{ restaurants: Restaurant[]; rawText: string }> => {
  
  // Initialize client here to avoid top-level module errors
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  const makeRequest = async (retries = 1): Promise<any> => {
    try {
      const model = 'gemini-2.5-flash';
      
      const toolConfig: any = {};
      if (coords) {
        toolConfig.retrievalConfig = {
          latLng: {
            latitude: coords.lat,
            longitude: coords.lng,
          },
        };
      }

      // Simplified prompt for faster token generation
      const cuisineInstruction = cuisine && cuisine !== "Any"
        ? `STRICTLY find "${cuisine}" restaurants. If 0 found, return "NO_MATCHES_FOUND".`
        : `Find 3 distinct places (mix of styles).`;

      const excludeInstruction = excludeNames.length > 0
        ? `EXCLUDE: ${excludeNames.join(", ")}.`
        : "";

      const prompt = `
        Act as a fast restaurant picker.
        Search within ${radius} miles of "${locationQuery}".
        
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

      return await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: coords ? toolConfig : undefined,
        },
      });
    } catch (error: any) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Reduced retry wait
        return makeRequest(retries - 1);
      }
      throw error;
    }
  };

  try {
    const response = await makeRequest();
    const text = response.text || "";
    
    if (text.includes("NO_MATCHES_FOUND")) {
      return { restaurants: [], rawText: text };
    }

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const parsedRestaurants = parseResponse(text, chunks);

    return {
      restaurants: parsedRestaurants,
      rawText: text,
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
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
