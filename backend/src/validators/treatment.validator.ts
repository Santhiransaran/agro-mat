import { z } from "zod";

const treatmentBaseSchema = z.object({
  experimentId: z
    .string()
    .trim()
    .min(1, "Experiment ID is required"),

  treatmentCode: z
    .string()
    .trim()
    .min(1, "Treatment code is required")
    .max(50),

  name: z
    .string()
    .trim()
    .min(2, "Treatment name must contain at least 2 characters")
    .max(200),

  description: z.string().trim().max(2000).optional(),

  agroMatType: z.string().trim().max(100).optional(),

  materialSource: z.string().trim().max(200).optional(),

  thicknessMm: z.number().min(0).optional(),

  density: z.number().min(0).optional(),

  applicationRate: z.number().min(0).optional(),

  isControl: z.boolean().default(false),
});

export const createTreatmentSchema =
  treatmentBaseSchema;

export const updateTreatmentSchema =
  treatmentBaseSchema
    .omit({
      experimentId: true,
      treatmentCode: true,
    })
    .partial();

export type CreateTreatmentInput = z.infer<
  typeof createTreatmentSchema
>;

export type UpdateTreatmentInput = z.infer<
  typeof updateTreatmentSchema
>;