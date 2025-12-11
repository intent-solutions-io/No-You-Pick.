/**
 * API Service Tests
 * Tests for the NoYouPick restaurant API client
 */

import { searchRestaurants, healthCheck, Restaurant, SearchResponse } from '../services/api';

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchRestaurants', () => {
    const mockRestaurant: Restaurant = {
      id: 'rest-0-1234567890',
      name: 'Test Restaurant',
      cuisine: 'Mexican',
      address: '123 Test St, Austin TX',
      rating: '4.5',
      openStatus: 'Open',
      reason: 'Great tacos and atmosphere',
      googleMapLink: 'https://maps.google.com/test',
    };

    const mockResponse: SearchResponse = {
      restaurants: [mockRestaurant],
      rawText: 'Name: Test Restaurant...',
    };

    it('should call the correct API endpoint with POST method', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await searchRestaurants('Austin, TX', 'Mexican', '10');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://noupick-api-246498703732.us-central1.run.app/api/restaurants',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should send correct request body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await searchRestaurants('Austin, TX', 'BBQ', '15', ['Already Visited']);

      const callArgs = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1]?.body as string);

      expect(requestBody).toEqual({
        locationQuery: 'Austin, TX',
        cuisine: 'BBQ',
        radius: '15',
        excludeNames: ['Already Visited'],
      });
    });

    it('should return restaurant data on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await searchRestaurants('Austin, TX');

      expect(result.restaurants).toHaveLength(1);
      expect(result.restaurants[0].name).toBe('Test Restaurant');
      expect(result.restaurants[0].cuisine).toBe('Mexican');
    });

    it('should use default values for optional parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await searchRestaurants('Los Angeles');

      const callArgs = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1]?.body as string);

      expect(requestBody.cuisine).toBe('Any');
      expect(requestBody.radius).toBe('10');
      expect(requestBody.excludeNames).toEqual([]);
    });

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Rate limit exceeded' }),
      } as Response);

      await expect(searchRestaurants('Austin')).rejects.toThrow('Rate limit exceeded');
    });

    it('should throw generic error when no message provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      } as Response);

      await expect(searchRestaurants('Austin')).rejects.toThrow('Failed to search restaurants');
    });
  });

  describe('healthCheck', () => {
    it('should return true when API is healthy', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'healthy' }),
      } as Response);

      const result = await healthCheck();

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://noupick-api-246498703732.us-central1.run.app/health'
      );
    });

    it('should return false when API returns error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response);

      const result = await healthCheck();

      expect(result).toBe(false);
    });

    it('should return false when fetch throws', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await healthCheck();

      expect(result).toBe(false);
    });
  });

  describe('Restaurant interface', () => {
    it('should allow optional googleMapLink', () => {
      const restaurant: Restaurant = {
        id: 'test-1',
        name: 'Test',
        cuisine: 'Pizza',
        address: '123 Main St',
        rating: '4.0',
        openStatus: 'Closed',
        reason: 'Good pizza',
      };

      expect(restaurant.googleMapLink).toBeUndefined();
    });
  });
});
