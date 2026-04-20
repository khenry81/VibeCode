import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { env } from "../env";
import type { CalendarTask } from "../types";

const calendarSuggestionsRouter = new Hono();

const bodySchema = z.object({
  soilTemp: z.number(),
  season: z.string().min(1),
  grassType: z.string().min(1),
  zipCode: z.string().min(1),
});

const PRODUCT_CATALOG: Record<string, { imageUrl: string; purchaseUrl: string; name: string }> = {
  "ym-001": {
    name: "0-0-7 Prodiamine Granular Pre-Emergent Herbicide",
    imageUrl: "https://yardmastery.com/cdn/shop/files/YM_2Bags_Prodiamine-_WebSquare_533x.jpg?v=1705352821",
    purchaseUrl: "https://yardmastery.com/products/prodiamine",
  },
  "ym-002": {
    name: "Flagship 24-0-6 Granular Lawn Fertilizer with Iron & Bio-Nite",
    imageUrl: "https://yardmastery.com/cdn/shop/products/YMFlagship_BothBags_533x.jpg?v=1664802832",
    purchaseUrl: "https://yardmastery.com/products/24-0-6-flagship-granular-lawn-fertilizer-with-iron",
  },
  "ym-003": {
    name: "Stress Blend 7-0-20 Granular Lawn Fertilizer",
    imageUrl: "https://yardmastery.com/cdn/shop/products/YMStressBlend_BothBags_533x.jpg?v=1664543633",
    purchaseUrl: "https://yardmastery.com/products/7-0-20-stress-blend-with-bio-nite",
  },
  "ym-004": {
    name: "12-12-12 Starter Fertilizer",
    imageUrl: "https://yardmastery.com/cdn/shop/products/YMStarter_BothBags_533x.jpg?v=1663764489",
    purchaseUrl: "https://yardmastery.com/products/12-12-12-starter-fertilizer-with-3-iron-and-bio-nite",
  },
  "ym-005": {
    name: "0-0-1 RGS Root Growth Bio-Stimulant",
    imageUrl: "https://yardmastery.com/cdn/shop/files/1000x1000_RGS_MAINimage_quart_gal_4b9d71ab-6bba-450c-afbd-e9f42458fa09_533x.jpg?v=1742331751",
    purchaseUrl: "https://yardmastery.com/products/rgs-root-growth-liquid-biostimulant",
  },
  "ym-006": {
    name: "0-0-5 Air-8 Liquid Aeration Bio-Stimulant",
    imageUrl: "https://yardmastery.com/cdn/shop/files/1000x1000_Air-8_MAINimage_quart_gal_533x.jpg?v=1742330978",
    purchaseUrl: "https://yardmastery.com/products/air8-liquid-aeration",
  },
  "ym-007": {
    name: "0-0-1 Humic12 Bio-Stimulant",
    imageUrl: "https://yardmastery.com/cdn/shop/files/1000x1000_Humic12_MAINimage_quart_gal_533x.jpg?v=1742330281",
    purchaseUrl: "https://yardmastery.com/products/humic12-liquid-biostimulant",
  },
  "ym-008": {
    name: "0-0-2 MicroGreene Liquid Fertilizer",
    imageUrl: "https://yardmastery.com/cdn/shop/files/1000x1000_MicroGreene_MAINimage_quart_gal_533x.jpg?v=1743104504",
    purchaseUrl: "https://yardmastery.com/products/0-0-2-microgreene-liquid-fertilizer",
  },
  "gcl-001": {
    name: "0-0-7 Granular Prodiamine Pre-Emergent (Golf Course Lawn)",
    imageUrl: "https://golfcourselawn.store/cdn/shop/files/GCLSProdiamineonLawn_300x.jpg",
    purchaseUrl: "https://golfcourselawn.store/collections/all/products/0-0-7-granular-prodiamine-pre-emergent-herbicide-fertilizer",
  },
  "gcl-002": {
    name: "Broadleaf Weed Control - Triad Select 3-Way Herbicide",
    imageUrl: "https://golfcourselawn.store/cdn/shop/files/TriadSelectQuartonLawn_300x.jpg",
    purchaseUrl: "https://golfcourselawn.store/collections/all/products/broadleaf-weed-control-triad-select-3-way-herbicide",
  },
  "gcl-003": {
    name: "Golf Course Lawn 20-2-3 Liquid Fertilizer",
    imageUrl: "https://golfcourselawn.store/cdn/shop/files/GolfCourseLawn20-2-3Fertilizers_300x.jpg",
    purchaseUrl: "https://golfcourselawn.store/collections/all/products/golf-course-lawn-20-2-3-liquid-fertilizer-with-kelp-and-fulvic-acid",
  },
  "gcl-004": {
    name: "Golf Course Lawn Micronutrient Blend",
    imageUrl: "https://golfcourselawn.store/cdn/shop/files/GolfCourseLawnMicrosFertilizer_300x.jpg",
    purchaseUrl: "https://golfcourselawn.store/collections/all/products/golf-course-lawn-micronutrient-liquid-fertilizer",
  },
  "gcl-005": {
    name: "Humic Max 16-0-8 Lebanon Country Club Fertilizer",
    imageUrl: "https://golfcourselawn.store/cdn/shop/files/16-0-8Fertilizer_300x.jpg",
    purchaseUrl: "https://golfcourselawn.store/collections/all/products/country-club-16-0-8-humic-max-and-mesa-by-lebanonturf-sgn-150",
  },
  "gcl-006": {
    name: "CarbonizPN Top Dressing Soil Enhancer",
    imageUrl: "https://golfcourselawn.store/cdn/shop/files/CarbonizPNonLawn_300x.jpg",
    purchaseUrl: "https://golfcourselawn.store/collections/all/products/carbonizpn-top-dressing-soil-enhancer",
  },
  "gcl-007": {
    name: "Headway G Fungicide Granular",
    imageUrl: "https://golfcourselawn.store/cdn/shop/files/HeadwayGonLawn_300x.jpg",
    purchaseUrl: "https://golfcourselawn.store/collections/all/products/headway-g-fungicide-granular",
  },
  "gcl-008": {
    name: "Pillar SC Liquid Fungicide",
    imageUrl: "https://golfcourselawn.store/cdn/shop/files/PillarSConLawn_300x.jpg",
    purchaseUrl: "https://golfcourselawn.store/collections/all/products/pillar-sc-fungicide-liquid-brown-patch-and-dollar-spot-control",
  },
  "gcl-009": {
    name: "Dimension .15% Pre-Emergent Herbicide",
    imageUrl: "https://golfcourselawn.store/cdn/shop/files/GCLSDimensiononLawn_300x.jpg",
    purchaseUrl: "https://golfcourselawn.store/collections/all/products/dimension-15-pre-emergent-herbicide-with-fertilizer-0-0-7",
  },
  "gcl-010": {
    name: "Complete 14-7-14 Lebanon Country Club Fertilizer",
    imageUrl: "https://golfcourselawn.store/cdn/shop/files/14-7-14Fertilizer_300x.jpg",
    purchaseUrl: "https://golfcourselawn.store/collections/all/products/lebanon-country-club-complete-fertilizer-14-7-14-sgn-80",
  },
};

