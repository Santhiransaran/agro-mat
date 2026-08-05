import { z } from "zod";

const plotBaseSchema = z.object({
  experimentId: z
    .string()
    .trim()
    .min(1, "Experiment ID is required"),

  treatmentId: z
    .string()
    .trim()
    .min(1, "Treatment ID is required"),

  plotCode: z
    .string()
    .trim()
    .min(1, "Plot code is required")
    .max(50),

  replicateNumber: z
    .number()
    .int()
    .min(1, "Replicate number must be at least 1"),

  areaSquareMeters: z.number().min(0).optional(),

  rowCount: z.number().int().min(0).optional(),

  plantCount: z.number().int().min(0).optional(),

  soilType: z.string().trim().max(100).optional(),

  notes: z.string().trim().max(2000).optional(),
});

export const createPlotSchema = plotBaseSchema;

export const updatePlotSchema = plotBaseSchema
  .omit({
    experimentId: true,
    treatmentId: true,
    plotCode: true,
  })
  .partial();

export type CreatePlotInput = z.infer<
  typeof createPlotSchema
>;

export type UpdatePlotInput = z.infer<
  typeof updatePlotSchema
>;