import { NextResponse } from "next/server";

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
    } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email and OTP are required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail =
      email.toLowerCase().trim();

    const user =
      await User.findOne({
        email: normalizedEmail,
      }).select(
        "+emailVerificationOtp +emailVerificationOtpExpires"
      );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Account not found",
        },
        { status: 404 }
      );
    }

    if (user.isEmailVerified) {
      return NextResponse.json({
        success: true,
        message:
          "Email is already verified",
      });
    }

    // --------------------------------
    // Check expiration
    // --------------------------------

    if (
      !user.emailVerificationOtpExpires ||
      new Date() >
        new Date(
          user.emailVerificationOtpExpires
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
      user.emailVerificationOtp
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
    // Verify user
    // --------------------------------

    user.isEmailVerified = true;

    user.emailVerificationOtp =
      null;

    user.emailVerificationOtpExpires =
      null;

    await user.save();

    return NextResponse.json({
      success: true,
      message:
        "Email verified successfully",
    });
  } catch (error: any) {
    console.error(
      "VERIFY EMAIL ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to verify email",
      },
      { status: 500 }
    );
  }
}