function getFallbackTasks(): CalendarTask[] {
  const today = new Date();
  const tasks: CalendarTask[] = [];

  const addDays = (date: Date, days: number): string => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString().split("T")[0]!;
  };

  tasks.push(
    // NOW (week 1) - Pre-emergent if not done
    {
      id: "task-1",
      title: "Apply Pre-Emergent Herbicide",
      description: "Apply 0-0-7 Prodiamine Granular Pre-Emergent to block crabgrass and annual weeds. Soil temps approaching 55°F window.",
      suggestedDate: addDays(today, 2),
      category: "Weed Control",
      priority: "high",
      productName: PRODUCT_CATALOG["ym-001"]!.name,
      productBrand: "Yard Mastery",
      imageUrl: PRODUCT_CATALOG["ym-001"]!.imageUrl,
      purchaseUrl: PRODUCT_CATALOG["ym-001"]!.purchaseUrl,
    },
    // Week 2 - Spring fertilizer
    {
      id: "task-2",
      title: "Spring Fertilizer Application",
      description: "Feed lawn with Humic Max 16-0-8 Lebanon Country Club Fertilizer for spring green-up and root development. Apply at 4-5 lbs per 1,000 sq ft.",
      suggestedDate: addDays(today, 10),
      category: "Fertilization",
      priority: "high",
      productName: PRODUCT_CATALOG["gcl-005"]!.name,
      productBrand: "Golf Course Lawn",
      imageUrl: PRODUCT_CATALOG["gcl-005"]!.imageUrl,
      purchaseUrl: PRODUCT_CATALOG["gcl-005"]!.purchaseUrl,
    },
    // Week 3 - Iron & micronutrient
    {
      id: "task-3",
      title: "Iron & Micronutrient Spray",
      description: "Apply Golf Course Lawn Micronutrient Blend to boost color and fill micronutrient gaps. Mix 2 oz per 1,000 sq ft and spray in morning.",
      suggestedDate: addDays(today, 18),
      category: "Fertilization",
      priority: "medium",
      productName: PRODUCT_CATALOG["gcl-004"]!.name,
      productBrand: "Golf Course Lawn",
      imageUrl: PRODUCT_CATALOG["gcl-004"]!.imageUrl,
      purchaseUrl: PRODUCT_CATALOG["gcl-004"]!.purchaseUrl,
    },
    // ~3 weeks - Preventive fungicide (before warm/humid conditions)
    {
      id: "task-f1",
      title: "Preventive Fungicide Application",
      description: "Apply Headway G granular fungicide preventively before warm, humid conditions arrive. Prevents brown patch, dollar spot, and other summer diseases before they start.",
      suggestedDate: addDays(today, 22),
      category: "Disease Control",
      priority: "medium",
      productName: PRODUCT_CATALOG["gcl-007"]!.name,
      productBrand: "Golf Course Lawn",
      imageUrl: PRODUCT_CATALOG["gcl-007"]!.imageUrl,
      purchaseUrl: PRODUCT_CATALOG["gcl-007"]!.purchaseUrl,
    },
    // Week 4 - Soil booster
    {
      id: "task-4",
      title: "Biological Soil Booster Application",
      description: "Spray RGS Root Growth Bio-Stimulant to introduce beneficial microbes and improve nutrient uptake. Apply 3 oz per 1,000 sq ft.",
      suggestedDate: addDays(today, 28),
      category: "Soil Health",
      priority: "medium",
      productName: PRODUCT_CATALOG["ym-005"]!.name,
      productBrand: "Yard Mastery",
      imageUrl: PRODUCT_CATALOG["ym-005"]!.imageUrl,
      purchaseUrl: PRODUCT_CATALOG["ym-005"]!.purchaseUrl,
    },
    // ~5-6 weeks - GCL balanced fertilizer
    {
      id: "task-5",
      title: "GCL Balanced Fertilizer Round",
      description: "Apply Golf Course Lawn 20-2-3 Liquid Fertilizer for a balanced NPK boost with kelp and fulvic acid. Delivers golf-course-quality results at 3.5 lbs/1,000 sq ft.",
      suggestedDate: addDays(today, 38),
      category: "Fertilization",
      priority: "high",
      productName: PRODUCT_CATALOG["gcl-003"]!.name,
      productBrand: "Golf Course Lawn",
      imageUrl: PRODUCT_CATALOG["gcl-003"]!.imageUrl,
      purchaseUrl: PRODUCT_CATALOG["gcl-003"]!.purchaseUrl,
    },
    // ~7 weeks - Second pre-emergent (split app)
    {
      id: "task-6",
      title: "Second Pre-Emergent Application",
      description: "Split pre-emergent application with Dimension .15% Pre-Emergent Herbicide. Apply before summer heat to extend weed-prevention window.",
      suggestedDate: addDays(today, 48),
      category: "Weed Control",
      priority: "medium",
      productName: PRODUCT_CATALOG["gcl-009"]!.name,
      productBrand: "Golf Course Lawn",
      imageUrl: PRODUCT_CATALOG["gcl-009"]!.imageUrl,
      purchaseUrl: PRODUCT_CATALOG["gcl-009"]!.purchaseUrl,
    },
    // ~8 weeks - Mid-season fungicide reapplication
    {
      id: "task-f2",
      title: "Mid-Season Fungicide Reapplication",
      description: "Reapply fungicide as temperatures rise and humidity increases. Pillar SC liquid fungicide provides systemic protection against brown patch, pythium, and dollar spot.",
      suggestedDate: addDays(today, 55),
      category: "Disease Control",
      priority: "medium",
      productName: PRODUCT_CATALOG["gcl-008"]!.name,
      productBrand: "Golf Course Lawn",
      imageUrl: PRODUCT_CATALOG["gcl-008"]!.imageUrl,
      purchaseUrl: PRODUCT_CATALOG["gcl-008"]!.purchaseUrl,
    },
    // ~8-9 weeks - Mowing / first summer prep
    {
      id: "task-7",
      title: "Sharpen Mower Blades",
      description: "Before summer growth flush, sharpen or replace mower blades for clean cuts that reduce disease pressure.",
      suggestedDate: addDays(today, 58),
      category: "Equipment Maintenance",
      priority: "medium",
    },
    // ~10 weeks - BioChar soil amendment
    {
      id: "task-8",
      title: "BioChar Soil Amendment",
      description: "Apply CarbonizPN Top Dressing Soil Enhancer to improve water retention and microbial activity heading into summer. 10 lbs per 1,000 sq ft.",
      suggestedDate: addDays(today, 68),
      category: "Soil Health",
      priority: "low",
      productName: PRODUCT_CATALOG["gcl-006"]!.name,
      productBrand: "Golf Course Lawn",
      imageUrl: PRODUCT_CATALOG["gcl-006"]!.imageUrl,
      purchaseUrl: PRODUCT_CATALOG["gcl-006"]!.purchaseUrl,
    },
    // ~11-12 weeks - Summer fertilizer
    {
      id: "task-9",
      title: "Summer Fertilizer Application",
      description: "Apply Flagship 24-0-6 Granular Lawn Fertilizer for summer feeding. Light rate on warm-season grasses; reduce or skip on cool-season in heat.",
      suggestedDate: addDays(today, 78),
      category: "Fertilization",
      priority: "high",
      productName: PRODUCT_CATALOG["ym-002"]!.name,
      productBrand: "Yard Mastery",
      imageUrl: PRODUCT_CATALOG["ym-002"]!.imageUrl,
      purchaseUrl: PRODUCT_CATALOG["ym-002"]!.purchaseUrl,
    },
    // ~12 weeks - Late summer fungicide protection
    {
      id: "task-f3",
      title: "Late Summer Fungicide Protection",
      description: "Final preventive fungicide pass before fall. Headway G granular provides 4-week residual protection as cooler, wetter fall conditions create disease pressure.",
      suggestedDate: addDays(today, 82),
      category: "Disease Control",
      priority: "low",
      productName: PRODUCT_CATALOG["gcl-007"]!.name,
      productBrand: "Golf Course Lawn",
      imageUrl: PRODUCT_CATALOG["gcl-007"]!.imageUrl,
      purchaseUrl: PRODUCT_CATALOG["gcl-007"]!.purchaseUrl,
    },
    // ~13 weeks - Disease inspection
    {
      id: "task-10",
      title: "Inspect for Fungal Disease",
      description: "Check for brown patch, dollar spot, or pythium as temps and humidity rise. Treat early with Headway G Fungicide Granular if caught.",
      suggestedDate: addDays(today, 90),
      category: "Disease Control",
      priority: "medium",
      productName: PRODUCT_CATALOG["gcl-007"]!.name,
      productBrand: "Golf Course Lawn",
      imageUrl: PRODUCT_CATALOG["gcl-007"]!.imageUrl,
      purchaseUrl: PRODUCT_CATALOG["gcl-007"]!.purchaseUrl,
    }
  );

  return tasks;
}

