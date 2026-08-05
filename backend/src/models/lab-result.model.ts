import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const labResultSchema = new Schema(
  {
    experimentId: {
      type: Schema.Types.ObjectId,
      ref: "Experiment",
      required: [true, "Experiment ID is required"],
      index: true,
    },

    treatmentId: {
      type: Schema.Types.ObjectId,
      ref: "Treatment",
      index: true,
    },

    plotId: {
      type: Schema.Types.ObjectId,
      ref: "Plot",
      index: true,
    },

    sampleCode: {
      type: String,
      required: [true, "Sample code is required"],
      trim: true,
      uppercase: true,
    },

    sampleType: {
      type: String,
      required: [true, "Sample type is required"],
      enum: ["soil", "plant", "water", "agro_mat"],
    },

    collectionDate: {
      type: Date,
      required: [true, "Collection date is required"],
    },

    analysisDate: {
      type: Date,
    },

    parameter: {
      type: String,
      required: [true, "Parameter is required"],
      trim: true,
      maxlength: 200,
    },

    value: {
      type: Number,
      required: [true, "Value is required"],
    },

    unit: {
      type: String,
      required: [true, "Unit is required"],
      trim: true,
      maxlength: 50,
    },

    method: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    laboratoryName: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    technician: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    qualityStatus: {
      type: String,
      enum: ["valid", "questionable", "rejected"],
      default: "valid",
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

labResultSchema.index({
  experimentId: 1,
  treatmentId: 1,
  plotId: 1,
  sampleCode: 1,
  parameter: 1,
});

export type LabResult = InferSchemaType<
  typeof labResultSchema
>;

export type LabResultDocument =
  HydratedDocument<LabResult>;

export const LabResultModel = model<LabResult>(
  "LabResult",
  labResultSchema
);