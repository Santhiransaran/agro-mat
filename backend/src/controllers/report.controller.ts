import {
  Request,
  Response,
} from "express";

import { Crop } from "../models/crop.model.js";
import { Device } from "../models/device.model.js";
import { SensorReading } from "../models/sensorReading.model.js";
import { Alert } from "../models/alert.model.js";

export const getReportData = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deviceId = String(
      req.params.deviceId
    ).toUpperCase();

    const device = await Device.findOne({
      deviceId,
    });

    if (!device) {
      res.status(404).json({
        success: false,
        message: "Device not found",
      });

      return;
    }

    const crop = await Crop.findOne({
      status: "active",
    });

    const readings =
      await SensorReading.find({
        device: device._id,
      })
        .sort({
          recordedAt: -1,
        })
        .limit(1000)
        .lean();

    const alerts = await Alert.find({
      device: device._id,
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    if (readings.length === 0) {
      res.status(404).json({
        success: false,
        message:
          "No sensor readings available for report",
      });

      return;
    }

    const average = (
      values: number[]
    ): number => {
      if (values.length === 0) {
        return 0;
      }

      const total = values.reduce(
        (sum, value) =>
          sum + value,
        0
      );

      return Number(
        (
          total /
          values.length
        ).toFixed(2)
      );
    };

    const soilTemperatureValues =
      readings
        .map(
          (reading) =>
            reading.soilTemperature
        )
        .filter(
          (
            value
          ): value is number =>
            typeof value === "number"
        );

    const averages = {
      nitrogen: average(
        readings.map(
          (reading) =>
            reading.nitrogen
        )
      ),

      phosphorus: average(
        readings.map(
          (reading) =>
            reading.phosphorus
        )
      ),

      potassium: average(
        readings.map(
          (reading) =>
            reading.potassium
        )
      ),

      ph: average(
        readings.map(
          (reading) =>
            reading.ph
        )
      ),

      ec: average(
        readings.map(
          (reading) =>
            reading.ec
        )
      ),

      soilMoisture: average(
        readings.map(
          (reading) =>
            reading.soilMoisture
        )
      ),

      soilTemperature:
        average(
          soilTemperatureValues
        ),

      airTemperature: average(
        readings.map(
          (reading) =>
            reading.airTemperature
        )
      ),

      humidity: average(
        readings.map(
          (reading) =>
            reading.humidity
        )
      ),
    };

    res.status(200).json({
      success: true,

      generatedAt:
        new Date().toISOString(),

      device: {
        deviceId:
          device.deviceId,
        name: device.name,
        location:
          device.location,
        status:
          device.status,
        lastSeen:
          device.lastSeen,
      },

      crop,

      summary: {
        totalReadings:
          readings.length,

        totalAlerts:
          alerts.length,

        activeAlerts:
          alerts.filter(
            (alert) =>
              !alert.isResolved
          ).length,

        resolvedAlerts:
          alerts.filter(
            (alert) =>
              alert.isResolved
          ).length,

        averages,
      },

      readings,

      alerts,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message:
        "Failed to generate report data",
    });
  }
};