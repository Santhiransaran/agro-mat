import { Alert, AlertType } from "../models/alert.model.js";
import { Device } from "../models/device.model.js";
import Crop from "../models/crop.model.js";import { CropRequirement } from "../models/cropRequirement.model.js";
import { SensorReading } from "../models/sensorReading.model.js";

interface CreateAlertInput {
  deviceId: string;
  type: AlertType;
  severity: "info" | "warning" | "critical";
  message: string;
}

export const createAlertIfMissing = async (
  input: CreateAlertInput
): Promise<void> => {
  const device = await Device.findOne({
    deviceId: input.deviceId.toUpperCase(),
  });

  if (!device) {
    return;
  }

  const existingAlert = await Alert.findOne({
    device: device._id,
    type: input.type,
    isResolved: false,
  });

  if (existingAlert) {
    return;
  }

  await Alert.create({
    device: device._id,
    type: input.type,
    severity: input.severity,
    message: input.message,
  });
};

export const resolveAlert = async (
  deviceId: string,
  type: AlertType
): Promise<void> => {
  const device = await Device.findOne({
    deviceId: deviceId.toUpperCase(),
  });

  if (!device) {
    return;
  }

  await Alert.updateMany(
    {
      device: device._id,
      type,
      isResolved: false,
    },
    {
      isResolved: true,
      resolvedAt: new Date(),
    }
  );
};

export const evaluateAlertsForDevice = async (
  deviceId: string
): Promise<void> => {
  const device = await Device.findOne({
    deviceId: deviceId.toUpperCase(),
    isActive: true,
  });

  if (!device) {
    return;
  }

  const crop = await Crop.findOne({
    status: "active",
  });

  if (!crop) {
    return;
  }

  const requirements = await CropRequirement.findOne({
    cropName: crop.name.toLowerCase(),
  });

  if (!requirements) {
    return;
  }

  const reading = await SensorReading.findOne({
    device: device._id,
  }).sort({
    recordedAt: -1,
  });

  if (!reading) {
    return;
  }

  if (reading.nitrogen < requirements.nitrogen.min) {
    await createAlertIfMissing({
      deviceId,
      type: "nitrogen_low",
      severity: "warning",
      message: "Nitrogen level is below the configured crop reference range.",
    });
  } else {
    await resolveAlert(deviceId, "nitrogen_low");
  }

  if (reading.phosphorus < requirements.phosphorus.min) {
    await createAlertIfMissing({
      deviceId,
      type: "phosphorus_low",
      severity: "warning",
      message: "Phosphorus level is below the configured crop reference range.",
    });
  } else {
    await resolveAlert(deviceId, "phosphorus_low");
  }

  if (reading.potassium < requirements.potassium.min) {
    await createAlertIfMissing({
      deviceId,
      type: "potassium_low",
      severity: "warning",
      message: "Potassium level is below the configured crop reference range.",
    });
  } else {
    await resolveAlert(deviceId, "potassium_low");
  }

  if (reading.ph < requirements.ph.min) {
    await createAlertIfMissing({
      deviceId,
      type: "ph_low",
      severity: "warning",
      message: "Soil pH is below the preferred crop range.",
    });
  } else {
    await resolveAlert(deviceId, "ph_low");
  }

  if (reading.ph > requirements.ph.max) {
    await createAlertIfMissing({
      deviceId,
      type: "ph_high",
      severity: "warning",
      message: "Soil pH is above the preferred crop range.",
    });
  } else {
    await resolveAlert(deviceId, "ph_high");
  }

  if (reading.ec > requirements.ec.max) {
    await createAlertIfMissing({
      deviceId,
      type: "ec_high",
      severity: "critical",
      message: "Electrical conductivity is above the configured reference range.",
    });
  } else {
    await resolveAlert(deviceId, "ec_high");
  }

  if (
    reading.soilMoisture <
    requirements.soilMoisture.min
  ) {
    await createAlertIfMissing({
      deviceId,
      type: "soil_moisture_low",
      severity: "warning",
      message: "Soil moisture is low. Irrigation may be required.",
    });
  } else {
    await resolveAlert(
      deviceId,
      "soil_moisture_low"
    );
  }

  if (
    reading.soilMoisture >
    requirements.soilMoisture.max
  ) {
    await createAlertIfMissing({
      deviceId,
      type: "soil_moisture_high",
      severity: "warning",
      message: "Soil moisture is high. Check drainage and avoid additional irrigation.",
    });
  } else {
    await resolveAlert(
      deviceId,
      "soil_moisture_high"
    );
  }
};