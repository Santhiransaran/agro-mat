import { z } from "zod";

const locationSchema = z.object({
  siteName: z
    .string()
    .trim()
    .min(1, "Site name is required")
    .max(200, "Site name is too long"),

  district: z.string().trim().max(100).optional(),

  latitude: z.number().min(-90).max(90).optional(),

  longitude: z.number().min(-180).max(180).optional(),
});

const experimentBaseSchema = z.object({
  experimentCode: z
    .string()
    .trim()
    .min(1, "Experiment code is required")
    .max(50),

  title: z
    .string()
    .trim()
    .min(3, "Title must contain at least 3 characters")
    .max(200),

  description: z.string().trim().max(2000).optional(),

  cropType: z
    .string()
    .trim()
    .min(1, "Crop type is required")
    .max(100),

  cropVariety: z.string().trim().max(100).optional(),

  location: locationSchema,

  startDate: z.coerce.date(),

  endDate: z.coerce.date().optional(),

  objective: z.string().trim().max(2000).optional(),

  methodology: z.string().trim().max(5000).optional(),

  status: z
    .enum(["planned", "active", "completed", "cancelled"])
    .default("planned"),
});

export const createExperimentSchema = experimentBaseSchema.refine(
  (data) => {
    if (!data.endDate) {
      return true;
    }

    return data.endDate >= data.startDate;
  },
  {
    message: "End date cannot be earlier than start date",
    path: ["endDate"],
  }
);

export const updateExperimentSchema = experimentBaseSchema
  .omit({
    experimentCode: true,
  })
  .partial()
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) {
        return true;
      }

      return data.endDate >= data.startDate;
    },
    {
      message: "End date cannot be earlier than start date",
      path: ["endDate"],
    }
  );

export type CreateExperimentInput = z.infer<
  typeof createExperimentSchema
>;

export type UpdateExperimentInput = z.infer<
  typeof updateExperimentSchema
>;