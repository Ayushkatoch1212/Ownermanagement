import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/auth";

import Room from "@/models/Room";
import ElectricityReading from "@/models/ElectricityReading";

export async function GET(req: Request) {
  try {
    const session = await requireSession();

    await connectDB();

    const { searchParams } = new URL(req.url);

    // The frontend sends billingMonth
    const billingMonth =
      searchParams.get("billingMonth");

    const filter: any = {
      ownerId: session.user.id,
    };

    if (billingMonth) {
      filter.billingMonth = billingMonth;
    }

    const data =
      await ElectricityReading.find(filter)
        .populate(
          "roomId",
          "roomNumber floor capacity"
        )
        .populate("pgId", "name")
        .sort({
          billingMonth: -1,
          createdAt: -1,
        })
        .lean();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error(
      "GET ELECTRICITY ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message || "Unauthorized",
      },
      { status: 401 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireSession();

    const body = await req.json();

    const {
      roomId,
      billingMonth,
      previousReading,
      currentReading,
      ratePerUnit,
      overridden = false,
      amount: manualAmount,
    } = body;

    // --------------------------------
    // Validate required fields
    // --------------------------------

    if (
      !roomId ||
      !billingMonth ||
      previousReading === undefined ||
      currentReading === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Room, month and meter readings are required",
        },
        { status: 400 }
      );
    }

    const previous =
      Number(previousReading);

    const current =
      Number(currentReading);

    const rate =
      ratePerUnit === undefined ||
      ratePerUnit === ""
        ? undefined
        : Number(ratePerUnit);

    // --------------------------------
    // Validate readings
    // --------------------------------

    if (
      !Number.isFinite(previous) ||
      !Number.isFinite(current) ||
      previous < 0 ||
      current < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Meter readings must be valid non-negative numbers",
        },
        { status: 400 }
      );
    }

    if (current < previous) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Current reading cannot be less than previous reading",
        },
        { status: 400 }
      );
    }

    if (
      rate !== undefined &&
      (!Number.isFinite(rate) || rate < 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Rate per unit must be a valid non-negative number",
        },
        { status: 400 }
      );
    }

    // --------------------------------
    // Validate manual amount
    // --------------------------------

    if (overridden) {
      const manual =
        Number(manualAmount);

      if (
        !Number.isFinite(manual) ||
        manual < 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Manual electricity amount must be a valid non-negative number",
          },
          { status: 400 }
        );
      }
    }

    await connectDB();

    // --------------------------------
    // Find room
    // --------------------------------

    const room = await Room.findOne({
      _id: roomId,
      ownerId: session.user.id,
    }).lean();

    if (!room) {
      return NextResponse.json(
        {
          success: false,
          message: "Room not found",
        },
        { status: 404 }
      );
    }

    // --------------------------------
    // Fix Mongoose lean TypeScript issue
    // --------------------------------

    const roomData = room as any;

    // --------------------------------
    // Determine electricity rate
    // --------------------------------

    const finalRate =
      rate !== undefined
        ? rate
        : Number(
            roomData.electricityRate || 0
          );

    // --------------------------------
    // Calculate units
    // --------------------------------

    const unitsUsed =
      current - previous;

    // --------------------------------
    // Calculate electricity amount
    // --------------------------------

    const amount = overridden
      ? Number(manualAmount || 0)
      : unitsUsed * finalRate;

    // --------------------------------
    // Save / Update reading
    // --------------------------------

    const reading =
      await ElectricityReading.findOneAndUpdate(
        {
          ownerId: session.user.id,
          roomId,
          billingMonth,
        },
        {
          ownerId: session.user.id,

          // Room's PG
          pgId: roomData.pgId,

          roomId,

          billingMonth,

          previousReading: previous,

          currentReading: current,

          unitsUsed,

          ratePerUnit: finalRate,

          amount,

          overridden: Boolean(
            overridden
          ),
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

    return NextResponse.json({
      success: true,
      data: reading,
    });
  } catch (error: any) {
    console.error(
      "SAVE ELECTRICITY ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Unable to save electricity reading",
      },
      { status: 400 }
    );
  }
}