import mongoose, { Schema, models } from "mongoose";
const RoomSchema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  pgId: { type: Schema.Types.ObjectId, ref: "PG", required: true, index: true },
  roomNumber: { type: String, required: true },
  floor: Number,
  capacity: { type: Number, required: true },
  monthlyRent: { type: Number, required: true },
  electricityType: { type: String, enum: ["fixed", "meter", "included"], default: "fixed" },
  electricityRate: Number,
  fixedElectricity: Number,
  status: { type: String, enum: ["available", "partially_occupied", "full", "maintenance"], default: "available" }
}, { timestamps: true });
RoomSchema.index({ ownerId: 1, pgId: 1, roomNumber: 1 }, { unique: true });
export default models.Room || mongoose.model("Room", RoomSchema);
