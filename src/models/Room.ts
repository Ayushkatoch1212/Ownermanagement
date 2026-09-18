import mongoose, { Schema, models } from "mongoose";

const RoomSchema = new Schema(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    pgId: {
      type: Schema.Types.ObjectId,
      ref: "PG",
      required: true,
      index: true,
    },

    roomNumber: {
      type: String,
      required: true,
      trim: true,
    },

    floor: {
      type: Number,
      default: 1,
    },

    capacity: {
      type: Number,
      required: true,
      default: 4,
      min: 1,
    },

    /*
     * This is the monthly rent of the ROOM.
     *
     * Example:
     * Room 101 = ₹10,000
     *
     * It is NOT automatically divided between students.
     */
    monthlyRent: {
      type: Number,
      required: true,
      default: 0,
    },

    electricityType: {
      type: String,
      enum: ["fixed", "meter", "included"],
      default: "fixed",
    },

    electricityRate: {
      type: Number,
      default: 0,
    },

    fixedElectricity: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "available",
        "partially_occupied",
        "full",
        "maintenance",
      ],
      default: "available",
    },
  },
  {
    timestamps: true,
  }
);

RoomSchema.index(
  {
    ownerId: 1,
    pgId: 1,
    roomNumber: 1,
  },
  {
    unique: true,
  }
);

export default models.Room ||
  mongoose.model("Room", RoomSchema);