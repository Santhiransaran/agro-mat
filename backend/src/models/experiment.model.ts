import {
  Schema,
  model,
  type InferSchemaType,
  type HydratedDocument,
} from "mongoose";

const locationSchema = new Schema(
  {
    siteName: {
      type: String,
      required: [true, "Site name is required"],
      trim: true,
    },

    district: {
      type: String,
      trim: true,
    },

    latitude: {
      type: Number,
      min: -90,
      max: 90,
    },

    longitude: {
      type: Number,
      min: -180,
      max: 180,
    },
  },
  {
    _id: false,
  }
);

const experimentSchema = new Schema(
  {
    experimentCode: {
      type: String,
      required: [true, "Experiment code is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },

    title: {
      type: String,
      required: [true, "Experiment title is required"],
      trim: true,
      minlength: 3,
      maxlength: 200,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    cropType: {
      type: String,
      required: [true, "Crop type is required"],
      trim: true,
    },

    cropVariety: {
      type: String,
      trim: true,
    },

    location: {
      type: locationSchema,
      required: [true, "Experiment location is required"],
    },

    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },

    endDate: {
      type: Date,
    },

    objective: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    methodology: {
      type: String,
      trim: true,
      maxlength: 5000,
    },

    status: {
      type: String,
      enum: ["planned", "active", "completed", "cancelled"],
      default: "planned",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

experimentSchema.index({
  title: "text",
  experimentCode: "text",
  cropType: "text",
});

export type Experiment = InferSchemaType<typeof experimentSchema>;

export type ExperimentDocument = HydratedDocument<Experiment>;

export const ExperimentModel = model<Experiment>(
  "Experiment",
  experimentSchema
);