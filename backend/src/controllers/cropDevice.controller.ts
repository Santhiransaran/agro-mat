import {
  Request,
  Response,
} from "express";

import Crop from "../models/crop.model.js";
import { Device } from "../models/device.model.js";

export async function createCropWithDevice(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const {
      name,
      variety,
      plantingDate,
      expectedHarvestDate,
      farmArea,
      areaUnit,
      notes,

      deviceId,
      deviceName,
      deviceLocation,
    } = req.body;


    // ========================================================
    // Basic Validation
    // ========================================================

    if (
      !name ||
      !plantingDate ||
      !farmArea ||
      !areaUnit ||
      !deviceId
    ) {

      res.status(400).json({
        success: false,
        message:
          "Crop name, planting date, farm area, area unit and device ID are required.",
      });

      return;
    }


    const normalizedDeviceId =
      String(deviceId)
        .trim()
        .toUpperCase();


    // ========================================================
    // Find Existing Device
    // ========================================================

    let device =
      await Device.findOne({
        deviceId:
          normalizedDeviceId,
      });


    // ========================================================
    // Create Device Only If It Does Not Already Exist
    // ========================================================

    if (!device) {

      device =
        await Device.create({
          deviceId:
            normalizedDeviceId,

          name:
            deviceName?.trim() ||
            `${name} Field Monitor`,

          location:
            deviceLocation?.trim() ||
            "Farm Field",

          status:
            "offline",

          isActive:
            true,
        });

    } else {

      // Optional:
      // update device description/location from website

      if (
        deviceName &&
        deviceName.trim()
      ) {

        device.name =
          deviceName.trim();
      }


      if (
        deviceLocation &&
        deviceLocation.trim()
      ) {

        device.location =
          deviceLocation.trim();
      }


      device.isActive =
        true;


      await device.save();
    }


    // ========================================================
    // Prevent Same Device Being Used By Two Active Crops
    // ========================================================

    const existingCrop =
      await Crop.findOne({
        device:
          device._id,

        status:
          "active",
      });


    if (existingCrop) {

      res.status(409).json({
        success: false,

        message:
          `Device ${normalizedDeviceId} is already assigned to active crop ${existingCrop.name}.`,
      });

      return;
    }


    // ========================================================
    // Create Crop
    // ========================================================

    const crop =
      await Crop.create({
        name:
          String(name).trim(),

        variety:
          variety
            ? String(variety).trim()
            : undefined,

        plantingDate:
          new Date(
            plantingDate
          ),

        expectedHarvestDate:
          expectedHarvestDate
            ? new Date(
                expectedHarvestDate
              )
            : undefined,

        farmArea:
          Number(farmArea),

        areaUnit,

        status:
          "active",

        notes:
          notes
            ? String(notes).trim()
            : undefined,

        device:
          device._id,
      });


    // ========================================================
    // Return Crop + Device
    // ========================================================

    const populatedCrop =
      await Crop.findById(
        crop._id
      ).populate(
        "device"
      );


    res.status(201).json({
      success: true,

      message:
        "Crop and IoT device configured successfully.",

      data: {
        crop:
          populatedCrop,

        device,
      },
    });

  } catch (error) {

    console.error(
      "Create crop with device error:",
      error
    );


    res.status(500).json({
      success: false,

      message:
        "Failed to configure crop and IoT device.",
    });
  }
}

export async function getActiveCropsWithDevices(
  _req: Request,
  res: Response
): Promise<void> {

  try {

    const crops =
      await Crop.find({
        status: "active",
      })
        .populate("device")
        .sort({
          createdAt: -1,
        });


    res.status(200).json({
      success: true,
      count:
        crops.length,
      data:
        crops,
    });

  } catch (error) {

    console.error(
      "Get active crops error:",
      error
    );


    res.status(500).json({
      success: false,
      message:
        "Failed to load active crops.",
    });
  }
}

export async function getActiveCropByDevice(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const deviceId =
      String(
        req.params.deviceId
      )
        .trim()
        .toUpperCase();


    const device =
      await Device.findOne({
        deviceId,
      });


    if (!device) {

      res.status(404).json({
        success: false,
        message:
          "Device not found.",
      });

      return;
    }


    const crop =
      await Crop.findOne({
        device:
          device._id,

        status:
          "active",
      }).populate(
        "device"
      );


    if (!crop) {

      res.status(404).json({
        success: false,
        message:
          `No active crop assigned to ${deviceId}.`,
      });

      return;
    }


    res.status(200).json({
      success: true,
      data:
        crop,
    });

  } catch (error) {

    console.error(
      "Get crop by device error:",
      error
    );


    res.status(500).json({
      success: false,
      message:
        "Failed to load crop.",
    });
  }
}