import mongoose, { Schema, models } from "mongoose";

const BillSchema = new Schema(
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

    rentAmount: {
      type: Number,
      default: 0,
    },

    electricityAmount: {
      type: Number,
      default: 0,
    },

    otherCharges: {
      type: Number,
      default: 0,
    },

    lateFee: {
      type: Number,
      default: 0,
    },

    securityDepositAmount: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      default: 0,
    },

    amountPaid: {
      type: Number,
      default: 0,
    },

    remainingAmount: {
      type: Number,
      default: 0,
    },

    dueDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "partial",
        "completed",
        "overdue",
      ],
      default: "pending",
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

BillSchema.index(
  {
    ownerId: 1,
    roomId: 1,
    billingMonth: 1,
  },
  {
    unique: true,
  }
);

export default models.Bill ||
  mongoose.model("Bill", BillSchema);