import mongoose, { Schema, models } from "mongoose";
const ElectricitySchema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  pgId: { type: Schema.Types.ObjectId, ref: "PG", required: true },
  roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true },
  billingMonth: { type: String, required: true },
  previousReading: { type: Number, default: 0 },
  currentReading: { type: Number, default: 0 },
  unitsUsed: { type: Number, default: 0 },
  ratePerUnit: { type: Number, default: 0 },
  amount: { type: Number, default: 0 },
  overridden: { type: Boolean, default: false }
}, { timestamps: true });
export default models.ElectricityReading || mongoose.model("ElectricityReading", ElectricitySchema);
