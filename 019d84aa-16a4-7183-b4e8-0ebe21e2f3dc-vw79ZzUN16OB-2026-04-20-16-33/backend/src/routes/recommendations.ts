import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { env } from "../env";
import type { ProductRecommendation } from "../types";

const recommendationsRouter = new Hono();

const bodySchema = z.object({
  soilTemp: z.number(),
  season: z.string().min(1),
  grassType: z.string().min(1),
  issues: z.array(z.string()),
});

const PRODUCT_CATALOG = [
  {
    id: "ym-001",
    name: "0-0-7 Prodiamine Granular Pre-Emergent Herbicide",
    category: "Herbicides",
    type: "granular",
    imageUrl: "https://yardmastery.com/cdn/shop/files/YM_2Bags_Prodiamine-_WebSquare_533x.jpg?v=1705352821",
    purchaseUrl: "https://yardmastery.com/products/prodiamine",
  },
  {
    id: "ym-002",
    name: "Flagship 24-0-6 Granular Lawn Fertilizer with Iron & Bio-Nite",
    category: "Fertilizers",
    type: "granular",
    imageUrl: "https://yardmastery.com/cdn/shop/products/YMFlagship_BothBags_533x.jpg?v=1664802832",
    purchaseUrl: "https://yardmastery.com/products/24-0-6-flagship-granular-lawn-fertilizer-with-iron",
  },
  {
    id: "ym-003",
    name: "Stress Blend 7-0-20 Granular Lawn Fertilizer",
    category: "Fertilizers",
    type: "granular",
    imageUrl: "https://yardmastery.com/cdn/shop/products/YMStressBlend_BothBags_533x.jpg?v=1664543633",
    purchaseUrl: "https://yardmastery.com/products/7-0-20-stress-blend-with-bio-nite",
  },
  {
    id: "ym-004",
    name: "12-12-12 Starter Fertilizer",
    category: "Fertilizers",
    type: "granular",
    imageUrl: "https://yardmastery.com/cdn/shop/products/YMStarter_BothBags_533x.jpg?v=1663764489",
    purchaseUrl: "https://yardmastery.com/products/12-12-12-starter-fertilizer-with-3-iron-and-bio-nite",
  },
  {
    id: "ym-005",
    name: "0-0-1 RGS Root Growth Bio-Stimulant",
    category: "Soil amendments",
    type: "liquid",
    imageUrl: "https://yardmastery.com/cdn/shop/files/1000x1000_RGS_MAINimage_quart_gal_4b9d71ab-6bba-450c-afbd-e9f42458fa09_533x.jpg?v=1742331751",
    purchaseUrl: "https://yardmastery.com/products/rgs-root-growth-liquid-biostimulant",
  },
  {
    id: "ym-006",
    name: "0-0-5 Air-8 Liquid Aeration Bio-Stimulant",
    category: "Soil amendments",
    type: "liquid",
    imageUrl: "https://yardmastery.com/cdn/shop/files/1000x1000_Air-8_MAINimage_quart_gal_533x.jpg?v=1742330978",
    purchaseUrl: "https://yardmastery.com/products/air8-liquid-aeration",
  },
  {
    id: "ym-007",
    name: "0-0-1 Humic12 Bio-Stimulant",
    category: "Soil amendments",
    type: "liquid",
    imageUrl: "https://yardmastery.com/cdn/shop/files/1000x1000_Humic12_MAINimage_quart_gal_533x.jpg?v=1742330281",
    purchaseUrl: "https://yardmastery.com/products/humic12-liquid-biostimulant",
  },
  {
    id: "ym-008",
    name: "0-0-2 MicroGreene Liquid Fertilizer",
    category: "Micronutrients",
    type: "liquid",
    imageUrl: "https://yardmastery.com/cdn/shop/files/1000x1000_MicroGreene_MAINimage_quart_gal_533x.jpg?v=1743104504",
    purchaseUrl: "https://yardmastery.com/products/0-0-2-microgreene-liquid-fertilizer",
  },
  {
    id: "gcl-001",
    name: "0-0-7 Granular Prodiamine Pre-Emergent (Golf Course Lawn)",
    category: "Herbicides",
    type: "granular",
    imageUrl: "https://golfcourselawn.store/cdn/shop/files/GCLSProdiamineonLawn_300x.jpg",
    purchaseUrl: "https://golfcourselawn.store/collections/all/products/0-0-7-granular-prodiamine-pre-emergent-herbicide-fertilizer",
  },
  {
    id: "gcl-002",
    name: "Broadleaf Weed Control - Triad Select 3-Way Herbicide",
    category: "Herbicides",
    type: "liquid",
    imageUrl: "https://golfcourselawn.store/cdn/shop/files/TriadSelectQuartonLawn_300x.jpg",
    purchaseUrl: "https://golfcourselawn.store/collections/all/products/broadleaf-weed-control-triad-select-3-way-herbicide",
  },
  {
    id: "gcl-003",
    name: "Golf Course Lawn 20-2-3 Liquid Fertilizer",
    category: "Fertilizers",
    type: "liquid",
    imageUrl: "https://golfcourselawn.store/cdn/shop/files/GolfCourseLawn20-2-3Fertilizers_300x.jpg",
    purchaseUrl: "https://golfcourselawn.store/collections/all/products/golf-course-lawn-20-2-3-liquid-fertilizer-with-kelp-and-fulvic-acid",
  },
  {
    id: "gcl-004",
    name: "Golf Course Lawn Micronutrient Blend",
    category: "Micronutrients",
    type: "liquid",
    imageUrl: "https://golfcourselawn.store/cdn/shop/files/GolfCourseLawnMicrosFertilizer_300x.jpg",
    purchaseUrl: "https://golfcourselawn.store/collections/all/products/golf-course-lawn-micronutrient-liquid-fertilizer",
  },
  {
    id: "gcl-005",
    name: "Humic Max 16-0-8 Lebanon Country Club Fertilizer",
    category: "Fertilizers",
    type: "granular",
    imageUrl: "https://golfcourselawn.store/cdn/shop/files/16-0-8Fertilizer_300x.jpg",
    purchaseUrl: "https://golfcourselawn.store/collections/all/products/country-club-16-0-8-humic-max-and-mesa-by-lebanonturf-sgn-150",
  },
  {
    id: "gcl-006",
    name: "CarbonizPN Top Dressing Soil Enhancer",
    category: "Soil amendments",
    type: "granular",
    imageUrl: "https://golfcourselawn.store/cdn/shop/files/CarbonizPNonLawn_300x.jpg",
    purchaseUrl: "https://golfcourselawn.store/collections/all/products/carbonizpn-top-dressing-soil-enhancer",
  },
  {
    id: "gcl-007",
    name: "Headway G Fungicide Granular",
    category: "Fungicides",
    type: "granular",
    imageUrl: "https://golfcourselawn.store/cdn/shop/files/HeadwayGonLawn_300x.jpg",
    purchaseUrl: "https://golfcourselawn.store/collections/all/products/headway-g-fungicide-granular",
  },
  {
    id: "gcl-008",
    name: "Pillar SC Liquid Fungicide",
    category: "Fungicides",
    type: "liquid",
    imageUrl: "https://golfcourselawn.store/cdn/shop/files/PillarSConLawn_300x.jpg",
    purchaseUrl: "https://golfcourselawn.store/collections/all/products/pillar-sc-fungicide-liquid-brown-patch-and-dollar-spot-control",
  },
  {
    id: "gcl-009",
    name: "Dimension .15% Pre-Emergent Herbicide",
    category: "Herbicides",
    type: "granular",
    imageUrl: "https://golfcourselawn.store/cdn/shop/files/GCLSDimensiononLawn_300x.jpg",
    purchaseUrl: "https://golfcourselawn.store/collections/all/products/dimension-15-pre-emergent-herbicide-with-fertilizer-0-0-7",
  },
  {
    id: "gcl-010",
    name: "Complete 14-7-14 Lebanon Country Club Fertilizer",
    category: "Fertilizers",
    type: "granular",
    imageUrl: "https://golfcourselawn.store/cdn/shop/files/14-7-14Fertilizer_300x.jpg",
    purchaseUrl: "https://golfcourselawn.store/collections/all/products/lebanon-country-club-complete-fertilizer-14-7-14-sgn-80",
  },
  {
    id: "gcl-011",
    name: "Nutri-Kelp Liquid Kelp",
    category: "Soil amendments",
    type: "liquid",
    imageUrl: "https://golfcourselawn.store/cdn/shop/products/Nutri-Kelp32oz_300x.jpg",
    purchaseUrl: "https://golfcourselawn.store/collections/all/products/nutri-kelp-free-shipping",
  },
] as const;

