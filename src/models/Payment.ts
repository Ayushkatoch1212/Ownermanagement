import mongoose, { Schema, models } from "mongoose";
const PaymentSchema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
  pgId: { type: Schema.Types.ObjectId, ref: "PG", required: true, index: true },
  billingMonth: { type: String, required: true, index: true },
  rentAmount: { type: Number, default: 0 },
  electricityAmount: { type: Number, default: 0 },
  otherCharges: { type: Number, default: 0 },
  lateFee: { type: Number, default: 0 },
  securityDepositAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  amountPaid: { type: Number, default: 0 },
  remainingAmount: { type: Number, default: 0 },
  paymentDate: Date,
  paymentMethod: { type: String, enum: ["cash", "upi", "bank_transfer", "other"], default: "cash" },
  status: { type: String, enum: ["pending", "partial", "completed"], default: "pending" },
  notes: String
}, { timestamps: true });
PaymentSchema.index({ ownerId: 1, studentId: 1, billingMonth: 1 }, { unique: true });
export default models.Payment || mongoose.model("Payment", PaymentSchema);
