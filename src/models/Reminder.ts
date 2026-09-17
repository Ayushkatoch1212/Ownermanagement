import mongoose, { Schema, models } from "mongoose";
const ReminderSchema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  type: { type: String, enum: ["rent", "agreement", "security", "electricity", "custom"], default: "custom" },
  completed: { type: Boolean, default: false },
  studentId: { type: Schema.Types.ObjectId, ref: "Student" },
  pgId: { type: Schema.Types.ObjectId, ref: "PG" }
}, { timestamps: true });
export default models.Reminder || mongoose.model("Reminder", ReminderSchema);
