import { Router } from "express";

import {
  createExperimentController,
  deleteExperimentController,
  getExperimentByIdController,
  getExperimentsController,
  updateExperimentController,
} from "../controllers/experiment.controller.js";

const experimentRouter = Router();

experimentRouter
  .route("/")
  .post(createExperimentController)
  .get(getExperimentsController);

experimentRouter
  .route("/:id")
  .get(getExperimentByIdController)
  .patch(updateExperimentController)
  .delete(deleteExperimentController);

export default experimentRouter;