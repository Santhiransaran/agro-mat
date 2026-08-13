"use client";

import { FormEvent, useMemo, useState } from "react";
import { apiPost } from "@/lib/api";


// ============================================================
// Crop + Variety Options
// ============================================================

const cropOptions = {
  Tomato: [
    "Thilina",
    "Rajitha",
    "Other",
  ],

  Chilli: [
    "MI-2",
    "MI-3",
    "Other",
  ],

  Paddy: [
    "Bg 352",
    "Bg 366",
    "Other",
  ],

  Brinjal: [
    "Amanda",
    "Anjalee",
    "Other",
  ],

  Onion: [
    "Jaffna Local",
    "Other",
  ],
} as const;


type CropName =
  keyof typeof cropOptions;


type AreaUnit =
  | "acre"
  | "hectare"
  | "square_meter";


// ============================================================
// Page
// ============================================================

export default function CropSetupPage() {

  // ==========================================================
  // Crop State
  // ==========================================================

  const [
    cropName,
    setCropName,
  ] =
    useState<CropName>(
      "Tomato"
    );


  const [
    variety,
    setVariety,
  ] =
    useState(
      "Thilina"
    );


  const [
    plantingDate,
    setPlantingDate,
  ] =
    useState(
      ""
    );


  const [
    farmArea,
    setFarmArea,
  ] =
    useState(
      "1"
    );


  const [
    areaUnit,
    setAreaUnit,
  ] =
    useState<AreaUnit>(
      "acre"
    );


  // ==========================================================
  // Device State
  // ==========================================================

  const [
    deviceId,
    setDeviceId,
  ] =
    useState(
      "AGRO-002"
    );


  const [
    deviceName,
    setDeviceName,
  ] =
    useState(
      "Tomato Field Monitor"
    );


  const [
    location,
    setLocation,
  ] =
    useState(
      ""
    );


  // ==========================================================
  // UI State
  // ==========================================================

  const [
    loading,
    setLoading,
  ] =
    useState(
      false
    );


  const [
    message,
    setMessage,
  ] =
    useState(
      ""
    );


  const [
    error,
    setError,
  ] =
    useState(
      ""
    );


  // ==========================================================
  // Available Varieties
  // ==========================================================

  const varieties =
    useMemo(
      () => {

        return cropOptions[
          cropName
        ];

      },
      [
        cropName,
      ]
    );


  // ==========================================================
  // Crop Selection Change
  // ==========================================================

  function handleCropChange(
    value: CropName
  ) {

    setCropName(
      value
    );


    const firstVariety =
      cropOptions[
        value
      ][0];


    setVariety(
      firstVariety
    );


    setDeviceName(
      `${value} Field Monitor`
    );


    setMessage(
      ""
    );


    setError(
      ""
    );
  }


  // ==========================================================
  // Submit
  // ==========================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();


    setLoading(
      true
    );


    setMessage(
      ""
    );


    setError(
      ""
    );


    try {

      // ======================================================
      // ONE API REQUEST
      //
      // Backend will:
      //
      // 1. Check whether device already exists
      // 2. Reuse it if it exists
      // 3. Create it if it does not exist
      // 4. Create the crop
      // 5. Assign the device to the crop
      // ======================================================

      await apiPost(
        "/crops/with-device",
        {

          // --------------------------------------------------
          // Crop
          // --------------------------------------------------

          name:
            cropName,

          variety,

          plantingDate,

          farmArea:
            Number(
              farmArea
            ),

          areaUnit,


          // --------------------------------------------------
          // IoT Device
          // --------------------------------------------------

          deviceId:
            deviceId
              .trim()
              .toUpperCase(),

          deviceName:
            deviceName
              .trim(),

          deviceLocation:
            location
              .trim(),
        }
      );


      // ======================================================
      // Success
      // ======================================================

      setMessage(
        `${cropName} successfully added and ${deviceId
          .trim()
          .toUpperCase()} assigned to it.`
      );


      // ======================================================
      // Reset Device Fields For Next Crop
      // ======================================================

      setDeviceId(
        ""
      );


      setDeviceName(
        ""
      );


      setLocation(
        ""
      );


      setPlantingDate(
        ""
      );


      setFarmArea(
        "1"
      );


    } catch (
      err
    ) {

      setError(
        err instanceof Error
          ? err.message
          : "Failed to add crop and IoT device."
      );

    } finally {

      setLoading(
        false
      );
    }
  }


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <div className="space-y-6">

      {/* ==================================================== */}
      {/* Header */}
      {/* ==================================================== */}

      <div>

        <p className="text-sm font-medium text-emerald-600">
          Farm Management
        </p>


        <h1 className="text-3xl font-bold text-slate-900">
          Crop Setup
        </h1>


        <p className="mt-1 text-sm text-slate-500">
          Add a crop and register or assign its IoT monitoring device.
        </p>

      </div>


      {/* ==================================================== */}
      {/* Form */}
      {/* ==================================================== */}

      <form
        onSubmit={
          handleSubmit
        }
        className="max-w-4xl space-y-6"
      >


        {/* ================================================== */}
        {/* Crop Details */}
        {/* ================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6">

            <h2 className="text-lg font-semibold text-slate-900">
              Crop Details
            </h2>


            <p className="text-sm text-slate-500">
              Select the crop currently planted in this field.
            </p>

          </div>


          <div className="grid gap-5 md:grid-cols-2">


            {/* ============================================== */}
            {/* Crop Name */}
            {/* ============================================== */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Crop Name
              </label>


              <select
                value={
                  cropName
                }
                onChange={
                  (
                    event
                  ) =>
                    handleCropChange(
                      event
                        .target
                        .value as CropName
                    )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >

                {
                  Object
                    .keys(
                      cropOptions
                    )
                    .map(
                      (
                        crop
                      ) => (

                        <option
                          key={
                            crop
                          }
                          value={
                            crop
                          }
                        >
                          {
                            crop
                          }
                        </option>

                      )
                    )
                }

              </select>

            </div>


            {/* ============================================== */}
            {/* Variety */}
            {/* ============================================== */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Variety
              </label>


              <select
                value={
                  variety
                }
                onChange={
                  (
                    event
                  ) =>
                    setVariety(
                      event
                        .target
                        .value
                    )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >

                {
                  varieties.map(
                    (
                      item
                    ) => (

                      <option
                        key={
                          item
                        }
                        value={
                          item
                        }
                      >
                        {
                          item
                        }
                      </option>

                    )
                  )
                }

              </select>

            </div>


            {/* ============================================== */}
            {/* Planting Date */}
            {/* ============================================== */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Planting Date
              </label>


              <input
                type="date"
                value={
                  plantingDate
                }
                onChange={
                  (
                    event
                  ) =>
                    setPlantingDate(
                      event
                        .target
                        .value
                    )
                }
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />

            </div>


            {/* ============================================== */}
            {/* Farm Area */}
            {/* ============================================== */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Farm Area
              </label>


              <input
                type="number"
                min="0.01"
                step="0.01"
                value={
                  farmArea
                }
                onChange={
                  (
                    event
                  ) =>
                    setFarmArea(
                      event
                        .target
                        .value
                    )
                }
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />

            </div>


            {/* ============================================== */}
            {/* Area Unit */}
            {/* ============================================== */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Area Unit
              </label>


              <select
                value={
                  areaUnit
                }
                onChange={
                  (
                    event
                  ) =>
                    setAreaUnit(
                      event
                        .target
                        .value as AreaUnit
                    )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >

                <option value="acre">
                  Acre
                </option>


                <option value="hectare">
                  Hectare
                </option>


                <option value="square_meter">
                  Square Meter
                </option>

              </select>

            </div>

          </div>

        </section>


        {/* ================================================== */}
        {/* IoT Device */}
        {/* ================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6">

            <h2 className="text-lg font-semibold text-slate-900">
              IoT Device
            </h2>


            <p className="text-sm text-slate-500">
              Register a new device or assign an existing device to this crop.
            </p>

          </div>


          <div className="grid gap-5 md:grid-cols-2">


            {/* ============================================== */}
            {/* Device ID */}
            {/* ============================================== */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Device ID
              </label>


              <input
                type="text"
                value={
                  deviceId
                }
                onChange={
                  (
                    event
                  ) =>
                    setDeviceId(
                      event
                        .target
                        .value
                        .toUpperCase()
                    )
                }
                placeholder="AGRO-002"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 uppercase text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />

            </div>


            {/* ============================================== */}
            {/* Device Name */}
            {/* ============================================== */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Device Name
              </label>


              <input
                type="text"
                value={
                  deviceName
                }
                onChange={
                  (
                    event
                  ) =>
                    setDeviceName(
                      event
                        .target
                        .value
                    )
                }
                placeholder={`${cropName} Field Monitor`}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />

            </div>


            {/* ============================================== */}
            {/* Device Location */}
            {/* ============================================== */}

            <div className="md:col-span-2">

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Device Location
              </label>


              <input
                type="text"
                value={
                  location
                }
                onChange={
                  (
                    event
                  ) =>
                    setLocation(
                      event
                        .target
                        .value
                    )
                }
                placeholder="Field 2"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />

            </div>

          </div>

        </section>


        {/* ================================================== */}
        {/* Success Message */}
        {/* ================================================== */}

        {
          message && (

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">

              {
                message
              }

            </div>

          )
        }


        {/* ================================================== */}
        {/* Error Message */}
        {/* ================================================== */}

        {
          error && (

            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">

              {
                error
              }

            </div>

          )
        }


        {/* ================================================== */}
        {/* Submit */}
        {/* ================================================== */}

        <button
          type="submit"
          disabled={
            loading
          }
          className="rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >

          {
            loading
              ? "Adding Crop..."
              : "Add Crop & IoT Device"
          }

        </button>

      </form>

    </div>
  );
}