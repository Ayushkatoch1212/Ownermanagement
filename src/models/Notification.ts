import mongoose, { Schema, models } from "mongoose";
const NotificationSchema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: String,
  message: String,
  type: String,
  read: { type: Boolean, default: false },
  link: String
}, { timestamps: true });
export default models.Notification || mongoose.model("Notification", NotificationSchema);
