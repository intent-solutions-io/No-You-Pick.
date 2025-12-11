/**
 * NoYouPick API Service
 * Connects to Cloud Run backend for restaurant recommendations
 */

const API_URL = 'https://noupick-api-246498703732.us-central1.run.app';

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  address: string;
  rating: string;
  openStatus: string;
  reason: string;
  googleMapLink?: string;
}

export interface SearchResponse {
  restaurants: Restaurant[];
  rawText: string;
}

export const searchRestaurants = async (
  locationQuery: string,
  cuisine: string = 'Any',
  radius: string = '10',
  excludeNames: string[] = []
): Promise<SearchResponse> => {
  const response = await fetch(`${API_URL}/api/restaurants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      locationQuery,
      cuisine,
      radius,
      excludeNames
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to search restaurants');
  }

  return response.json();
};

export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
};
