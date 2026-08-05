import { webcrypto } from "node:crypto";
import "dotenv/config";

import mongoose, { Types } from "mongoose";

import { connectDatabase } from "../src/config/database.js";
import { CropPerformanceModel } from "../src/models/crop-performance.model.js";
import { ExperimentModel } from "../src/models/experiment.model.js";
import { LabResultModel } from "../src/models/lab-result.model.js";
import { ObservationModel } from "../src/models/observation.model.js";
import { PlotModel } from "../src/models/plot.model.js";
import { TreatmentModel } from "../src/models/treatment.model.js";
import { WeatherModel } from "../src/models/weather.model.js";

if (!globalThis.crypto) {
  Object.defineProperty(globalThis, "crypto", {
    value: webcrypto,
    configurable: true,
  });
}

const DEMO_EXPERIMENT_CODE = "AGM-DEMO-001";

function randomBetween(min: number, max: number): number {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

function randomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

interface TreatmentSeed {
  treatmentCode: string;
  name: string;
  description: string;
  agroMatType?: string;
  materialSource?: string;
  thicknessMm?: number;
  density?: number;
  applicationRate?: number;
  isControl: boolean;

  moistureBonus: number;
  heightBonus: number;
  yieldBonus: number;
  weedReduction: number;
  degradationRate: number;
}

const treatmentSeeds: TreatmentSeed[] = [
  {
    treatmentCode: "T0",
    name: "Control - No Agro Mat",
    description: "Crop cultivated without an agro mat",
    isControl: true,

    moistureBonus: 0,
    heightBonus: 0,
    yieldBonus: 0,
    weedReduction: 0,
    degradationRate: 0,
  },
  {
    treatmentCode: "T1",
    name: "Coconut Fibre Agro Mat",
    description: "Agro mat produced from coconut fibre waste",
    agroMatType: "Coconut fibre",
    materialSource: "Coconut processing waste",
    thicknessMm: 10,
    density: 250,
    applicationRate: 1,
    isControl: false,

    moistureBonus: 14,
    heightBonus: 3.8,
    yieldBonus: 1.8,
    weedReduction: 7,
    degradationRate: 1.2,
  },
  {
    treatmentCode: "T2",
    name: "Paddy Straw Agro Mat",
    description: "Agro mat produced from paddy straw",
    agroMatType: "Paddy straw",
    materialSource: "Rice farming residue",
    thicknessMm: 12,
    density: 220,
    applicationRate: 1,
    isControl: false,

    moistureBonus: 9,
    heightBonus: 2.4,
    yieldBonus: 1.1,
    weedReduction: 5,
    degradationRate: 1.8,
  },
  {
    treatmentCode: "T3",
    name: "Recycled Paper Agro Mat",
    description: "Biodegradable agro mat produced from recycled paper",
    agroMatType: "Recycled paper",
    materialSource: "Recovered paper waste",
    thicknessMm: 8,
    density: 190,
    applicationRate: 1,
    isControl: false,

    moistureBonus: 7,
    heightBonus: 1.7,
    yieldBonus: 0.7,
    weedReduction: 4,
    degradationRate: 2.8,
  },
];

async function removePreviousDemoData(): Promise<void> {
  const existingExperiment = await ExperimentModel.findOne({
    experimentCode: DEMO_EXPERIMENT_CODE,
  });

  if (!existingExperiment) {
    return;
  }

  const experimentId = existingExperiment._id;

  await Promise.all([
    CropPerformanceModel.deleteMany({ experimentId }),
    ObservationModel.deleteMany({ experimentId }),
    LabResultModel.deleteMany({ experimentId }),
    WeatherModel.deleteMany({ experimentId }),
    PlotModel.deleteMany({ experimentId }),
    TreatmentModel.deleteMany({ experimentId }),
  ]);

  await ExperimentModel.deleteOne({
    _id: experimentId,
  });

  console.log("Previous demo data removed");
}

async function createDemoExperiment() {
  return ExperimentModel.create({
    experimentCode: DEMO_EXPERIMENT_CODE,
    title: "Comparative Evaluation of Waste-Derived Agro Mats",
    description:
      "Demo experiment comparing coconut fibre, paddy straw, recycled paper and control treatments.",
    cropType: "Tomato",
    cropVariety: "Thilina",
    location: {
      siteName: "Batticaloa Agro Research Field",
      district: "Batticaloa",
      latitude: 7.717,
      longitude: 81.7,
    },
    startDate: new Date("2026-06-01T00:00:00.000Z"),
    objective:
      "Compare soil moisture retention, plant growth, weed suppression and crop yield.",
    methodology:
      "Randomized treatment trial with three replicate plots per treatment.",
    status: "active",
  });
}

async function createTreatments(
  experimentId: Types.ObjectId
) {
  const treatments = [];

  for (const seed of treatmentSeeds) {
    const treatment = await TreatmentModel.create({
      experimentId,
      treatmentCode: seed.treatmentCode,
      name: seed.name,
      description: seed.description,
      agroMatType: seed.agroMatType,
      materialSource: seed.materialSource,
      thicknessMm: seed.thicknessMm,
      density: seed.density,
      applicationRate: seed.applicationRate,
      isControl: seed.isControl,
    });

    treatments.push({
      document: treatment,
      seed,
    });
  }

  return treatments;
}

async function createPlots(
  experimentId: Types.ObjectId,
  treatments: Awaited<ReturnType<typeof createTreatments>>
) {
  const plots = [];

  for (const treatment of treatments) {
    for (let replicate = 1; replicate <= 3; replicate += 1) {
      const plot = await PlotModel.create({
        experimentId,
        treatmentId: treatment.document._id,
        plotCode: `${treatment.seed.treatmentCode}-R${replicate}`,
        replicateNumber: replicate,
        areaSquareMeters: 10,
        rowCount: 5,
        plantCount: 20,
        soilType: "Sandy loam",
        notes: `Replicate ${replicate} for ${treatment.seed.name}`,
      });

      plots.push({
        document: plot,
        treatmentDocument: treatment.document,
        treatmentSeed: treatment.seed,
        replicate,
      });
    }
  }

  return plots;
}

async function createWeatherRecords(
  experimentId: Types.ObjectId
): Promise<void> {
  const startDate = new Date("2026-06-01T08:00:00.000Z");
  const records = [];

  for (let day = 0; day < 60; day += 1) {
    const recordedAt = addDays(startDate, day);

    const temperature = randomBetween(27, 33);
    const rainfall =
      Math.random() < 0.35 ? randomBetween(1, 24) : 0;

    records.push({
      experimentId,
      recordedAt,
      source: "manual",
      temperatureC: temperature,
      minimumTemperatureC: randomBetween(23, 27),
      maximumTemperatureC: randomBetween(31, 35),
      relativeHumidityPercent: randomBetween(65, 88),
      rainfallMm: rainfall,
      windSpeedKmh: randomBetween(4, 18),
      solarRadiation: randomBetween(420, 760),
      weatherCondition:
        rainfall > 10
          ? "Rainy"
          : rainfall > 0
            ? "Light rain"
            : "Partly cloudy",
    });
  }

  await WeatherModel.insertMany(records);
}

async function createObservationsAndPerformance(
  experimentId: Types.ObjectId,
  plots: Awaited<ReturnType<typeof createPlots>>
): Promise<void> {
  const experimentStart = new Date(
    "2026-06-01T00:00:00.000Z"
  );

  const observationRecords = [];
  const performanceRecords = [];

  const measurementDays = [7, 14, 21, 28, 35, 42, 49, 56];

  for (const plot of plots) {
    const replicateVariation = randomBetween(-1.2, 1.2);

    for (const day of measurementDays) {
      const measurementDate = addDays(
        experimentStart,
        day
      );

      const growthProgress = day / 7;

      const soilMoisture =
        35 +
        plot.treatmentSeed.moistureBonus +
        randomBetween(-4, 4);

      const weedCoverage = Math.max(
        0,
        13 +
          growthProgress * 0.8 -
          plot.treatmentSeed.weedReduction +
          randomBetween(-2, 2)
      );

      const degradation = plot.treatmentSeed.isControl
        ? undefined
        : Math.min(
            100,
            growthProgress *
              plot.treatmentSeed.degradationRate +
              randomBetween(0, 2)
          );

      observationRecords.push({
        experimentId,
        treatmentId: plot.treatmentDocument._id,
        plotId: plot.document._id,
        observationDate: measurementDate,
        daysAfterPlanting: day,
        soilMoisturePercent: Number(
          soilMoisture.toFixed(2)
        ),
        soilTemperatureC: randomBetween(26, 31),
        airTemperatureC: randomBetween(28, 34),
        relativeHumidityPercent: randomBetween(67, 86),
        weedCoveragePercent: Number(
          weedCoverage.toFixed(2)
        ),
        pestIncidencePercent: randomBetween(0, 6),
        diseaseIncidencePercent: randomBetween(0, 4),
        matDegradationPercent: degradation,
        matCondition: plot.treatmentSeed.isControl
          ? undefined
          : degradation !== undefined && degradation < 15
            ? "excellent"
            : degradation !== undefined &&
                degradation < 30
              ? "good"
              : degradation !== undefined &&
                  degradation < 55
                ? "fair"
                : "poor",
        irrigationAmountMm: randomBetween(8, 16),
        notes: `Generated observation for ${plot.document.plotCode}`,
      });

      const plantHeight =
        7 +
        growthProgress * 4.5 +
        plot.treatmentSeed.heightBonus +
        replicateVariation +
        randomBetween(-1, 1);

      const leafCount = Math.max(
        2,
        Math.round(
          4 +
            growthProgress * 2.3 +
            plot.treatmentSeed.heightBonus / 2 +
            randomBetween(-1, 1)
        )
      );

      const estimatedYield =
        day >= 42
          ? Math.max(
              0,
              2.8 +
                (day - 42) * 0.13 +
                plot.treatmentSeed.yieldBonus +
                replicateVariation * 0.3 +
                randomBetween(-0.35, 0.35)
            )
          : undefined;

      performanceRecords.push({
        experimentId,
        treatmentId: plot.treatmentDocument._id,
        plotId: plot.document._id,
        measurementDate,
        daysAfterPlanting: day,
        plantHeightCm: Number(
          plantHeight.toFixed(2)
        ),
        leafCount,
        stemDiameterMm: randomBetween(
          3 + growthProgress * 0.5,
          4 + growthProgress * 0.7
        ),
        canopyWidthCm: randomBetween(
          8 + growthProgress * 2,
          11 + growthProgress * 2.5
        ),
        floweringPlantCount:
          day >= 28
            ? randomInteger(8, 20)
            : randomInteger(0, 5),
        fruitCount:
          day >= 35
            ? randomInteger(
                10 + growthProgress,
                25 + growthProgress * 2
              )
            : 0,
        freshBiomassG:
          day >= 49
            ? randomBetween(700, 1300)
            : undefined,
        dryBiomassG:
          day >= 49
            ? randomBetween(180, 420)
            : undefined,
        yieldKg:
          estimatedYield === undefined
            ? undefined
            : Number(estimatedYield.toFixed(2)),
        yieldPerHectareKg:
          estimatedYield === undefined
            ? undefined
            : Number(
                (estimatedYield * 1000).toFixed(2)
              ),
        survivalRatePercent: randomBetween(90, 100),
        notes: `Generated crop measurement for ${plot.document.plotCode}`,
      });
    }
  }

  await ObservationModel.insertMany(observationRecords);
  await CropPerformanceModel.insertMany(
    performanceRecords
  );
}

async function createLabResults(
  experimentId: Types.ObjectId,
  plots: Awaited<ReturnType<typeof createPlots>>
): Promise<void> {
  const records = [];

  for (const plot of plots) {
    const sampleCode = `SOIL-${plot.document.plotCode}-001`;

    records.push(
      {
        experimentId,
        treatmentId: plot.treatmentDocument._id,
        plotId: plot.document._id,
        sampleCode,
        sampleType: "soil",
        collectionDate: new Date(
          "2026-07-20T00:00:00.000Z"
        ),
        analysisDate: new Date(
          "2026-07-22T00:00:00.000Z"
        ),
        parameter: "pH",
        value: randomBetween(
          plot.treatmentSeed.isControl ? 5.9 : 6.2,
          plot.treatmentSeed.isControl ? 6.3 : 6.8
        ),
        unit: "pH",
        method: "Electrometric method",
        laboratoryName: "Batticaloa Soil Laboratory",
        qualityStatus: "valid",
      },
      {
        experimentId,
        treatmentId: plot.treatmentDocument._id,
        plotId: plot.document._id,
        sampleCode,
        sampleType: "soil",
        collectionDate: new Date(
          "2026-07-20T00:00:00.000Z"
        ),
        analysisDate: new Date(
          "2026-07-22T00:00:00.000Z"
        ),
        parameter: "Nitrogen",
        value: randomBetween(
          plot.treatmentSeed.isControl ? 20 : 26,
          plot.treatmentSeed.isControl ? 30 : 39
        ),
        unit: "mg/kg",
        method: "Kjeldahl method",
        laboratoryName: "Batticaloa Soil Laboratory",
        qualityStatus: "valid",
      }
    );
  }

  await LabResultModel.insertMany(records);
}

async function seed(): Promise<void> {
  try {
    await connectDatabase();

    console.log("Starting demo seed...");

    await removePreviousDemoData();

    const experiment = await createDemoExperiment();

    console.log("Experiment created");

    const treatments = await createTreatments(
      experiment._id
    );

    console.log(`${treatments.length} treatments created`);

    const plots = await createPlots(
      experiment._id,
      treatments
    );

    console.log(`${plots.length} plots created`);

    await createWeatherRecords(experiment._id);

    console.log("60 weather records created");

    await createObservationsAndPerformance(
      experiment._id,
      plots
    );

    console.log("96 observations created");
    console.log("96 crop-performance records created");

    await createLabResults(experiment._id, plots);

    console.log("24 lab results created");

    console.log("");
    console.log("Seed completed successfully");
    console.log(`Experiment ID: ${experiment._id}`);
    console.log(
      `Experiment code: ${DEMO_EXPERIMENT_CODE}`
    );
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

void seed();