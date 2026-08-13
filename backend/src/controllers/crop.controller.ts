import { Request, Response } from "express";
import Crop from "../models/crop.model.js";
export const createCrop = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const activeCrop = await Crop.findOne({
      status: "active",
    });

    if (activeCrop) {
      res.status(409).json({
        success: false,
        message:
          "An active crop already exists. Complete the current cultivation before creating another active crop.",
        data: activeCrop,
      });

      return;
    }

    const crop = await Crop.create({
      name: req.body.name,
      variety: req.body.variety,
      plantingDate: req.body.plantingDate,
      expectedHarvestDate:
        req.body.expectedHarvestDate,
      farmArea: req.body.farmArea,
      areaUnit: req.body.areaUnit,
      notes: req.body.notes,
      status: "active",
    });

    res.status(201).json({
      success: true,
      message: "Crop cultivation started successfully",
      data: crop,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create crop",
    });
  }
};

export const getCrops = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const crops = await Crop.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: crops.length,
      data: crops,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve crops",
    });
  }
};

export const getActiveCrop = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const crop = await Crop.findOne({
      status: "active",
    });

    if (!crop) {
      res.status(404).json({
        success: false,
        message: "No active crop found",
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: crop,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve active crop",
    });
  }
};

export const completeCrop = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const crop = await Crop.findOne({
      status: "active",
    });

    if (!crop) {
      res.status(404).json({
        success: false,
        message: "No active crop found",
      });

      return;
    }

    crop.status = "completed";
    crop.actualHarvestDate = new Date();

    await crop.save();

    res.status(200).json({
      success: true,
      message: "Cultivation completed successfully",
      data: crop,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to complete cultivation",
    });
  }
};