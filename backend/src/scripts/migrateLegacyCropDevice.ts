import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function migrateLegacyCropDevice() {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error(
        "MONGODB_URI is not defined in .env"
      );
    }

    console.log("Connecting to MongoDB...");

    await mongoose.connect(mongoUri);

    console.log("MongoDB connected.");


    // ========================================================
    // Direct access to existing MongoDB collections
    // ========================================================

    const cropsCollection =
      mongoose.connection.collection("crops");

    const devicesCollection =
      mongoose.connection.collection("devices");


    // ========================================================
    // Find AGRO-001
    // ========================================================

    const device =
      await devicesCollection.findOne({
        deviceId: "AGRO-001",
      });


    if (!device) {
      throw new Error(
        "AGRO-001 device was not found."
      );
    }


    console.log(
      `Found device: ${device.deviceId}`
    );


    // ========================================================
    // Find old Tomato active crop
    // ========================================================

    const tomatoCrop =
      await cropsCollection.findOne({
        name: "Tomato",
        status: "active",
      });


    if (!tomatoCrop) {
      throw new Error(
        "Active Tomato crop was not found."
      );
    }


    console.log(
      `Found Tomato crop: ${tomatoCrop._id}`
    );


    // ========================================================
    // Already linked?
    // ========================================================

    if (
      tomatoCrop.device &&
      tomatoCrop.device.toString() ===
        device._id.toString()
    ) {
      console.log(
        "Tomato is already linked to AGRO-001."
      );

      return;
    }


    // ========================================================
    // Link Tomato -> AGRO-001
    // ========================================================

    const result =
      await cropsCollection.updateOne(
        {
          _id: tomatoCrop._id,
        },
        {
          $set: {
            device: device._id,
          },
        }
      );


    if (result.modifiedCount === 0) {
      console.log(
        "No changes were required."
      );
    } else {
      console.log(
        "Migration successful!"
      );

      console.log(
        "Tomato -> AGRO-001 linked successfully."
      );
    }

  } catch (error) {
    console.error(
      "Migration failed:",
      error
    );

    process.exitCode = 1;

  } finally {
    await mongoose.disconnect();

    console.log(
      "MongoDB disconnected."
    );
  }
}


migrateLegacyCropDevice();