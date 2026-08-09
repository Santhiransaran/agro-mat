import { z } from "zod";

export const createSensorReadingSchema =
  z.object({
    body: z.object({
      deviceId: z.string().min(3).max(50),

      timestamp: z.coerce.date().optional(),

      nitrogen: z.number().min(0),

      phosphorus: z.number().min(0),

      potassium: z.number().min(0),

      ph: z.number().min(0).max(14),

      ec: z.number().min(0),

      soilMoisture: z
        .number()
        .min(0)
        .max(100),

      soilTemperature: z
        .number()
        .min(-20)
        .max(80)
        .optional(),

      airTemperature: z
        .number()
        .min(-20)
        .max(80),

      humidity: z
        .number()
        .min(0)
        .max(100),
    }),
  });