import mongoose, { Schema, models } from "mongoose";
const ExpenseSchema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  pgId: { type: Schema.Types.ObjectId, ref: "PG" },
  title: String,
  category: { type: String, default: "Other" },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  description: String
}, { timestamps: true });
export default models.Expense || mongoose.model("Expense", ExpenseSchema);
