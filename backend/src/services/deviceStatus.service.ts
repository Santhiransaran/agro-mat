import { Device } from "../models/device.model.js";
import { Alert } from "../models/alert.model.js";

const OFFLINE_THRESHOLD_MINUTES = 15;

export const checkDeviceStatuses =
  async (): Promise<void> => {
    const devices = await Device.find({
      isActive: true,
    });

    const now = new Date();

    for (const device of devices) {
      let offline = false;

      if (!device.lastSeen) {
        offline = true;
      } else {
        const differenceMs =
          now.getTime() -
          device.lastSeen.getTime();

        const differenceMinutes =
          differenceMs / 1000 / 60;

        offline =
          differenceMinutes >
          OFFLINE_THRESHOLD_MINUTES;
      }

      if (offline) {
        if (device.status !== "offline") {
          device.status = "offline";
          await device.save();
        }

        const existingAlert =
          await Alert.findOne({
            device: device._id,
            type: "device_offline",
            isResolved: false,
          });

        if (!existingAlert) {
          await Alert.create({
            device: device._id,
            type: "device_offline",
            severity: "critical",
            message:
              "Device has not sent sensor data within the expected time interval.",
          });
        }
      } else {
        if (device.status !== "online") {
          device.status = "online";
          await device.save();
        }

        await Alert.updateMany(
          {
            device: device._id,
            type: "device_offline",
            isResolved: false,
          },
          {
            isResolved: true,
            resolvedAt: new Date(),
          }
        );
      }
    }
  };