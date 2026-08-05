import { Router } from "express";

import {
  createWeatherController,
  deleteWeatherController,
  getWeatherByIdController,
  getWeatherRecordsController,
  updateWeatherController,
} from "../controllers/weather.controller.js";

const weatherRouter = Router();

weatherRouter
  .route("/")
  .post(createWeatherController)
  .get(getWeatherRecordsController);

weatherRouter
  .route("/:id")
  .get(getWeatherByIdController)
  .patch(updateWeatherController)
  .delete(deleteWeatherController);

export default weatherRouter;