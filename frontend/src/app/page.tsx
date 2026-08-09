import {
  Activity,
  Droplets,
  FlaskConical,
  Gauge,
  Leaf,
  Thermometer,
  Waves,
  Wind,
} from "lucide-react";

import SensorCard from "@/components/dashboard/SensorCard";

import { apiGet } from "@/lib/api";

import {
  Alert,
  Crop,
  Recommendation,
  SensorReading,
  ParameterAnalysis,
} from "@/types/api";

interface ActiveCropResponse {
  success: boolean;
  data: Crop;
}

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

interface AlertResponse {
  success: boolean;
  count: number;
  data: Alert[];
}

async function getDashboardData() {
  const results = await Promise.allSettled([
    apiGet<ActiveCropResponse>(
      "/crops/active"
    ),

    apiGet<LatestReadingResponse>(
      "/readings/AGRO-001/latest"
    ),

    apiGet<RecommendationResponse>(
      "/recommendations/AGRO-001"
    ),

    apiGet<AlertResponse>(
      "/alerts?resolved=false"
    ),
  ]);

  return {
    crop:
      results[0].status === "fulfilled"
        ? results[0].value.data
        : null,

    latest:
      results[1].status === "fulfilled"
        ? results[1].value
        : null,

    recommendation:
      results[2].status === "fulfilled"
        ? results[2].value.data
        : null,

    alerts:
      results[3].status === "fulfilled"
        ? results[3].value.data
        : [],
  };
}

function statusClasses(
  status?: string
): string {
  switch (status) {
    case "good":
    case "normal":
    case "online":
      return "bg-emerald-100 text-emerald-700";

    case "attention":
    case "low":
    case "high":
      return "bg-amber-100 text-amber-700";

    case "critical":
    case "offline":
      return "bg-red-100 text-red-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default async function Dashboard() {
  const {
    crop,
    latest,
    recommendation,
    alerts,
  } = await getDashboardData();

  const reading = latest?.data;

  return (
    <div className="p-5 md:p-8">
      <header className="mb-8">
        <p className="text-sm font-medium text-emerald-700">
          IoT Smart Agriculture
        </p>

        <div className="mt-1 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Farm Dashboard
            </h1>

            <p className="mt-1 text-slate-500">
              Live soil and environmental monitoring
            </p>
          </div>

          {latest && (
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <span
                className={`h-3 w-3 rounded-full ${
                  latest.device.status ===
                  "online"
                    ? "bg-emerald-500"
                    : "bg-red-500"
                }`}
              />

              <div>
                <p className="text-sm font-semibold">
                  {latest.device.name}
                </p>

                <p className="text-xs text-slate-500">
                  {latest.device.deviceId}
                </p>
              </div>

              <span
                className={`ml-3 rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(
                  latest.device.status
                )}`}
              >
                {latest.device.status}
              </span>
            </div>
          )}
        </div>
      </header>

      <section className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Active Crop
          </p>

          {crop ? (
            <>
              <div className="mt-3 flex items-center gap-3">
                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                  <Leaf />
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    {crop.name}
                  </h2>

                  <p className="text-sm text-slate-500">
                    {crop.variety ??
                      "No variety specified"}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex justify-between border-t border-slate-100 pt-4 text-sm">
                <span className="text-slate-500">
                  Farm Area
                </span>

                <span className="font-semibold">
                  {crop.farmArea}{" "}
                  {crop.areaUnit}
                </span>
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              No active crop configured.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Soil Condition
          </p>

          <div className="mt-3">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusClasses(
                recommendation?.overallStatus
              )}`}
            >
              {recommendation?.overallStatus ??
                "No data"}
            </span>
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Based on the latest sensor
            measurements and active crop
            reference ranges.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Active Alerts
          </p>

          <div className="mt-2 text-4xl font-bold">
            {alerts.length}
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Conditions currently requiring
            attention
          </p>
        </div>
      </section>

      <div className="mb-4">
        <h2 className="text-lg font-bold">
          Latest Sensor Readings
        </h2>

        <p className="text-sm text-slate-500">
          Latest measurements from AGRO-001
        </p>
      </div>

      {reading ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-semibold">
            No sensor data available
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Send a sensor reading to AGRO-001
            to populate the dashboard.
          </p>
        </div>
      )}

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold">
            Fertilizer Recommendation
          </h2>

          {recommendation ? (
            <div className="mt-5 space-y-4">
              {(
                  Object.values(
                    recommendation.nutrients
                  ) as ParameterAnalysis[]
                ).map((item) => (
                <div
                  key={item.parameter}
                  className="border-b border-slate-100 pb-4 last:border-0"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium">
                      {item.parameter}
                    </p>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.message}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              Recommendation unavailable.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold">
            Irrigation Status
          </h2>

          {recommendation ? (
            <>
              <div className="mt-5 flex items-center gap-4">
                <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                  <Droplets />
                </div>

                <div>
                  <p className="text-2xl font-bold">
                    {
                      recommendation
                        .irrigation.value
                    }
                    %
                  </p>

                  <span
                    className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                      recommendation
                        .irrigation.status
                    )}`}
                  >
                    {
                      recommendation
                        .irrigation.status
                    }
                  </span>
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-slate-500">
                {
                  recommendation.irrigation
                    .message
                }
              </p>
            </>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              Irrigation recommendation
              unavailable.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}