calendarSuggestionsRouter.post(
  "/",
  zValidator("json", bodySchema),
  async (c) => {
    const { soilTemp, season, grassType, zipCode } = c.req.valid("json");

    if (!env.OPENAI_API_KEY) {
      return c.json({ data: { tasks: getFallbackTasks() } });
    }

    try {
      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

      const today = new Date().toISOString().split("T")[0];

      const catalogJson = JSON.stringify(PRODUCT_CATALOG, null, 2);

      const prompt = `You are a lawn care expert. Generate a lawn care calendar for the next 3 months.

Conditions:
- Today's date: ${today}
- Current soil temperature: ${soilTemp}F
- Season: ${season}
- Grass type: ${grassType}
- Zip code: ${zipCode}

Use ONLY products from the following catalog when a task involves product application. Copy the exact imageUrl and purchaseUrl from the catalog entry for any product you reference.

PRODUCT_CATALOG:
${catalogJson}

Generate 8-12 tasks spread across the next 3 months. Each task must have these exact fields:
- id: unique string like "task-1", "task-2", etc.
- title: short task name
- description: 1-2 sentence description with specific advice
- suggestedDate: date in YYYY-MM-DD format
- category: one of "Fertilization", "Weed Control", "Mowing", "Watering", "Disease Control", "Soil Health", "Equipment Maintenance", "Overseeding", "Aeration"
- priority: "high", "medium", or "low"

IMPORTANT: Always include at least 3 preventive fungicide application tasks spread across the season as "Disease Control" category tasks: one early (before warm/humid conditions arrive, ~3 weeks out), one mid-season (as temperatures peak, ~7-8 weeks out), and one late summer (before fall, ~11-12 weeks out). Use gcl-007 (Headway G Fungicide Granular) and gcl-008 (Pillar SC Liquid Fungicide) from the catalog for these tasks.

Each task may optionally include:
- productName: use the exact "name" field from the catalog entry
- productBrand: "Yard Mastery" or "Golf Course Lawn" (or omit if no specific product applies)
- imageUrl: copy the exact "imageUrl" from the matching catalog entry (omit if no product)
- purchaseUrl: copy the exact "purchaseUrl" from the matching catalog entry (omit if no product)

Return ONLY the JSON array, no markdown or other text.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        return c.json({ data: { tasks: getFallbackTasks() } });
      }

      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const tasks = JSON.parse(cleaned) as CalendarTask[];

      return c.json({ data: { tasks } });
    } catch (error) {
      console.error("Error generating calendar suggestions:", error);
      return c.json({ data: { tasks: getFallbackTasks() } });
    }
  }
);

export { calendarSuggestionsRouter };
