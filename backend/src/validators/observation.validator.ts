import { z } from "zod";

const percentageSchema = z.number().min(0).max(100);

const observationBaseSchema = z.object({
  experimentId: z
    .string()
    .trim()
    .min(1, "Experiment ID is required"),

  treatmentId: z
    .string()
    .trim()
    .min(1, "Treatment ID is required"),

  plotId: z
    .string()
    .trim()
    .min(1, "Plot ID is required"),

  observationDate: z.coerce.date(),

  daysAfterPlanting: z.number().int().min(0).optional(),

  soilMoisturePercent: percentageSchema.optional(),

  soilTemperatureC: z.number().min(-50).max(100).optional(),

  airTemperatureC: z.number().min(-50).max(100).optional(),

  relativeHumidityPercent: percentageSchema.optional(),

  weedCoveragePercent: percentageSchema.optional(),

  pestIncidencePercent: percentageSchema.optional(),

  diseaseIncidencePercent: percentageSchema.optional(),

  matDegradationPercent: percentageSchema.optional(),

  matCondition: z
    .enum(["excellent", "good", "fair", "poor"])
    .optional(),

  irrigationAmountMm: z.number().min(0).optional(),

  notes: z.string().trim().max(2000).optional(),
});

export const createObservationSchema =
  observationBaseSchema;

export const updateObservationSchema =
  observationBaseSchema
    .omit({
      experimentId: true,
      treatmentId: true,
      plotId: true,
    })
    .partial();

export type CreateObservationInput = z.infer<
  typeof createObservationSchema
>;

export type UpdateObservationInput = z.infer<
  typeof updateObservationSchema
>;