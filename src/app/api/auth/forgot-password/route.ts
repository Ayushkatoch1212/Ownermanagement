import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import User from "@/models/User";

import {
  generateOtp,
  hashOtp,
} from "@/lib/otp";

import {
  sendPasswordResetOtpEmail,
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

    /*
     * Don't reveal whether an email
     * exists in the database.
     */
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          "If an account exists with this email, a password reset OTP has been sent.",
      });
    }

    // --------------------------------
    // Generate OTP
    // --------------------------------

    const otp =
      generateOtp();

    const hashedOtp =
      hashOtp(otp);

    const expires =
      new Date(
        Date.now() +
          10 * 60 * 1000
      );

    // --------------------------------
    // Save OTP
    // --------------------------------

    user.passwordResetOtp =
      hashedOtp;

    user.passwordResetOtpExpires =
      expires;

    await user.save();

    // --------------------------------
    // Send email
    // --------------------------------

    await sendPasswordResetOtpEmail(
      normalizedEmail,
      otp
    );

    return NextResponse.json({
      success: true,
      message:
        "If an account exists with this email, a password reset OTP has been sent.",
    });
  } catch (error: any) {
    console.error(
      "FORGOT PASSWORD ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to process password reset",
      },
      { status: 500 }
    );
  }
}