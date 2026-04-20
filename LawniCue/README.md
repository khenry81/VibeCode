# LawnIQ - AI-Powered Lawn Care Assistant

An intelligent lawn care companion that monitors soil conditions, recommends products, and schedules maintenance tasks based on your location and lawn profile.

## Features

### Dashboard (Home Tab)
- Real-time soil temperature readings at 4 depths (surface, 2in, 7in, 21in)
- Current air temperature display
- 7-day weather forecast with high/low temps
- Quick action cards for Products and Calendar
- Next upcoming task preview
- Auto-detects location via GPS

### Calendar Tab
- Interactive calendar with color-coded task markers
- AI-generated lawn care schedule for the next 3 months
- Tasks categorized: Fertilization, Weed Control, Mowing, Watering, Disease Control, Soil Health, Equipment Maintenance
- Tap any date to see scheduled tasks

### Products Tab
- AI-powered product recommendations based on soil temp, season, grass type, and lawn issues
- Categories: Fertilizers, Herbicides, Fungicides, Micronutrients, Soil Amendments
- Filter by category
- Each product shows application rate, best time to apply, and priority level
- Pull-to-refresh for updated recommendations

### Settings Tab
- Location management (auto-detect or manual zip code)
- Grass type selection (Bermuda, Fescue, Kentucky Bluegrass, Zoysia, St. Augustine, etc.)
- Lawn size input
- Common issues tracker (Weeds, Brown patches, Thin spots, Moss, Grubs, etc.)

## Tech Stack

- **Frontend:** Expo SDK 53, React Native, NativeWind, React Query, Zustand
- **Backend:** Bun, Hono, Zod validation
- **APIs:** Open-Meteo (soil/weather data), OpenAI (AI recommendations)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/soil-temperature?lat=&lng=` | Real-time soil temperature data |
| POST | `/api/recommendations` | AI product recommendations |
| POST | `/api/calendar-suggestions` | AI calendar task generation |
