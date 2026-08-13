import mongoose, {
  Document,
  Model,
  Schema,
  Types,
} from "mongoose";

export interface ICrop extends Document {
  name: string;
  variety?: string;

  plantingDate: Date;
  expectedHarvestDate?: Date;
  actualHarvestDate?: Date;

  farmArea: number;

  areaUnit:
    | "acre"
    | "hectare"
    | "square_meter";

  status:
    | "planned"
    | "active"
    | "completed";

  notes?: string;

  // IoT device assigned to this crop
  device?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const cropSchema =
  new Schema<ICrop>(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      variety: {
        type: String,
        trim: true,
      },

      plantingDate: {
        type: Date,
        required: true,
      },

      expectedHarvestDate: {
        type: Date,
      },

      actualHarvestDate: {
        type: Date,
      },

      farmArea: {
        type: Number,
        required: true,
        min: 0,
      },

      areaUnit: {
        type: String,
        enum: [
          "acre",
          "hectare",
          "square_meter",
        ],
        required: true,
      },

      status: {
        type: String,
        enum: [
          "planned",
          "active",
          "completed",
        ],
        default: "active",
      },

      notes: {
        type: String,
        trim: true,
      },

      // -----------------------------------------
      // Device assigned to this crop
      // -----------------------------------------

      device: {
        type: Schema.Types.ObjectId,
        ref: "Device",
        required: false,
        index: true,
      },
    },
    {
      timestamps: true,
    }
  );

cropSchema.index({
  status: 1,
  device: 1,
});

const Crop: Model<ICrop> =
  mongoose.models.Crop ||
  mongoose.model<ICrop>(
    "Crop",
    cropSchema
  );

export default Crop;