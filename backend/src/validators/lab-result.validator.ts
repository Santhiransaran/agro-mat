import { z } from "zod";

const labResultBaseSchema = z
  .object({
    experimentId: z
      .string()
      .trim()
      .min(1, "Experiment ID is required"),

    treatmentId: z.string().trim().optional(),

    plotId: z.string().trim().optional(),

    sampleCode: z
      .string()
      .trim()
      .min(1, "Sample code is required")
      .max(100),

    sampleType: z.enum([
      "soil",
      "plant",
      "water",
      "agro_mat",
    ]),

    collectionDate: z.coerce.date(),

    analysisDate: z.coerce.date().optional(),

    parameter: z
      .string()
      .trim()
      .min(1, "Parameter is required")
      .max(200),

    value: z.number(),

    unit: z
      .string()
      .trim()
      .min(1, "Unit is required")
      .max(50),

    method: z.string().trim().max(200).optional(),

    laboratoryName: z
      .string()
      .trim()
      .max(200)
      .optional(),

    technician: z
      .string()
      .trim()
      .max(200)
      .optional(),

    qualityStatus: z
      .enum(["valid", "questionable", "rejected"])
      .default("valid"),

    notes: z.string().trim().max(2000).optional(),
  })
  .refine(
    (data) => {
      if (!data.analysisDate) {
        return true;
      }

      return data.analysisDate >= data.collectionDate;
    },
    {
      message:
        "Analysis date cannot be earlier than collection date",
      path: ["analysisDate"],
    }
  );

const labResultBaseObject = z.object({
  experimentId: z.string().trim().min(1),

  treatmentId: z.string().trim().optional(),

  plotId: z.string().trim().optional(),

  sampleCode: z.string().trim().min(1).max(100),

  sampleType: z.enum([
    "soil",
    "plant",
    "water",
    "agro_mat",
  ]),

  collectionDate: z.coerce.date(),

  analysisDate: z.coerce.date().optional(),

  parameter: z.string().trim().min(1).max(200),

  value: z.number(),

  unit: z.string().trim().min(1).max(50),

  method: z.string().trim().max(200).optional(),

  laboratoryName: z
    .string()
    .trim()
    .max(200)
    .optional(),

  technician: z.string().trim().max(200).optional(),

  qualityStatus: z
    .enum(["valid", "questionable", "rejected"])
    .default("valid"),

  notes: z.string().trim().max(2000).optional(),
});

export const createLabResultSchema =
  labResultBaseSchema;

export const updateLabResultSchema =
  labResultBaseObject
    .omit({
      experimentId: true,
      treatmentId: true,
      plotId: true,
      sampleCode: true,
    })
    .partial()
    .refine(
      (data) => {
        if (
          !data.collectionDate ||
          !data.analysisDate
        ) {
          return true;
        }

        return (
          data.analysisDate >= data.collectionDate
        );
      },
      {
        message:
          "Analysis date cannot be earlier than collection date",
        path: ["analysisDate"],
      }
    );

export type CreateLabResultInput = z.infer<
  typeof createLabResultSchema
>;

export type UpdateLabResultInput = z.infer<
  typeof updateLabResultSchema
>;