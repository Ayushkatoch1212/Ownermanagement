import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import User from "@/models/User";

import {
  generateOtp,
  hashOtp,
} from "@/lib/otp";

import {
  sendVerificationOtpEmail,
} from "@/lib/mailer";

export async function POST(
  request: Request
) {
  try {
    const { email } =
      await request.json();

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email is required",
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
      });

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
      return NextResponse.json(
        {
          success: false,
          message:
            "Email is already verified",
        },
        { status: 400 }
      );
    }

    const otp =
      generateOtp();

    const hashedOtp =
      hashOtp(otp);

    const expires =
      new Date(
        Date.now() +
          10 * 60 * 1000
      );

    user.emailVerificationOtp =
      hashedOtp;

    user.emailVerificationOtpExpires =
      expires;

    await user.save();

    await sendVerificationOtpEmail(
      normalizedEmail,
      otp
    );

    return NextResponse.json({
      success: true,
      message:
        "A new OTP has been sent to your email",
    });
  } catch (error: any) {
    console.error(
      "RESEND OTP ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to resend OTP",
      },
      { status: 500 }
    );
  }
}