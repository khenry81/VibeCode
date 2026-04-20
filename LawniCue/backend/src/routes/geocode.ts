import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const geocodeRouter = new Hono();

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

interface BigDataCloudResponse {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  principalSubdivisionCode?: string;
  postcode?: string;
  countryName?: string;
  countryCode?: string;
  localityInfo?: {
    administrative?: Array<{
      name: string;
      order: number;
      adminLevel: number;
    }>;
  };
}

geocodeRouter.get("/", zValidator("query", querySchema), async (c) => {
  const { lat, lng } = c.req.valid("query");

  try {
    // Use BigDataCloud's free reverse geocoding API
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;

    const response = await fetch(url);

    if (!response.ok) {
      return c.json(
        { error: { message: "Failed to fetch geocode data", code: "GEOCODE_ERROR" } },
        502
      );
    }

    const data = (await response.json()) as BigDataCloudResponse;

    // Extract city - try multiple fields
    let city = data.city || data.locality || "";

    // If no city, try to find it in localityInfo
    if (!city && data.localityInfo?.administrative) {
      const cityLevel = data.localityInfo.administrative.find(
        (a) => a.adminLevel >= 7 && a.adminLevel <= 8
      );
      if (cityLevel) {
        city = cityLevel.name;
      }
    }

    // Extract state from principalSubdivision or principalSubdivisionCode
    let state = "";
    if (data.principalSubdivisionCode) {
      // Extract state code from format like "US-NY" -> "NY"
      const parts = data.principalSubdivisionCode.split("-");
      state = (parts.length > 1 ? parts[1] : data.principalSubdivision) ?? "";
    } else if (data.principalSubdivision) {
      state = data.principalSubdivision;
    }

    const result = {
      city: city || "Unknown",
      state: state || "",
      zipCode: data.postcode ?? "",
      country: data.countryCode ?? "",
    };

    return c.json({ data: result });
  } catch (error) {
    console.error("Error fetching geocode data:", error);
    return c.json(
      { error: { message: "Internal error fetching geocode data", code: "INTERNAL_ERROR" } },
      500
    );
  }
});

export { geocodeRouter };
