import mongoose, { Schema, models } from "mongoose";
const StudentSchema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  pgId: { type: Schema.Types.ObjectId, ref: "PG", required: true, index: true },
  roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true, index: true },
  name: { type: String, required: true },
  phone: { type: String, required: true, index: true },
  email: String,
  registrationNumber: { type: String, index: true },
  guardianName: String,
  guardianPhone: String,
  college: String,
  bedNumber: String,
  joiningDate: Date,
  agreementStartDate: Date,
  agreementEndDate: Date,
  monthlyRent: { type: Number, required: true },
  securityDeposit: { type: Number, default: 0 },
  securityDepositPaid: { type: Number, default: 0 },
  securityDepositDue: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "notice_period", "left"], default: "active" },
  notes: String
}, { timestamps: true });
export default models.Student || mongoose.model("Student", StudentSchema);
