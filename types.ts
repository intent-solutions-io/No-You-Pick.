
export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  reason: string;
  address: string;
  rating: string;
  openStatus: string; // New field for "Open Now", "Closed", etc.
  googleMapLink?: string;
}

export interface GeoLocation {
  lat: number;
  lng: number;
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
