import { z } from "zod";

const weatherBaseSchema = z
  .object({
    experimentId: z
      .string()
      .trim()
      .min(1, "Experiment ID is required"),

    recordedAt: z.coerce.date(),

    source: z
      .enum(["manual", "sensor", "weather_api"])
      .default("manual"),

    temperatureC: z
      .number()
      .min(-50)
      .max(70)
      .optional(),

    minimumTemperatureC: z
      .number()
      .min(-50)
      .max(70)
      .optional(),

    maximumTemperatureC: z
      .number()
      .min(-50)
      .max(70)
      .optional(),

    relativeHumidityPercent: z
      .number()
      .min(0)
      .max(100)
      .optional(),

    rainfallMm: z.number().min(0).optional(),

    windSpeedKmh: z.number().min(0).optional(),

    solarRadiation: z.number().min(0).optional(),

    weatherCondition: z
      .string()
      .trim()
      .max(100)
      .optional(),

    notes: z.string().trim().max(2000).optional(),
  })
  .refine(
    (data) => {
      if (
        data.minimumTemperatureC === undefined ||
        data.maximumTemperatureC === undefined
      ) {
        return true;
      }

      return (
        data.maximumTemperatureC >=
        data.minimumTemperatureC
      );
    },
    {
      message:
        "Maximum temperature cannot be lower than minimum temperature",
      path: ["maximumTemperatureC"],
    }
  );

const weatherBaseObject = z.object({
  experimentId: z.string().trim().min(1),

  recordedAt: z.coerce.date(),

  source: z
    .enum(["manual", "sensor", "weather_api"])
    .default("manual"),

  temperatureC: z.number().min(-50).max(70).optional(),

  minimumTemperatureC: z
    .number()
    .min(-50)
    .max(70)
    .optional(),

  maximumTemperatureC: z
    .number()
    .min(-50)
    .max(70)
    .optional(),

  relativeHumidityPercent: z
    .number()
    .min(0)
    .max(100)
    .optional(),

  rainfallMm: z.number().min(0).optional(),

  windSpeedKmh: z.number().min(0).optional(),

  solarRadiation: z.number().min(0).optional(),

  weatherCondition: z
    .string()
    .trim()
    .max(100)
    .optional(),

  notes: z.string().trim().max(2000).optional(),
});

export const createWeatherSchema = weatherBaseSchema;

export const updateWeatherSchema = weatherBaseObject
  .omit({
    experimentId: true,
  })
  .partial()
  .refine(
    (data) => {
      if (
        data.minimumTemperatureC === undefined ||
        data.maximumTemperatureC === undefined
      ) {
        return true;
      }

      return (
        data.maximumTemperatureC >=
        data.minimumTemperatureC
      );
    },
    {
      message:
        "Maximum temperature cannot be lower than minimum temperature",
      path: ["maximumTemperatureC"],
    }
  );

export type CreateWeatherInput = z.infer<
  typeof createWeatherSchema
>;

export type UpdateWeatherInput = z.infer<
  typeof updateWeatherSchema
>;