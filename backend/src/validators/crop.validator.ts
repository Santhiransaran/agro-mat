import { z } from "zod";

export const createCropSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),

    variety: z.string().max(100).optional(),

    plantingDate: z.coerce.date(),

    expectedHarvestDate: z.coerce.date().optional(),

    farmArea: z.number().positive(),

    areaUnit: z
      .enum(["acre", "hectare", "square_meter"])
      .default("acre"),

    notes: z.string().max(500).optional(),
  }),
});