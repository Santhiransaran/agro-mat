"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  Droplets,
  FlaskConical,
  Gauge,
  Leaf,
  RefreshCw,
  Thermometer,
  Waves,
  Wind,
} from "lucide-react";

import SensorCard from "@/components/dashboard/SensorCard";

import { apiGet } from "@/lib/api";

import {
  Alert,
  Crop,
  ParameterAnalysis,
  Recommendation,
  SensorReading,
} from "@/types/api";


// ============================================================
// Types
// ============================================================

interface DeviceInfo {
  _id: string;
  deviceId: string;
  name: string;
  location?: string;
  status: "online" | "offline";
  lastSeen?: string;
  isActive?: boolean;
}

interface CropWithDevice extends Crop {
  device?: DeviceInfo;
}

interface ActiveCropsResponse {
  success: boolean;
  count: number;
  data: CropWithDevice[];
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


// ============================================================
// Status Color
// ============================================================

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


// ============================================================
// Dashboard
// ============================================================

export default function Dashboard() {

  // ==========================================================
  // Crop / Device Selection
  // ==========================================================

  const [
    crops,
    setCrops,
  ] =
    useState<CropWithDevice[]>(
      []
    );


  const [
    selectedDeviceId,
    setSelectedDeviceId,
  ] =
    useState(
      ""
    );


  // ==========================================================
  // Dashboard Data
  // ==========================================================

  const [
    latest,
    setLatest,
  ] =
    useState<LatestReadingResponse | null>(
      null
    );


  const [
    recommendation,
    setRecommendation,
  ] =
    useState<Recommendation | null>(
      null
    );


  const [
    alerts,
    setAlerts,
  ] =
    useState<Alert[]>(
      []
    );


  // ==========================================================
  // UI State
  // ==========================================================

  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );


  const [
    refreshing,
    setRefreshing,
  ] =
    useState(
      false
    );


  const [
    error,
    setError,
  ] =
    useState(
      ""
    );


  // ==========================================================
  // Currently Selected Crop
  // ==========================================================

  const selectedCrop =
    useMemo(
      () => {

        return crops.find(
          (
            crop
          ) =>
            crop.device?.deviceId ===
            selectedDeviceId
        ) ?? null;

      },
      [
        crops,
        selectedDeviceId,
      ]
    );


  // ==========================================================
  // Load Active Crops
  // ==========================================================

  const loadCrops =
    useCallback(
      async () => {

        try {

          const response =
            await apiGet<ActiveCropsResponse>(
              "/crops/active-with-devices"
            );


          setCrops(
            response.data
          );


          // --------------------------------------------------
          // Select first crop which has an assigned device
          // --------------------------------------------------

          const firstAssignedCrop =
  response.data.find(
    (crop) =>
      Boolean(crop.device?.deviceId)
  );

const firstDeviceId =
  firstAssignedCrop?.device?.deviceId ?? "";

if (firstDeviceId) {
  setSelectedDeviceId((current) => {
    const stillExists =
      response.data.some(
        (crop) =>
          crop.device?.deviceId === current
      );

    if (current && stillExists) {
      return current;
    }

    return firstDeviceId;
  });
}

          setError(
            ""
          );

        } catch (
          err
        ) {

          setError(
            err instanceof Error
              ? err.message
              : "Failed to load crops."
          );

        } finally {

          setLoading(
            false
          );
        }
      },
      []
    );


  // ==========================================================
  // Load Device Dashboard Data
  // ==========================================================

  const loadDeviceData =
    useCallback(
      async (
        deviceId: string,
        showRefreshIndicator = false
      ) => {

        if (
          !deviceId
        ) {

          return;
        }


        if (
          showRefreshIndicator
        ) {

          setRefreshing(
            true
          );
        }


        const results =
          await Promise.allSettled(
            [

              // Latest sensor reading

              apiGet<LatestReadingResponse>(
                `/readings/${deviceId}/latest`
              ),


              // Recommendation

              apiGet<RecommendationResponse>(
                `/recommendations/${deviceId}`
              ),


              // Alerts for selected device

              apiGet<AlertResponse>(
                `/alerts/device/${deviceId}`
              ),
            ]
          );


        // ----------------------------------------------------
        // Latest Reading
        // ----------------------------------------------------

        if (
          results[0].status ===
          "fulfilled"
        ) {

          setLatest(
            results[0].value
          );

        } else {

          setLatest(
            null
          );
        }


        // ----------------------------------------------------
        // Recommendation
        // ----------------------------------------------------

        if (
          results[1].status ===
          "fulfilled"
        ) {

          setRecommendation(
            results[1].value.data
          );

        } else {

          setRecommendation(
            null
          );
        }


        // ----------------------------------------------------
        // Alerts
        // ----------------------------------------------------

        if (
          results[2].status ===
          "fulfilled"
        ) {

          const activeAlerts =
            results[2].value.data.filter(
              (
                alert
              ) =>
                !alert.isResolved
            );


          setAlerts(
            activeAlerts
          );

        } else {

          setAlerts(
            []
          );
        }


        setRefreshing(
          false
        );
      },
      []
    );


