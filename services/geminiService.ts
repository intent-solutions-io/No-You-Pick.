
import { GeoLocation, Restaurant } from "../types";

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
  ? import.meta.env.VITE_API_BASE_URL || "https://noupick-api-246498703732.us-central1.run.app"
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
