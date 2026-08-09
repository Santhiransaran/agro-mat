import {
  Activity,
  Droplets,
  FlaskConical,
  Gauge,
  Thermometer,
  Waves,
  Wind,
} from "lucide-react";

import SensorCard from "@/components/dashboard/SensorCard";
import { apiGet } from "@/lib/api";

import {
  Recommendation,
  SensorReading,
} from "@/types/api";

interface LatestReadingResponse {
  success: boolean;

  device: {
    deviceId: string;
    name: string;
    status: "online" | "offline";
    lastSeen?: string;
  };

  data: SensorReading;
}

interface RecommendationResponse {
  success: boolean;
  data: Recommendation;
}

function statusClasses(
  status?: string
): string {
  switch (status) {
    case "normal":
    case "online":
    case "good":
      return "bg-emerald-100 text-emerald-700";

    case "low":
    case "high":
    case "attention":
      return "bg-amber-100 text-amber-700";

    case "critical":
    case "offline":
      return "bg-red-100 text-red-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

async function getMonitoringData() {
  const results = await Promise.allSettled([
    apiGet<LatestReadingResponse>(
      "/readings/AGRO-001/latest"
    ),

    apiGet<RecommendationResponse>(
      "/recommendations/AGRO-001"
    ),
  ]);

  return {
    latest:
      results[0].status === "fulfilled"
        ? results[0].value
        : null,

    recommendation:
      results[1].status === "fulfilled"
        ? results[1].value.data
        : null,
  };
}

export default async function SoilMonitoringPage() {
  const {
    latest,
    recommendation,
  } = await getMonitoringData();

  const reading = latest?.data;

  return (
    <div className="p-5 md:p-8">
      <header className="mb-8">
        <p className="text-sm font-medium text-emerald-700">
          Sensor Monitoring
        </p>

        <div className="mt-1 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Soil Monitoring
            </h1>

            <p className="mt-2 text-slate-500">
              Latest soil and environmental sensor readings.
            </p>
          </div>

          {latest && (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span
                  className={`h-3 w-3 rounded-full ${
                    latest.device.status ===
                    "online"
                      ? "bg-emerald-500"
                      : "bg-red-500"
                  }`}
                />

                <div>
                  <p className="font-semibold">
                    {latest.device.name}
                  </p>

                  <p className="text-xs text-slate-500">
                    {latest.device.deviceId}
                  </p>
                </div>

                <span
                  className={`ml-3 rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClasses(
                    latest.device.status
                  )}`}
                >
                  {latest.device.status}
                </span>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Last seen:{" "}
                {latest.device.lastSeen
                  ? new Date(
                      latest.device.lastSeen
                    ).toLocaleString()
                  : "Never"}
              </p>
            </div>
          )}
        </div>
      </header>

      {!reading ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-semibold">
            No sensor reading available
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Send a sensor packet from AGRO-001 first.
          </p>
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <SensorCard
              title="Nitrogen"
              value={reading.nitrogen}
              unit="mg/kg"
              subtitle={
                recommendation?.nutrients
                  .nitrogen.status
              }
              icon={FlaskConical}
            />

            <SensorCard
              title="Phosphorus"
              value={reading.phosphorus}
              unit="mg/kg"
              subtitle={
                recommendation?.nutrients
                  .phosphorus.status
              }
              icon={FlaskConical}
            />

            <SensorCard
              title="Potassium"
              value={reading.potassium}
              unit="mg/kg"
              subtitle={
                recommendation?.nutrients
                  .potassium.status
              }
              icon={Activity}
            />

            <SensorCard
              title="Soil pH"
              value={reading.ph}
              subtitle={
                recommendation?.ph.status
              }
              icon={Gauge}
            />

            <SensorCard
              title="Soil EC"
              value={reading.ec}
              unit="mS/cm"
              subtitle={
                recommendation?.ec.status
              }
              icon={Waves}
            />

            <SensorCard
              title="Soil Moisture"
              value={reading.soilMoisture}
              unit="%"
              subtitle={
                recommendation?.irrigation
                  .status
              }
              icon={Droplets}
            />

            <SensorCard
              title="Soil Temperature"
              value={
                reading.soilTemperature ??
                "N/A"
              }
              unit={
                reading.soilTemperature !==
                undefined
                  ? "°C"
                  : undefined
              }
              icon={Thermometer}
            />

            <SensorCard
              title="Air Temperature"
              value={reading.airTemperature}
              unit="°C"
              icon={Thermometer}
            />

            <SensorCard
              title="Humidity"
              value={reading.humidity}
              unit="%"
              icon={Wind}
            />
          </section>

          <section className="mt-8 grid gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">
                Current Soil Status
              </h2>

              {recommendation ? (
                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">
                      Nitrogen
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClasses(
                        recommendation
                          .nutrients
                          .nitrogen
                          .status
                      )}`}
                    >
                      {
                        recommendation
                          .nutrients
                          .nitrogen
                          .status
                      }
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">
                      Phosphorus
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClasses(
                        recommendation
                          .nutrients
                          .phosphorus
                          .status
                      )}`}
                    >
                      {
                        recommendation
                          .nutrients
                          .phosphorus
                          .status
                      }
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">
                      Potassium
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClasses(
                        recommendation
                          .nutrients
                          .potassium
                          .status
                      )}`}
                    >
                      {
                        recommendation
                          .nutrients
                          .potassium
                          .status
                      }
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">
                      Soil pH
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClasses(
                        recommendation.ph
                          .status
                      )}`}
                    >
                      {
                        recommendation.ph
                          .status
                      }
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">
                      Soil EC
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClasses(
                        recommendation.ec
                          .status
                      )}`}
                    >
                      {
                        recommendation.ec
                          .status
                      }
                    </span>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  Recommendation data unavailable.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">
                Reading Information
              </h2>

              <div className="mt-5 space-y-4 text-sm">
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-500">
                    Recorded At
                  </span>

                  <span className="font-medium">
                    {new Date(
                      reading.recordedAt
                    ).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-500">
                    Device ID
                  </span>

                  <span className="font-medium">
                    {
                      latest?.device
                        .deviceId
                    }
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-500">
                    Device Status
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClasses(
                      latest?.device.status
                    )}`}
                  >
                    {
                      latest?.device
                        .status
                    }
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Overall Soil Condition
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClasses(
                      recommendation
                        ?.overallStatus
                    )}`}
                  >
                    {recommendation?.overallStatus ??
                      "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}