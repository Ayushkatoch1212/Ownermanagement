import mongoose, { Schema, models } from "mongoose";
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  phone: String,
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ["admin"], default: "admin" }
}, { timestamps: true });
export default models.User || mongoose.model("User", UserSchema);
