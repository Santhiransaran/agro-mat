import mongoose, {
  Document,
  Schema,
  Types,
} from "mongoose";

export type AlertType =
  | "nitrogen_low"
  | "phosphorus_low"
  | "potassium_low"
  | "ph_low"
  | "ph_high"
  | "ec_high"
  | "soil_moisture_low"
  | "soil_moisture_high"
  | "device_offline"
  | "sensor_abnormal";

export type AlertSeverity =
  | "info"
  | "warning"
  | "critical";

export interface IAlert extends Document {
  device: Types.ObjectId;

  type: AlertType;

  severity: AlertSeverity;

  message: string;

  isResolved: boolean;

  resolvedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const alertSchema = new Schema<IAlert>(
  {
    device: {
      type: Schema.Types.ObjectId,
      ref: "Device",
      required: true,
      index: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "nitrogen_low",
        "phosphorus_low",
        "potassium_low",
        "ph_low",
        "ph_high",
        "ec_high",
        "soil_moisture_low",
        "soil_moisture_high",
        "device_offline",
        "sensor_abnormal",
      ],
      index: true,
    },

    severity: {
      type: String,
      required: true,
      enum: ["info", "warning", "critical"],
      default: "warning",
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    isResolved: {
      type: Boolean,
      default: false,
      index: true,
    },

    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

alertSchema.index({
  device: 1,
  type: 1,
  isResolved: 1,
});

export const Alert = mongoose.model<IAlert>(
  "Alert",
  alertSchema
);