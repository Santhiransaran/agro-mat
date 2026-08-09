import dotenv from "dotenv";

dotenv.config();

import { connectDatabase } from "../config/database.js";

import { CropRequirement } from "../models/cropRequirement.model.js";

const seed = async (): Promise<void> => {
  try {
    await connectDatabase();

    await CropRequirement.deleteMany({
      cropName: "tomato",
    });

    await CropRequirement.create({
      cropName: "tomato",

      ph: {
        min: 5.5,
        max: 7.0,
      },

      /*
       * IMPORTANT:
       * These NPK thresholds are prototype calibration values.
       *
       * They must later be replaced/calibrated using:
       * - your specific RS485 sensor
       * - laboratory soil testing
       * - validated agronomic recommendations
       */
      nitrogen: {
        min: 30,
        max: 60,
      },

      phosphorus: {
        min: 20,
        max: 50,
      },

      potassium: {
        min: 100,
        max: 200,
      },

      /*
       * Prototype EC range.
       * Do not interpret this as a universal tomato
       * salinity recommendation until sensor units
       * and soil extraction method are confirmed.
       */
      ec: {
        min: 0,
        max: 2.5,
      },

      /*
       * Prototype volumetric sensor/calibration band.
       */
      soilMoisture: {
        min: 40,
        max: 70,
      },

      source:
        "Sri Lanka Department of Agriculture + University Extension references",

      notes:
        "pH is reference-backed. NPK, EC and moisture thresholds are prototype calibration values and must be validated against the actual soil sensor and agronomic soil testing.",
    });

    console.log(
      "✅ Tomato crop requirement seeded successfully"
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "❌ Failed to seed crop requirements:",
      error
    );

    process.exit(1);
  }
};

seed();