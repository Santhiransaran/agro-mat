import { Router } from "express";

import {
  createPlotController,
  deletePlotController,
  getPlotByIdController,
  getPlotsController,
  updatePlotController,
} from "../controllers/plot.controller.js";

const plotRouter = Router();

plotRouter
  .route("/")
  .post(createPlotController)
  .get(getPlotsController);

plotRouter
  .route("/:id")
  .get(getPlotByIdController)
  .patch(updatePlotController)
  .delete(deletePlotController);

export default plotRouter;