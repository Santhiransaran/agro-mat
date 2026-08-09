"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  CalendarDays,
  CheckCircle2,
  Leaf,
  Sprout,
} from "lucide-react";

import {
  apiGet,
  apiPatch,
  apiPost,
} from "@/lib/api";

import { Crop } from "@/types/api";

interface ActiveCropResponse {
  success: boolean;
  data: Crop;
}

interface CreateCropResponse {
  success: boolean;
  message: string;
  data: Crop;
}

export default function CropSetupPage() {
  const [activeCrop, setActiveCrop] =
    useState<Crop | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [form, setForm] = useState({
    name: "",
    variety: "",
    plantingDate: "",
    expectedHarvestDate: "",
    farmArea: "",
    areaUnit: "acre",
    notes: "",
  });

  const loadActiveCrop = async () => {
  const response =
    await apiGet<ActiveCropResponse>(
      "/crops/active"
    );

  return response.data;
};

useEffect(() => {
  let cancelled = false;

  const fetchActiveCrop = async () => {
    try {
      const crop = await loadActiveCrop();

      if (!cancelled) {
        setActiveCrop(crop);
      }
    } catch {
      if (!cancelled) {
        setActiveCrop(null);
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  void fetchActiveCrop();

  return () => {
    cancelled = true;
  };
}, []);

  const handleChange = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    setMessage("");
    setError("");
    setSubmitting(true);

    try {
      const payload = {
        name: form.name,
        variety:
          form.variety || undefined,

        plantingDate:
          form.plantingDate,

        expectedHarvestDate:
          form.expectedHarvestDate ||
          undefined,

        farmArea:
          Number(form.farmArea),

        areaUnit:
          form.areaUnit,

        notes:
          form.notes || undefined,
      };

      const response =
        await apiPost<CreateCropResponse>(
          "/crops",
          payload
        );

      setMessage(response.message);

      setForm({
        name: "",
        variety: "",
        plantingDate: "",
        expectedHarvestDate: "",
        farmArea: "",
        areaUnit: "acre",
        notes: "",
      });

      const crop = await loadActiveCrop();
      setActiveCrop(crop);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create crop"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const completeCultivation =
    async () => {
      const confirmed =
        window.confirm(
          "Are you sure you want to complete the current cultivation?"
        );

      if (!confirmed) {
        return;
      }

      setMessage("");
      setError("");
      setSubmitting(true);

      try {
        const response =
          await apiPatch<{
            success: boolean;
            message: string;
          }>(
            "/crops/active/complete"
          );

        setMessage(response.message);

        try {
  const crop = await loadActiveCrop();
  setActiveCrop(crop);
} catch {
  setActiveCrop(null);
}
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to complete cultivation"
        );
      } finally {
        setSubmitting(false);
      }
    };

  return (
    <div className="p-5 md:p-8">
      <header className="mb-8">
        <p className="text-sm font-medium text-emerald-700">
          Farm Management
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Crop Setup
        </h1>

        <p className="mt-2 text-slate-500">
          Configure the crop currently
          growing on the monitored farm.
        </p>
      </header>

      {message && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          Loading crop information...
        </div>
      ) : activeCrop ? (
        <section className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-700">
                <Sprout size={28} />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Active Cultivation
                </p>

                <h2 className="text-2xl font-bold">
                  {activeCrop.name}
                </h2>

                <p className="text-sm text-slate-500">
                  {activeCrop.variety ||
                    "No variety specified"}
                </p>
              </div>
            </div>

            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              Active
            </span>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Planting Date
              </p>

              <p className="mt-2 font-semibold">
                {new Date(
                  activeCrop.plantingDate
                ).toLocaleDateString()}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Farm Area
              </p>

              <p className="mt-2 font-semibold">
                {activeCrop.farmArea}{" "}
                {activeCrop.areaUnit}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Expected Harvest
              </p>

              <p className="mt-2 font-semibold">
                {activeCrop.expectedHarvestDate
                  ? new Date(
                      activeCrop.expectedHarvestDate
                    ).toLocaleDateString()
                  : "Not specified"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Status
              </p>

              <p className="mt-2 font-semibold capitalize">
                {activeCrop.status}
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <button
              onClick={
                completeCultivation
              }
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircle2 size={18} />

              {submitting
                ? "Processing..."
                : "Complete Cultivation"}
            </button>

            <p className="mt-3 text-xs text-slate-500">
              Use this only after the crop
              has been harvested.
            </p>
          </div>
        </section>
      ) : (
        <section className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-7 flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
              <Leaf />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Start New Cultivation
              </h2>

              <p className="text-sm text-slate-500">
                Enter the crop information
                once at the beginning.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Crop Name
                </label>

                <input
                  required
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Tomato"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Variety
                </label>

                <input
                  name="variety"
                  value={form.variety}
                  onChange={handleChange}
                  placeholder="Thilina"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Planting Date
                </label>

                <div className="relative">
                  <CalendarDays
                    size={18}
                    className="absolute left-4 top-3.5 text-slate-400"
                  />

                  <input
                    required
                    type="date"
                    name="plantingDate"
                    value={
                      form.plantingDate
                    }
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Expected Harvest Date
                </label>

                <input
                  type="date"
                  name="expectedHarvestDate"
                  value={
                    form.expectedHarvestDate
                  }
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Farm Area
                </label>

                <input
                  required
                  min="0.01"
                  step="0.01"
                  type="number"
                  name="farmArea"
                  value={form.farmArea}
                  onChange={handleChange}
                  placeholder="1"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Area Unit
                </label>

                <select
                  name="areaUnit"
                  value={form.areaUnit}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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

            <div>
              <label className="mb-2 block text-sm font-medium">
                Notes
              </label>

              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Optional notes about this cultivation"
                className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sprout size={18} />

              {submitting
                ? "Starting..."
                : "Start Cultivation"}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}