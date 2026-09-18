import mongoose, {
  Schema,
  models,
} from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["admin"],
      default: "admin",
    },

    // -----------------------------
    // Email Verification
    // -----------------------------

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationOtp: {
      type: String,
      default: null,
      select: false,
    },

    emailVerificationOtpExpires: {
      type: Date,
      default: null,
      select: false,
    },

    // -----------------------------
    // Forgot Password
    // -----------------------------

    passwordResetOtp: {
      type: String,
      default: null,
      select: false,
    },

    passwordResetOtpExpires: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

export default
  models.User ||
  mongoose.model("User", UserSchema);