  // ==========================================================
  // Initial Crop Loading
  // ==========================================================

  useEffect(
    () => {

      void loadCrops();

    },
    [
      loadCrops,
    ]
  );


  // ==========================================================
  // Selected Device Data + Auto Refresh
  // ==========================================================

  useEffect(
    () => {

      if (
        !selectedDeviceId
      ) {

        return;
      }


      void loadDeviceData(
        selectedDeviceId
      );


      // ------------------------------------------------------
      // Refresh every 30 seconds
      // ------------------------------------------------------

      const interval =
        window.setInterval(
          () => {

            void loadDeviceData(
              selectedDeviceId
            );

          },
          30000
        );


      return () => {

        window.clearInterval(
          interval
        );
      };

    },
    [
      selectedDeviceId,
      loadDeviceData,
    ]
  );


  // ==========================================================
  // Current Reading
  // ==========================================================

  const reading =
    latest?.data;


  // ==========================================================
  // Device Information
  // ==========================================================

  const currentDevice =
    latest?.device ??
    selectedCrop?.device ??
    null;


  // ==========================================================
  // Loading Screen
  // ==========================================================

  if (
    loading
  ) {

    return (
      <div className="p-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

          <RefreshCw className="mx-auto h-7 w-7 animate-spin text-emerald-600" />

          <p className="mt-4 font-semibold text-slate-800">
            Loading farm dashboard...
          </p>

        </div>
      </div>
    );
  }


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <div className="p-5 md:p-8">


      {/* ==================================================== */}
      {/* Header */}
      {/* ==================================================== */}

      <header className="mb-8">

        <p className="text-sm font-medium text-emerald-700">
          IoT Smart Agriculture
        </p>


        <div className="mt-1 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">


          {/* ================================================= */}
          {/* Heading */}
          {/* ================================================= */}

          <div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Farm Dashboard
            </h1>


            <p className="mt-1 text-slate-500">
              Live soil and environmental monitoring
            </p>

          </div>


          {/* ================================================= */}
          {/* Crop Selector */}
          {/* ================================================= */}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">


            <div className="min-w-[260px]">

              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Monitor Crop / Device
              </label>


