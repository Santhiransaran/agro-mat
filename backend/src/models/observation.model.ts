import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const observationSchema = new Schema(
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

    observationDate: {
      type: Date,
      required: [true, "Observation date is required"],
      index: true,
    },

    daysAfterPlanting: {
      type: Number,
      min: 0,
    },

    soilMoisturePercent: {
      type: Number,
      min: 0,
      max: 100,
    },

    soilTemperatureC: {
      type: Number,
      min: -50,
      max: 100,
    },

    airTemperatureC: {
      type: Number,
      min: -50,
      max: 100,
    },

    relativeHumidityPercent: {
      type: Number,
      min: 0,
      max: 100,
    },

    weedCoveragePercent: {
      type: Number,
      min: 0,
      max: 100,
    },

    pestIncidencePercent: {
      type: Number,
      min: 0,
      max: 100,
    },

    diseaseIncidencePercent: {
      type: Number,
      min: 0,
      max: 100,
    },

    matDegradationPercent: {
      type: Number,
      min: 0,
      max: 100,
    },

    matCondition: {
      type: String,
      enum: ["excellent", "good", "fair", "poor"],
    },

    irrigationAmountMm: {
      type: Number,
      min: 0,
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

observationSchema.index({
  experimentId: 1,
  treatmentId: 1,
  plotId: 1,
  observationDate: -1,
});

export type Observation = InferSchemaType<
  typeof observationSchema
>;

export type ObservationDocument =
  HydratedDocument<Observation>;

export const ObservationModel = model<Observation>(
  "Observation",
  observationSchema
);