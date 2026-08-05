import {
  Schema,
  model,
  type InferSchemaType,
  type HydratedDocument,
} from "mongoose";

const treatmentSchema = new Schema(
  {
    experimentId: {
      type: Schema.Types.ObjectId,
      ref: "Experiment",
      required: [true, "Experiment ID is required"],
      index: true,
    },

    treatmentCode: {
      type: String,
      required: [true, "Treatment code is required"],
      trim: true,
      uppercase: true,
    },

    name: {
      type: String,
      required: [true, "Treatment name is required"],
      trim: true,
      minlength: 2,
      maxlength: 200,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    agroMatType: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    materialSource: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    thicknessMm: {
      type: Number,
      min: 0,
    },

    density: {
      type: Number,
      min: 0,
    },

    applicationRate: {
      type: Number,
      min: 0,
    },

    isControl: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

treatmentSchema.index(
  {
    experimentId: 1,
    treatmentCode: 1,
  },
  {
    unique: true,
  }
);

export type Treatment = InferSchemaType<
  typeof treatmentSchema
>;

export type TreatmentDocument =
  HydratedDocument<Treatment>;

export const TreatmentModel = model<Treatment>(
  "Treatment",
  treatmentSchema
);