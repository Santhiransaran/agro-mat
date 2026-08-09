import mongoose, {
  Document,
  Schema,
  Types,
} from "mongoose";

export interface ISensorReading extends Document {
  device: Types.ObjectId;

  recordedAt: Date;

  nitrogen: number;

  phosphorus: number;

  potassium: number;

  ph: number;

  ec: number;

  soilMoisture: number;

  soilTemperature?: number;

  airTemperature: number;

  humidity: number;

  createdAt: Date;
  updatedAt: Date;
}

const sensorReadingSchema =
  new Schema<ISensorReading>(
    {
      device: {
        type: Schema.Types.ObjectId,
        ref: "Device",
        required: true,
        index: true,
      },

      recordedAt: {
        type: Date,
        required: true,
        default: Date.now,
        index: true,
      },

      nitrogen: {
        type: Number,
        required: true,
      },

      phosphorus: {
        type: Number,
        required: true,
      },

      potassium: {
        type: Number,
        required: true,
      },

      ph: {
        type: Number,
        required: true,
        min: 0,
        max: 14,
      },

      ec: {
        type: Number,
        required: true,
        min: 0,
      },

      soilMoisture: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },

      soilTemperature: {
        type: Number,
      },

      airTemperature: {
        type: Number,
        required: true,
      },

      humidity: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
    },
    {
      timestamps: true,
    }
  );

sensorReadingSchema.index({
  device: 1,
  recordedAt: -1,
});

export const SensorReading =
  mongoose.model<ISensorReading>(
    "SensorReading",
    sensorReadingSchema
  );