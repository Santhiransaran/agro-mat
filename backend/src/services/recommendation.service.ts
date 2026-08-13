import Crop from "../models/crop.model.js";
import { CropRequirement } from "../models/cropRequirement.model.js";

import { Device } from "../models/device.model.js";

import { SensorReading } from "../models/sensorReading.model.js";

import { analyzeRange } from "../utils/analyzeRange.js";

import {
  RecommendationResult,
} from "../types/recommendation.types.js";

export const generateRecommendation =
  async (
    deviceId: string
  ): Promise<RecommendationResult> => {

    /*
     * 1. Find device
     */
    const device = await Device.findOne({
      deviceId: deviceId.toUpperCase(),
      isActive: true,
    });

    if (!device) {
      throw new Error("Device not found");
    }

    /*
     * 2. Find active crop
     */
    const crop = await Crop.findOne({
      status: "active",
    });

    if (!crop) {
      throw new Error(
        "No active crop cultivation found"
      );
    }

    /*
     * 3. Find crop requirements
     */
    const requirements =
      await CropRequirement.findOne({
        cropName: crop.name.toLowerCase(),
      });

    if (!requirements) {
      throw new Error(
        `No crop requirement data found for ${crop.name}`
      );
    }

    /*
     * 4. Find latest sensor reading
     */
    const reading =
      await SensorReading.findOne({
        device: device._id,
      }).sort({
        recordedAt: -1,
      });

    if (!reading) {
      throw new Error(
        "No sensor readings found"
      );
    }

    /*
     * Nitrogen
     */
    const nitrogen = analyzeRange({
      parameter: "Nitrogen",

      value: reading.nitrogen,

      min: requirements.nitrogen.min,

      max: requirements.nitrogen.max,

      lowMessage:
        "Nitrogen level is below the configured crop reference range. Nitrogen supplementation may be required after agronomic verification.",

      normalMessage:
        "Nitrogen level is within the configured crop reference range.",

      highMessage:
        "Nitrogen level is above the configured crop reference range. Avoid unnecessary nitrogen application.",
    });

    /*
     * Phosphorus
     */
    const phosphorus = analyzeRange({
      parameter: "Phosphorus",

      value: reading.phosphorus,

      min: requirements.phosphorus.min,

      max: requirements.phosphorus.max,

      lowMessage:
        "Phosphorus level is below the configured crop reference range. Phosphorus supplementation may be required after verification.",

      normalMessage:
        "Phosphorus level is within the configured crop reference range.",

      highMessage:
        "Phosphorus level is above the configured crop reference range. Additional phosphorus fertilizer should be avoided unless recommended by soil testing.",
    });

    /*
     * Potassium
     */
    const potassium = analyzeRange({
      parameter: "Potassium",

      value: reading.potassium,

      min: requirements.potassium.min,

      max: requirements.potassium.max,

      lowMessage:
        "Potassium level is below the configured crop reference range. Potassium supplementation may be required after verification.",

      normalMessage:
        "Potassium level is within the configured crop reference range.",

      highMessage:
        "Potassium level is above the configured crop reference range. Avoid unnecessary potassium fertilizer application.",
    });

    /*
     * pH
     */
    const ph = analyzeRange({
      parameter: "Soil pH",

      value: reading.ph,

      min: requirements.ph.min,

      max: requirements.ph.max,

      lowMessage:
        "Soil is more acidic than the preferred range for the crop.",

      normalMessage:
        "Soil pH is within the preferred crop range.",

      highMessage:
        "Soil is more alkaline than the preferred range for the crop.",
    });

    /*
     * EC
     */
    const ec = analyzeRange({
      parameter: "Electrical Conductivity",

      value: reading.ec,

      min: requirements.ec.min,

      max: requirements.ec.max,

      lowMessage:
        "Electrical conductivity is below the configured reference range.",

      normalMessage:
        "Electrical conductivity is within the configured reference range.",

      highMessage:
        "Electrical conductivity is high. Possible salt accumulation should be investigated.",
    });

    /*
     * Soil moisture / irrigation
     */
    const irrigation = analyzeRange({
      parameter: "Soil Moisture",

      value: reading.soilMoisture,

      min: requirements.soilMoisture.min,

      max: requirements.soilMoisture.max,

      lowMessage:
        "Soil moisture is low. Irrigation may be required.",

      normalMessage:
        "Soil moisture is within the configured acceptable range. Irrigation is not currently required.",

      highMessage:
        "Soil moisture is high. Avoid additional irrigation and check for poor drainage or waterlogging.",
    });

    /*
     * Overall condition
     */

    const statuses = [
      nitrogen.status,
      phosphorus.status,
      potassium.status,
      ph.status,
      ec.status,
      irrigation.status,
    ];

    const abnormalCount =
      statuses.filter(
        (status) => status !== "normal"
      ).length;

    let overallStatus:
      | "good"
      | "attention"
      | "critical";

    if (abnormalCount === 0) {
      overallStatus = "good";
    } else if (abnormalCount <= 2) {
      overallStatus = "attention";
    } else {
      overallStatus = "critical";
    }

    return {
      crop: crop.name,

      overallStatus,

      nutrients: {
        nitrogen,
        phosphorus,
        potassium,
      },

      ph,

      ec,

      irrigation,

      generatedAt: new Date(),
    };
  };