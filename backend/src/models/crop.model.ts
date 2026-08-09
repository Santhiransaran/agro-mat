import mongoose, { Document, Schema } from "mongoose";

export type CropStatus =
  | "planned"
  | "active"
  | "completed";

export interface ICrop extends Document {
  name: string;

  variety?: string;

  plantingDate: Date;

  expectedHarvestDate?: Date;

  actualHarvestDate?: Date;

  farmArea: number;

  areaUnit: "acre" | "hectare" | "square_meter";

  status: CropStatus;

  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const cropSchema = new Schema<ICrop>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    variety: {
      type: String,
      trim: true,
    },

    plantingDate: {
      type: Date,
      required: true,
    },

    expectedHarvestDate: {
      type: Date,
    },

    actualHarvestDate: {
      type: Date,
    },

    farmArea: {
      type: Number,
      required: true,
      min: 0,
    },

    areaUnit: {
      type: String,
      enum: [
        "acre",
        "hectare",
        "square_meter",
      ],
      default: "acre",
    },

    status: {
      type: String,
      enum: [
        "planned",
        "active",
        "completed",
      ],
      default: "active",
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Crop = mongoose.model<ICrop>(
  "Crop",
  cropSchema
);