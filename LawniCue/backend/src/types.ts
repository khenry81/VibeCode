// Shared types for lawn care assistant API

export interface SoilTemperatureData {
  soilTemps: {
    surface: number;
    shallow: number;
    mid: number;
    deep: number;
  };
  airTemp: number;
  forecast: Array<{
    date: string;
    high: number;
    low: number;
  }>;
  timezone: string;
}

export interface ProductRecommendation {
  id: string;
  name: string;
  category: string;
  type: string;
  description: string;
  applicationRate: string;
  bestTimeToApply: string;
  priority: string;
  imageUrl: string;
  purchaseUrl: string;
}

export interface CalendarTask {
  id: string;
  title: string;
  description: string;
  suggestedDate: string;
  category: string;
  priority: string;
  productName?: string;
  productBrand?: string;
  imageUrl?: string;
  purchaseUrl?: string;
}
