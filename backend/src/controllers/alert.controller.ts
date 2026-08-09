import {
  Request,
  Response,
} from "express";

import { Alert } from "../models/alert.model.js";
import { Device } from "../models/device.model.js";

export const getAlerts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const resolved = req.query.resolved;

    const filter: Record<string, unknown> = {};

    if (resolved === "true") {
      filter.isResolved = true;
    }

    if (resolved === "false") {
      filter.isResolved = false;
    }

    const alerts = await Alert.find(filter)
      .populate(
        "device",
        "deviceId name status lastSeen"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve alerts",
    });
  }
};

export const getDeviceAlerts = async (
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

    const alerts = await Alert.find({
      device: device._id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve device alerts",
    });
  }
};