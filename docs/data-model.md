1. Users

Researchers and administrators.

{
  _id: ObjectId,
  name: string,
  email: string,
  passwordHash: string,
  role: "admin" | "researcher" | "viewer",
  organization?: string,
  createdAt: Date,
  updatedAt: Date
}

Authentication can be added after the core CRUD operations work.

2. Experiments

Contains the main research project information.

{
  _id: ObjectId,
  experimentCode: string,
  title: string,
  description?: string,

  cropType: string,
  cropVariety?: string,

  location: {
    siteName: string,
    district?: string,
    latitude?: number,
    longitude?: number
  },

  startDate: Date,
  endDate?: Date,

  objective?: string,
  methodology?: string,

  status: "planned" | "active" | "completed" | "cancelled",

  createdBy?: ObjectId,
  createdAt: Date,
  updatedAt: Date
}

Example:

{
  "experimentCode": "AGM-2026-001",
  "title": "Effect of Coconut Fibre Agro Mats on Tomato Growth",
  "cropType": "Tomato",
  "cropVariety": "Thilina",
  "location": {
    "siteName": "Batticaloa Research Field",
    "district": "Batticaloa"
  },
  "startDate": "2026-08-01",
  "status": "active"
}
3. Treatments

A treatment represents one experimental condition.

{
  _id: ObjectId,
  experimentId: ObjectId,

  treatmentCode: string,
  name: string,
  description?: string,

  agroMatType?: string,
  materialSource?: string,
  thicknessMm?: number,
  density?: number,
  applicationRate?: number,

  isControl: boolean,

  createdAt: Date,
  updatedAt: Date
}

Examples:

T0 - Control, no agro mat
T1 - Coconut fibre agro mat
T2 - Paddy straw agro mat
T3 - Recycled paper agro mat
4. Plots

Each treatment can have multiple plots or replicates.

{
  _id: ObjectId,
  experimentId: ObjectId,
  treatmentId: ObjectId,

  plotCode: string,
  replicateNumber: number,

  areaSquareMeters?: number,
  rowCount?: number,
  plantCount?: number,

  soilType?: string,
  notes?: string,

  createdAt: Date,
  updatedAt: Date
}

Example:

Treatment T1
 ├── Plot T1-R1
 ├── Plot T1-R2
 └── Plot T1-R3

This allows us to calculate averages and standard deviations across replicates.

5. Field observations

Regular observations made in the field.

{
  _id: ObjectId,

  experimentId: ObjectId,
  treatmentId: ObjectId,
  plotId: ObjectId,

  observationDate: Date,
  daysAfterPlanting?: number,

  soilMoisturePercent?: number,
  soilTemperatureC?: number,
  airTemperatureC?: number,
  relativeHumidityPercent?: number,

  weedCoveragePercent?: number,
  pestIncidencePercent?: number,
  diseaseIncidencePercent?: number,

  matDegradationPercent?: number,
  matCondition?: "excellent" | "good" | "fair" | "poor",

  irrigationAmountMm?: number,

  notes?: string,
  recordedBy?: ObjectId,

  createdAt: Date,
  updatedAt: Date
}
6. Lab results

Measurements collected from soil, plant, water or agro-mat samples.

A flexible structure is useful because different experiments may have different tests.

{
  _id: ObjectId,

  experimentId: ObjectId,
  treatmentId?: ObjectId,
  plotId?: ObjectId,

  sampleCode: string,
  sampleType: "soil" | "plant" | "water" | "agro_mat",

  collectionDate: Date,
  analysisDate?: Date,

  parameter: string,
  value: number,
  unit: string,

  method?: string,
  laboratoryName?: string,
  technician?: string,

  qualityStatus?: "valid" | "questionable" | "rejected",
  notes?: string,

  createdAt: Date,
  updatedAt: Date
}

Example documents:

{
  "sampleCode": "SOIL-T1-R1-001",
  "sampleType": "soil",
  "parameter": "pH",
  "value": 6.4,
  "unit": "pH"
}
{
  "sampleCode": "SOIL-T1-R1-001",
  "sampleType": "soil",
  "parameter": "Nitrogen",
  "value": 32.5,
  "unit": "mg/kg"
}
7. Weather records

Weather data associated with the experiment site.

{
  _id: ObjectId,

  experimentId: ObjectId,
  recordedAt: Date,

  source: "manual" | "sensor" | "weather_api",

  temperatureC?: number,
  minimumTemperatureC?: number,
  maximumTemperatureC?: number,

  relativeHumidityPercent?: number,
  rainfallMm?: number,
  windSpeedKmh?: number,
  solarRadiation?: number,

  weatherCondition?: string,
  notes?: string,

  createdAt: Date,
  updatedAt: Date
}

Weather normally belongs to the experiment location, so it does not always need treatmentId or plotId.

8. Crop performance

Crop-growth and yield measurements.

{
  _id: ObjectId,

  experimentId: ObjectId,
  treatmentId: ObjectId,
  plotId: ObjectId,

  measurementDate: Date,
  daysAfterPlanting?: number,

  plantHeightCm?: number,
  leafCount?: number,
  stemDiameterMm?: number,
  canopyWidthCm?: number,

  floweringPlantCount?: number,
  fruitCount?: number,

  freshBiomassG?: number,
  dryBiomassG?: number,

  yieldKg?: number,
  yieldPerHectareKg?: number,

  survivalRatePercent?: number,
  notes?: string,

  recordedBy?: ObjectId,

  createdAt: Date,
  updatedAt: Date
}