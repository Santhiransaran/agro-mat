import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const weatherSchema = new Schema(
  {
    experimentId: {
      type: Schema.Types.ObjectId,
      ref: "Experiment",
      required: [true, "Experiment ID is required"],
      index: true,
    },

    recordedAt: {
      type: Date,
      required: [true, "Recorded date and time are required"],
      index: true,
    },

    source: {
      type: String,
      enum: ["manual", "sensor", "weather_api"],
      default: "manual",
    },

    temperatureC: {
      type: Number,
      min: -50,
      max: 70,
    },

    minimumTemperatureC: {
      type: Number,
      min: -50,
      max: 70,
    },

    maximumTemperatureC: {
      type: Number,
      min: -50,
      max: 70,
    },

    relativeHumidityPercent: {
      type: Number,
      min: 0,
      max: 100,
    },

    rainfallMm: {
      type: Number,
      min: 0,
    },

    windSpeedKmh: {
      type: Number,
      min: 0,
    },

    solarRadiation: {
      type: Number,
      min: 0,
    },

    weatherCondition: {
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

weatherSchema.index({
  experimentId: 1,
  recordedAt: -1,
});

export type Weather = InferSchemaType<
  typeof weatherSchema
>;

export type WeatherDocument =
  HydratedDocument<Weather>;

export const WeatherModel = model<Weather>(
  "Weather",
  weatherSchema
);