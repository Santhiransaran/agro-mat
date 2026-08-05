import { Router } from "express";

import {
  createLabResultController,
  deleteLabResultController,
  getLabResultByIdController,
  getLabResultsController,
  updateLabResultController,
} from "../controllers/lab-result.controller.js";

const labResultRouter = Router();

labResultRouter
  .route("/")
  .post(createLabResultController)
  .get(getLabResultsController);

labResultRouter
  .route("/:id")
  .get(getLabResultByIdController)
  .patch(updateLabResultController)
  .delete(deleteLabResultController);

export default labResultRouter;