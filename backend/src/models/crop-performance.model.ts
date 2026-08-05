import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const cropPerformanceSchema = new Schema(
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
      required: [true, "Treatment ID is required"],
      index: true,
    },

    plotId: {
      type: Schema.Types.ObjectId,
      ref: "Plot",
      required: [true, "Plot ID is required"],
      index: true,
    },

    measurementDate: {
      type: Date,
      required: [true, "Measurement date is required"],
      index: true,
    },

    daysAfterPlanting: {
      type: Number,
      min: 0,
    },

    plantHeightCm: {
      type: Number,
      min: 0,
    },

    leafCount: {
      type: Number,
      min: 0,
    },

    stemDiameterMm: {
      type: Number,
      min: 0,
    },

    canopyWidthCm: {
      type: Number,
      min: 0,
    },

    floweringPlantCount: {
      type: Number,
      min: 0,
    },

    fruitCount: {
      type: Number,
      min: 0,
    },

    freshBiomassG: {
      type: Number,
      min: 0,
    },

    dryBiomassG: {
      type: Number,
      min: 0,
    },

    yieldKg: {
      type: Number,
      min: 0,
    },

    yieldPerHectareKg: {
      type: Number,
      min: 0,
    },

    survivalRatePercent: {
      type: Number,
      min: 0,
      max: 100,
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

cropPerformanceSchema.index({
  experimentId: 1,
  treatmentId: 1,
  plotId: 1,
  measurementDate: -1,
});

export type CropPerformance = InferSchemaType<
  typeof cropPerformanceSchema
>;

export type CropPerformanceDocument =
  HydratedDocument<CropPerformance>;

export const CropPerformanceModel = model<CropPerformance>(
  "CropPerformance",
  cropPerformanceSchema
);