              <select
                value={
                  selectedDeviceId
                }
                onChange={
                  (
                    event
                  ) => {

                    setLatest(
                      null
                    );

                    setRecommendation(
                      null
                    );

                    setAlerts(
                      []
                    );

                    setSelectedDeviceId(
                      event.target.value
                    );
                  }
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >

                {
                  crops.length ===
                    0 && (

                    <option value="">
                      No crops available
                    </option>

                  )
                }


                {
                  crops.map(
                    (
                      crop
                    ) => {

                      const device =
                        crop.device;


                      if (
                        !device
                      ) {

                        return (
                          <option
                            key={
                              crop._id
                            }
                            value=""
                            disabled
                          >
                            {crop.name} - Device not assigned
                          </option>
                        );
                      }


                      return (

                        <option
                          key={
                            crop._id
                          }
                          value={
                            device.deviceId
                          }
                        >
                          {crop.name}
                          {crop.variety
                            ? ` (${crop.variety})`
                            : ""}
                          {" - "}
                          {device.deviceId}
                        </option>

                      );
                    }
                  )
                }

              </select>

            </div>


            {/* ================================================= */}
            {/* Manual Refresh */}
            {/* ================================================= */}

            <button
              type="button"
              onClick={
                () => {

                  if (
                    selectedDeviceId
                  ) {

                    void loadDeviceData(
                      selectedDeviceId,
                      true
                    );
                  }
                }
              }
              disabled={
                !selectedDeviceId ||
                refreshing
              }
              className="inline-flex h-[50px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >

              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh

            </button>

          </div>

        </div>

      </header>


      {/* ==================================================== */}
      {/* Error */}
      {/* ==================================================== */}

      {
        error && (

          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

            {
              error
            }

          </div>

        )
      }


      {/* ==================================================== */}
      {/* No Device */}
      {/* ==================================================== */}

      {
        !selectedDeviceId && (

          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">

            <Leaf className="mx-auto h-10 w-10 text-slate-400" />


            <p className="mt-4 font-semibold text-slate-800">
              No IoT device assigned
            </p>


            <p className="mt-1 text-sm text-slate-500">
              Add a crop and assign an IoT device from Crop Setup.
            </p>

          </div>

        )
      }


      {
        selectedDeviceId && (

          <>


            {/* ================================================= */}
            {/* Summary Cards */}
            {/* ================================================= */}

            <section className="mb-6 grid gap-4 lg:grid-cols-3">


              {/* =============================================== */}
              {/* Active Crop */}
              {/* =============================================== */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <p className="text-sm text-slate-500">
                  Active Crop
                </p>


                {
                  selectedCrop ? (

                    <>

                      <div className="mt-3 flex items-center gap-3">

                        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">

                          <Leaf />

                        </div>


                        <div>

                          <h2 className="text-xl font-bold text-slate-900">
                            {
                              selectedCrop.name
                            }
                          </h2>


                          <p className="text-sm text-slate-500">
                            {
                              selectedCrop.variety ??
                              "No variety specified"
                            }
                          </p>

                        </div>

                      </div>


                      <div className="mt-5 flex justify-between border-t border-slate-100 pt-4 text-sm">

                        <span className="text-slate-500">
                          Farm Area
                        </span>


                        <span className="font-semibold">
                          {
                            selectedCrop.farmArea
                          }{" "}
                          {
                            selectedCrop.areaUnit
                          }
                        </span>

                      </div>

                    </>

                  ) : (

                    <p className="mt-3 text-sm text-slate-500">
                      Crop unavailable.
                    </p>

                  )
                }

              </div>


              {/* =============================================== */}
              {/* Soil Condition */}
              {/* =============================================== */}

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

                    {
                      recommendation?.overallStatus ??
                      "No recommendation"
                    }

                  </span>

                </div>


                <p className="mt-5 text-sm leading-6 text-slate-500">

                  {
                    recommendation
                      ? `Based on ${selectedCrop?.name ?? "crop"} requirements and the latest ${selectedDeviceId} sensor reading.`
                      : "Recommendation data is currently unavailable for this crop."
                  }

                </p>

              </div>


              {/* =============================================== */}
              {/* Alerts */}
              {/* =============================================== */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <p className="text-sm text-slate-500">
                  Active Alerts
                </p>


                <div className="mt-2 text-4xl font-bold text-slate-900">

                  {
                    alerts.length
                  }

                </div>


                <p className="mt-2 text-sm text-slate-500">
                  Conditions currently requiring attention
                </p>

              </div>

            </section>


            {/* ================================================= */}
            {/* Device Status */}
            {/* ================================================= */}

            {
              currentDevice && (

                <section className="mb-8">

                  <div className="inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">

                    <span
                      className={`h-3 w-3 rounded-full ${
                        currentDevice.status ===
                        "online"
                          ? "bg-emerald-500"
                          : "bg-red-500"
                      }`}
                    />


                    <div>

                      <p className="text-sm font-semibold text-slate-900">
                        {
                          currentDevice.name
                        }
                      </p>


                      <p className="text-xs text-slate-500">
                        {
                          currentDevice.deviceId
                        }
                      </p>

                    </div>


                    <span
                      className={`ml-3 rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(
                        currentDevice.status
                      )}`}
                    >

                      {
                        currentDevice.status
                      }

                    </span>

                  </div>

                </section>

              )
            }


            {/* ================================================= */}
            {/* Sensor Header */}
            {/* ================================================= */}

            <div className="mb-4">

              <h2 className="text-lg font-bold text-slate-900">
                Latest Sensor Readings
              </h2>


              <p className="text-sm text-slate-500">
                Latest measurements from{" "}
                <span className="font-medium">
                  {
                    selectedDeviceId
                  }
                </span>
              </p>

            </div>


            {/* ================================================= */}
            {/* Sensor Cards */}
            {/* ================================================= */}

            {
              reading ? (

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">


                  <SensorCard
                    title="Nitrogen"
                    value={
                      reading.nitrogen
                    }
                    unit="mg/kg"
                    subtitle={
                      recommendation
                        ?.nutrients
                        .nitrogen
                        .status
                    }
                    icon={
                      FlaskConical
                    }
                  />


                  <SensorCard
                    title="Phosphorus"
                    value={
                      reading.phosphorus
                    }
                    unit="mg/kg"
                    subtitle={
                      recommendation
                        ?.nutrients
                        .phosphorus
                        .status
                    }
                    icon={
                      FlaskConical
                    }
                  />


                  <SensorCard
                    title="Potassium"
                    value={
                      reading.potassium
                    }
                    unit="mg/kg"
                    subtitle={
                      recommendation
                        ?.nutrients
                        .potassium
                        .status
                    }
                    icon={
                      Activity
                    }
                  />


                  <SensorCard
                    title="Soil pH"
                    value={
                      reading.ph
                    }
                    subtitle={
                      recommendation
                        ?.ph
                        .status
                    }
                    icon={
                      Gauge
                    }
                  />


                  <SensorCard
                    title="Soil EC"
                    value={
                      reading.ec
                    }
                    unit="mS/cm"
                    subtitle={
                      recommendation
                        ?.ec
                        .status
                    }
                    icon={
                      Waves
                    }
                  />


                  <SensorCard
                    title="Soil Moisture"
                    value={
                      reading.soilMoisture
                    }
                    unit="%"
                    subtitle={
                      recommendation
                        ?.irrigation
                        .status
                    }
                    icon={
                      Droplets
                    }
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
                    icon={
                      Thermometer
                    }
                  />


                  <SensorCard
                    title="Air Temperature"
                    value={
                      reading.airTemperature
                    }
                    unit="°C"
                    icon={
                      Thermometer
                    }
                  />


                  <SensorCard
                    title="Humidity"
                    value={
                      reading.humidity
                    }
                    unit="%"
                    icon={
                      Wind
                    }
                  />

                </section>

              ) : (

                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">

                  <p className="font-semibold text-slate-800">
                    No sensor data available
                  </p>


                  <p className="mt-1 text-sm text-slate-500">
                    Start IoT device{" "}
                    {
                      selectedDeviceId
                    }{" "}
                    and wait for a sensor reading.
                  </p>

                </div>

              )
            }


            {/* ================================================= */}
            {/* Recommendation */}
            {/* ================================================= */}

            <section className="mt-8 grid gap-6 xl:grid-cols-2">


              {/* =============================================== */}
              {/* Fertilizer */}
              {/* =============================================== */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <h2 className="font-bold text-slate-900">
                  Fertilizer Recommendation
                </h2>


                {
                  recommendation ? (

                    <div className="mt-5 space-y-4">

                      {
                        (
                          Object.values(
                            recommendation.nutrients
                          ) as ParameterAnalysis[]
                        ).map(
                          (
                            item
                          ) => (

                            <div
                              key={
                                item.parameter
                              }
                              className="border-b border-slate-100 pb-4 last:border-0"
                            >

                              <div className="flex items-center justify-between gap-4">

                                <p className="font-medium">
                                  {
                                    item.parameter
                                  }
                                </p>


                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                                    item.status
                                  )}`}
                                >

                                  {
                                    item.status
                                  }

                                </span>

                              </div>


                              <p className="mt-2 text-sm leading-6 text-slate-500">

                                {
                                  item.message
                                }

                              </p>

                            </div>

                          )
                        )
                      }

                    </div>

                  ) : (

                    <div className="mt-4 rounded-xl bg-amber-50 p-4">

                      <p className="text-sm font-medium text-amber-800">
                        Recommendation unavailable
                      </p>


                      <p className="mt-1 text-sm leading-6 text-amber-700">
                        Crop requirement ranges may not yet be configured for{" "}
                        {
                          selectedCrop?.name ??
                          "this crop"
                        }.
                      </p>

                    </div>

                  )
                }

              </div>


              {/* =============================================== */}
              {/* Irrigation */}
              {/* =============================================== */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <h2 className="font-bold text-slate-900">
                  Irrigation Status
                </h2>


                {
                  recommendation ? (

                    <>

                      <div className="mt-5 flex items-center gap-4">

                        <div className="rounded-xl bg-blue-50 p-3 text-blue-700">

                          <Droplets />

                        </div>


                        <div>

                          <p className="text-2xl font-bold">

                            {
                              recommendation
                                .irrigation
                                .value
                            }
                            %

                          </p>


                          <span
                            className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                              recommendation
                                .irrigation
                                .status
                            )}`}
                          >

                            {
                              recommendation
                                .irrigation
                                .status
                            }

                          </span>

                        </div>

                      </div>


                      <p className="mt-5 text-sm leading-6 text-slate-500">

                        {
                          recommendation
                            .irrigation
                            .message
                        }

                      </p>

                    </>

                  ) : (

                    <p className="mt-4 text-sm text-slate-500">
                      Irrigation recommendation unavailable.
                    </p>

                  )
                }

              </div>

            </section>

          </>

        )
      }

    </div>
  );
}