function getFallbackRecommendations(): ProductRecommendation[] {
  const catalog = PRODUCT_CATALOG as ReadonlyArray<{
    id: string;
    name: string;
    category: string;
    type: string;
    imageUrl: string;
    purchaseUrl: string;
  }>;

  const findById = (id: string) => catalog.find((p) => p.id === id)!;

  return [
    {
      ...findById("ym-001"),
      description: "Blocks crabgrass and annual weeds before they germinate",
      applicationRate: "Apply 3-4 lbs per 1,000 sq ft",
      bestTimeToApply: "Before soil temps reach 55°F in spring",
      priority: "high",
    },
    {
      ...findById("ym-002"),
      description: "Spring fertilizer with iron and Bio-Nite for deep green color and root development",
      applicationRate: "4-5 lbs per 1,000 sq ft",
      bestTimeToApply: "Spring green-up period",
      priority: "high",
    },
    {
      ...findById("ym-003"),
      description: "High-potassium formula to harden turf for summer stress and cooler months",
      applicationRate: "4-5 lbs per 1,000 sq ft",
      bestTimeToApply: "Late summer or early fall",
      priority: "medium",
    },
    {
      ...findById("ym-005"),
      description: "Liquid biostimulant promoting deep root development and drought resistance",
      applicationRate: "3 oz per 1,000 sq ft",
      bestTimeToApply: "Monthly during growing season",
      priority: "medium",
    },
    {
      ...findById("gcl-003"),
      description: "Balanced liquid NPK with kelp and fulvic acid for even green-up",
      applicationRate: "4 oz per 1,000 sq ft",
      bestTimeToApply: "Active growing season every 3-4 weeks",
      priority: "high",
    },
    {
      ...findById("gcl-004"),
      description: "Chelated micronutrients for deep color without surge growth",
      applicationRate: "2 oz per 1,000 sq ft",
      bestTimeToApply: "Any time during growing season, morning preferred",
      priority: "medium",
    },
    {
      ...findById("gcl-007"),
      description: "Dual-active granular fungicide for brown patch, dollar spot, and more",
      applicationRate: "2.3 lbs per 1,000 sq ft",
      bestTimeToApply: "At first sign of disease or preventatively in humid conditions",
      priority: "low",
    },
    {
      ...findById("gcl-006"),
      description: "Carbon-rich soil amendment improving microbial activity and water retention",
      applicationRate: "10 lbs per 1,000 sq ft",
      bestTimeToApply: "Spring or fall soil preparation",
      priority: "low",
    },
  ];
}

