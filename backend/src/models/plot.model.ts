import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const plotSchema = new Schema(
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

    plotCode: {
      type: String,
      required: [true, "Plot code is required"],
      trim: true,
      uppercase: true,
    },

    replicateNumber: {
      type: Number,
      required: [true, "Replicate number is required"],
      min: 1,
    },

    areaSquareMeters: {
      type: Number,
      min: 0,
    },

    rowCount: {
      type: Number,
      min: 0,
    },

    plantCount: {
      type: Number,
      min: 0,
    },

    soilType: {
      type: String,
      trim: true,
      maxlength: 100,
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

plotSchema.index(
  {
    experimentId: 1,
    plotCode: 1,
  },
  {
    unique: true,
  }
);

export type Plot = InferSchemaType<typeof plotSchema>;

export type PlotDocument = HydratedDocument<Plot>;

export const PlotModel = model<Plot>("Plot", plotSchema);