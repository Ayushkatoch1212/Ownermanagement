import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db";
import User from "@/models/User";

import {
  hashOtp,
} from "@/lib/otp";

export async function POST(
  request: Request
) {
  try {
    const {
      email,
      otp,
      password,
      confirmPassword,
    } = await request.json();

    // --------------------------------
    // Validation
    // --------------------------------

    if (
      !email ||
      !otp ||
      !password ||
      !confirmPassword
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "All fields are required",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must be at least 8 characters",
        },
        { status: 400 }
      );
    }

    if (
      password !== confirmPassword
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Passwords do not match",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail =
      email.toLowerCase().trim();

    // --------------------------------
    // Find user
    // --------------------------------

    const user =
      await User.findOne({
        email: normalizedEmail,
      }).select(
        "+passwordResetOtp +passwordResetOtpExpires"
      );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid email or OTP",
        },
        { status: 400 }
      );
    }

    // --------------------------------
    // Check OTP expiry
    // --------------------------------

    if (
      !user.passwordResetOtpExpires ||
      new Date() >
        new Date(
          user.passwordResetOtpExpires
        )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "OTP has expired. Please request a new OTP.",
        },
        { status: 400 }
      );
    }

    // --------------------------------
    // Compare OTP
    // --------------------------------

    const hashedOtp =
      hashOtp(String(otp));

    if (
      hashedOtp !==
      user.passwordResetOtp
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid OTP",
        },
        { status: 400 }
      );
    }

    // --------------------------------
    // Hash new password
    // --------------------------------

    const hashedPassword =
      await bcrypt.hash(
        password,
        12
      );

    // --------------------------------
    // Update password
    // --------------------------------

    user.password =
      hashedPassword;

    // Make sure the account remains
    // verified.
    user.isEmailVerified = true;

    // Remove OTP
    user.passwordResetOtp =
      null;

    user.passwordResetOtpExpires =
      null;

    await user.save();

    return NextResponse.json({
      success: true,
      message:
        "Password reset successfully",
    });
  } catch (error: any) {
    console.error(
      "RESET PASSWORD ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to reset password",
      },
      { status: 500 }
    );
  }
}