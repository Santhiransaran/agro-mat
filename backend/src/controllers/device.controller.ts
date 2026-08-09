import { Request, Response } from "express";

import { Device } from "../models/device.model.js";

export const createDevice = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const existingDevice =
      await Device.findOne({
        deviceId: req.body.deviceId,
      });

    if (existingDevice) {
      res.status(409).json({
        success: false,
        message: "Device ID already exists",
      });

      return;
    }

    const device = await Device.create({
      deviceId: req.body.deviceId,
      name: req.body.name,
      location: req.body.location,
      firmwareVersion:
        req.body.firmwareVersion,
    });

    res.status(201).json({
      success: true,
      message: "Device created successfully",
      data: device,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create device",
    });
  }
};

export const getDevices = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const devices = await Device.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: devices.length,
      data: devices,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve devices",
    });
  }
};