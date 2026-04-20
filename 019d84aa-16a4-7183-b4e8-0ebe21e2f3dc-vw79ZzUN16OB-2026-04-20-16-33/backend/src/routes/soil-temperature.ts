import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { SoilTemperatureData } from "../types";

const soilTemperatureRouter = new Hono();

const querySchema = z.object({
  lat: z.string().transform((val) => {
    const num = parseFloat(val);
    if (isNaN(num) || num < -90 || num > 90) {
      throw new Error("lat must be a number between -90 and 90");
    }
    return num;
  }),
  lng: z.string().transform((val) => {
    const num = parseFloat(val);
    if (isNaN(num) || num < -180 || num > 180) {
      throw new Error("lng must be a number between -180 and 180");
    }
    return num;
  }),
});

interface OpenMeteoResponse {
  timezone: string;
  current: {
    temperature_2m: number;
  };
  hourly: {
    time: string[];
    soil_temperature_0cm: number[];
    soil_temperature_6cm: number[];
    soil_temperature_18cm: number[];
    soil_temperature_54cm: number[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

soilTemperatureRouter.get(
  "/",
  zValidator("query", querySchema),
  async (c) => {
    const { lat, lng } = c.req.valid("query");

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=soil_temperature_0cm,soil_temperature_6cm,soil_temperature_18cm,soil_temperature_54cm&daily=temperature_2m_max,temperature_2m_min&current=temperature_2m&temperature_unit=fahrenheit&timezone=auto&forecast_days=7`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        return c.json(
          { error: { message: "Failed to fetch weather data from Open-Meteo", code: "OPEN_METEO_ERROR" } },
          502
        );
      }

      const raw = (await response.json()) as OpenMeteoResponse;

      // Get the most recent soil temps (first hourly entry)
      const soilTemps = {
        surface: raw.hourly.soil_temperature_0cm[0] ?? 0,
        shallow: raw.hourly.soil_temperature_6cm[0] ?? 0,
        mid: raw.hourly.soil_temperature_18cm[0] ?? 0,
        deep: raw.hourly.soil_temperature_54cm[0] ?? 0,
      };

      const forecast = raw.daily.time.map((date, i) => ({
        date,
        high: raw.daily.temperature_2m_max[i] ?? 0,
        low: raw.daily.temperature_2m_min[i] ?? 0,
      }));

      const result: SoilTemperatureData = {
        soilTemps,
        airTemp: raw.current.temperature_2m,
        forecast,
        timezone: raw.timezone,
      };

      return c.json({ data: result });
    } catch (error) {
      console.error("Error fetching soil temperature:", error);
      return c.json(
        { error: { message: "Internal error fetching soil temperature data", code: "INTERNAL_ERROR" } },
        500
      );
    }
  }
);

export { soilTemperatureRouter };
