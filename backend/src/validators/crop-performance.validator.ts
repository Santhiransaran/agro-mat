import { z } from "zod";

const cropPerformanceBaseSchema = z.object({
  experimentId: z.string().trim().min(1),

  treatmentId: z.string().trim().min(1),

  plotId: z.string().trim().min(1),

  measurementDate: z.coerce.date(),

  daysAfterPlanting: z.number().int().min(0).optional(),

  plantHeightCm: z.number().min(0).optional(),

  leafCount: z.number().int().min(0).optional(),

  stemDiameterMm: z.number().min(0).optional(),

  canopyWidthCm: z.number().min(0).optional(),

  floweringPlantCount: z.number().int().min(0).optional(),

  fruitCount: z.number().int().min(0).optional(),

  freshBiomassG: z.number().min(0).optional(),

  dryBiomassG: z.number().min(0).optional(),

  yieldKg: z.number().min(0).optional(),

  yieldPerHectareKg: z.number().min(0).optional(),

  survivalRatePercent: z.number().min(0).max(100).optional(),

  notes: z.string().trim().max(2000).optional(),
});

export const createCropPerformanceSchema =
  cropPerformanceBaseSchema;

export const updateCropPerformanceSchema =
  cropPerformanceBaseSchema
    .omit({
      experimentId: true,
      treatmentId: true,
      plotId: true,
    })
    .partial();

export type CreateCropPerformanceInput = z.infer<
  typeof createCropPerformanceSchema
>;

export type UpdateCropPerformanceInput = z.infer<
  typeof updateCropPerformanceSchema
>;