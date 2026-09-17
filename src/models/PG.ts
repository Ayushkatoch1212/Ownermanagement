import mongoose, { Schema, models } from "mongoose";
const PGSchema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true },
  address: String,
  city: String,
  state: String,
  totalRooms: { type: Number, default: 0 },
  totalCapacity: { type: Number, default: 0 },
  description: String,
  amenities: [String]
}, { timestamps: true });
export default models.PG || mongoose.model("PG", PGSchema);
