import mongoose, { Document, Schema } from "mongoose";

export interface IDevice extends Document {
  deviceId: string;
  name: string;
  location?: string;

  status: "online" | "offline";

  lastSeen?: Date;

  firmwareVersion?: string;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const deviceSchema = new Schema<IDevice>(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },

    lastSeen: {
      type: Date,
    },

    firmwareVersion: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Device = mongoose.model<IDevice>(
  "Device",
  deviceSchema
);