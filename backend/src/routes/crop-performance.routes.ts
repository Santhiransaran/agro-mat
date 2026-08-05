import { Router } from "express";

import {
  createCropPerformanceController,
  deleteCropPerformanceController,
  getCropPerformanceByIdController,
  getCropPerformanceRecordsController,
  updateCropPerformanceController,
} from "../controllers/crop-performance.controller.js";

const cropPerformanceRouter = Router();

cropPerformanceRouter
  .route("/")
  .post(createCropPerformanceController)
  .get(getCropPerformanceRecordsController);

cropPerformanceRouter
  .route("/:id")
  .get(getCropPerformanceByIdController)
  .patch(updateCropPerformanceController)
  .delete(deleteCropPerformanceController);

export default cropPerformanceRouter;