recommendationsRouter.post(
  "/",
  zValidator("json", bodySchema),
  async (c) => {
    const { soilTemp, season, grassType, issues } = c.req.valid("json");

    if (!env.OPENAI_API_KEY) {
      return c.json({ data: { recommendations: getFallbackRecommendations() } });
    }

    try {
      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

      const prompt = `You are a lawn care expert. Select 5-8 products from the catalog below that best match the current conditions. Copy the exact id, name, category, type, imageUrl, and purchaseUrl from the catalog entry. Generate appropriate description, applicationRate, bestTimeToApply, and priority based on the conditions.

Current conditions:
- Soil temperature: ${soilTemp}F
- Season: ${season}
- Grass type: ${grassType}
- Current issues: ${issues.length > 0 ? issues.join(", ") : "None reported"}

Product catalog:
${JSON.stringify(PRODUCT_CATALOG, null, 2)}

Return a JSON array. Each item must have ALL of these exact fields:
- id: copied exactly from the catalog entry (e.g. "ym-001")
- name: copied exactly from the catalog entry
- category: copied exactly from the catalog entry
- type: copied exactly from the catalog entry ("granular" or "liquid")
- imageUrl: copied exactly from the catalog entry
- purchaseUrl: copied exactly from the catalog entry
- description: brief description of the product and why it suits the current conditions
- applicationRate: specific rate per 1,000 sq ft
- bestTimeToApply: when to apply given the current conditions
- priority: "high", "medium", or "low" based on urgency given the conditions

Return ONLY the JSON array, no markdown, no code fences, no other text.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        return c.json({ data: { recommendations: getFallbackRecommendations() } });
      }

      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const recommendations = JSON.parse(cleaned) as ProductRecommendation[];

      return c.json({ data: { recommendations } });
    } catch (error) {
      console.error("Error generating recommendations:", error);
      return c.json({ data: { recommendations: getFallbackRecommendations() } });
    }
  }
);

export { recommendationsRouter };
