import mongoose, { Document, Schema } from "mongoose";

interface IRange {
  min: number;
  max: number;
}

export interface ICropRequirement extends Document {
  cropName: string;

  ph: IRange;

  nitrogen: IRange;
  phosphorus: IRange;
  potassium: IRange;

  ec: IRange;

  soilMoisture: IRange;

  source?: string;
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const rangeSchema = new Schema<IRange>(
  {
    min: {
      type: Number,
      required: true,
    },

    max: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const cropRequirementSchema =
  new Schema<ICropRequirement>(
    {
      cropName: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },

      ph: {
        type: rangeSchema,
        required: true,
      },

      nitrogen: {
        type: rangeSchema,
        required: true,
      },

      phosphorus: {
        type: rangeSchema,
        required: true,
      },

      potassium: {
        type: rangeSchema,
        required: true,
      },

      ec: {
        type: rangeSchema,
        required: true,
      },

      soilMoisture: {
        type: rangeSchema,
        required: true,
      },

      source: {
        type: String,
      },

      notes: {
        type: String,
      },
    },
    {
      timestamps: true,
    }
  );

export const CropRequirement =
  mongoose.model<ICropRequirement>(
    "CropRequirement",
    cropRequirementSchema
  );