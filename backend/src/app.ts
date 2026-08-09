import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "IoT Smart Soil Monitoring API",
  });
});

app.get("/api/v1/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Agro-Mat API is running",
    timestamp: new Date().toISOString(),
  });
});

export default app;