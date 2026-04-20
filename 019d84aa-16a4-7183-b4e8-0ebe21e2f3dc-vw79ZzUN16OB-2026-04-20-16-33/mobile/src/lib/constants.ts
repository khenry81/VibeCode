export const CATEGORY_COLORS: Record<string, string> = {
  Fertilization: '#D4A373',
  'Weed Control': '#E74C3C',
  Mowing: '#2ECC71',
  Watering: '#3498DB',
  'Disease Control': '#9B59B6',
  'Soil Health': '#8B4513',
  'Equipment Maintenance': '#95A5A6',
  Overseeding: '#27AE60',
  Aeration: '#E67E22',
};

export const GRASS_TYPES = [
  'Bermuda',
  'Fescue',
  'Kentucky Bluegrass',
  'Zoysia',
  'St. Augustine',
  'Rye',
  'Centipede',
  'Buffalo',
];

export const COMMON_ISSUES = [
  'Weeds',
  'Brown patches',
  'Thin spots',
  'Moss',
  'Grubs',
  'Drought stress',
  'Fungus',
];

export const PRODUCT_CATEGORIES = [
  'All',
  'Fertilizers',
  'Herbicides',
  'Fungicides',
  'Soil amendments',
];

export function getSeason(lat: number): string {
  const month = new Date().getMonth(); // 0-11
  const isNorthern = lat >= 0;

  if (isNorthern) {
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Fall';
    return 'Winter';
  } else {
    if (month >= 2 && month <= 4) return 'Fall';
    if (month >= 5 && month <= 7) return 'Winter';
    if (month >= 8 && month <= 10) return 'Spring';
    return 'Summer';
  }
}

export function getTempColor(temp: number): string {
  if (temp < 50) return '#4C9AFF';
  if (temp <= 70) return '#4FAF7A';
  if (temp <= 85) return '#E8A854';
  return '#E85454';
}

export function getSoilStatus(temp: number): { label: string; color: string } {
  if (temp < 40) return { label: 'Too Cold', color: '#4C9AFF' };
  if (temp < 50) return { label: 'Pre-Germination Zone', color: '#4C9AFF' };
  if (temp <= 55) return { label: 'Early Growth Zone', color: '#4FAF7A' };
  if (temp <= 70) return { label: 'Optimal Growth Zone', color: '#4FAF7A' };
  if (temp <= 85) return { label: 'Active Growth Zone', color: '#E8A854' };
  return { label: 'Heat Stress Zone', color: '#E85454' };
}

export function getWeatherIcon(high: number, low: number): 'sunny' | 'cloudsun' | 'rain' {
  const avg = (high + low) / 2;
  if (avg > 75) return 'sunny';
  if (avg > 60) return 'cloudsun';
  return 'rain';
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function getDayName(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}
