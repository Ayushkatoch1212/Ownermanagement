import mongoose, { Schema, models } from "mongoose";

const PaymentSchema = new Schema(
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

    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },

    billingMonth: {
      type: String,
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentDate: {
      type: Date,
      default: Date.now,
    },

    paymentMethod: {
      type: String,
      enum: [
        "cash",
        "upi",
        "bank_transfer",
        "other",
      ],
      default: "cash",
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default models.Payment ||
  mongoose.model("Payment", PaymentSchema);