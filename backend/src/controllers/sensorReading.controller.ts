import { Request, Response } from "express";

import { Device } from "../models/device.model.js";
import { SensorReading } from "../models/sensorReading.model.js";

import {
  evaluateAlertsForDevice,
} from "../services/alert.service.js";

export const createSensorReading = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deviceId = req.body.deviceId.toUpperCase();

    const device = await Device.findOne({
      deviceId,
      isActive: true,
    });

    if (!device) {
      res.status(404).json({
        success: false,
        message: `Active device ${deviceId} not found`,
      });

      return;
    }

    const reading = await SensorReading.create({
      device: device._id,

      recordedAt: req.body.timestamp ?? new Date(),

      nitrogen: req.body.nitrogen,
      phosphorus: req.body.phosphorus,
      potassium: req.body.potassium,

      ph: req.body.ph,
      ec: req.body.ec,

      soilMoisture: req.body.soilMoisture,
      soilTemperature: req.body.soilTemperature,

      airTemperature: req.body.airTemperature,
      humidity: req.body.humidity,
    });

    device.lastSeen = new Date();
    device.status = "online";

    await device.save();

    // Automatically evaluate alerts after every new reading
    await evaluateAlertsForDevice(deviceId);

    res.status(201).json({
      success: true,
      message: "Sensor reading stored successfully",
      data: reading,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to store sensor reading",
    });
  }
};

export const getLatestSensorReading = async (
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

    const reading = await SensorReading.findOne({
      device: device._id,
    })
      .sort({
        recordedAt: -1,
      })
      .lean();

    if (!reading) {
      res.status(404).json({
        success: false,
        message: "No sensor readings found for this device",
      });

      return;
    }

    res.status(200).json({
      success: true,

      device: {
        deviceId: device.deviceId,
        name: device.name,
        status: device.status,
        lastSeen: device.lastSeen,
      },

      data: reading,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve latest reading",
    });
  }
};

export const getSensorHistory = async (
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

    const limit = Math.min(
      Number(req.query.limit) || 100,
      1000
    );

    const readings = await SensorReading.find({
      device: device._id,
    })
      .sort({
        recordedAt: -1,
      })
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      count: readings.length,
      data: readings,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve sensor history",
    });
  }
};