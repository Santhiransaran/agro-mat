import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  try {
    app.listen(PORT, () => {
      console.log("========================================");
      console.log("🌱 IoT Smart Soil Monitoring Backend");
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`❤️  Health: http://localhost:${PORT}/api/v1/health`);
      console.log("========================================");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();