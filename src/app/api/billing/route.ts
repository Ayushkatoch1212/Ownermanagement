import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/auth";

import Room from "@/models/Room";
import Student from "@/models/Student";
import Bill from "@/models/Bill";
import ElectricityReading from "@/models/ElectricityReading";

export async function GET(req: Request) {
  try {
    const session = await requireSession();

    await connectDB();

    const { searchParams } = new URL(req.url);

    // Support both:
    // ?billingMonth=2026-09
    // ?month=2026-09
    const billingMonth =
      searchParams.get("billingMonth") ||
      searchParams.get("month") ||
      new Date().toISOString().slice(0, 7);

    // --------------------------------
    // Get rooms
    // --------------------------------

    const rooms = await Room.find({
      ownerId: session.user.id,
      status: {
        $ne: "maintenance",
      },
    })
      .populate("pgId", "name")
      .lean();

    const result: any[] = [];

    // --------------------------------
    // Process each room
    // --------------------------------

    for (const room of rooms) {
      // Fix Mongoose lean TypeScript inference
      const roomData = room as any;

      // --------------------------------
      // Get active occupants
      // --------------------------------

      const students = await Student.find({
        ownerId: session.user.id,
        roomId: roomData._id,
        status: {
          $in: ["active", "notice_period"],
        },
      })
        .select(
          "name phone registrationNumber monthlyRent"
        )
        .lean();

      // Only show rooms which currently
      // have occupants.
      if (students.length === 0) {
        continue;
      }

      // --------------------------------
      // Get electricity reading
      // --------------------------------

      const electricity =
        await ElectricityReading.findOne({
          ownerId: session.user.id,
          roomId: roomData._id,
          billingMonth,
        }).lean();

      // --------------------------------
      // Get existing bill
      // --------------------------------

      const bill = await Bill.findOne({
        ownerId: session.user.id,
        roomId: roomData._id,
        billingMonth,
      }).lean();

      // Fix electricity lean type
      const electricityData =
        electricity as any;

      result.push({
        room: {
          _id: roomData._id,
          roomNumber: roomData.roomNumber,
          floor: roomData.floor,
          capacity: roomData.capacity,

          // Room rent is TOTAL room rent.
          monthlyRent: Number(
            roomData.monthlyRent || 0
          ),

          electricityType:
            roomData.electricityType,

          electricityRate: Number(
            roomData.electricityRate || 0
          ),

          fixedElectricity: Number(
            roomData.fixedElectricity || 0
          ),
        },

        pg: roomData.pgId,

        occupants: students,

        electricity:
          electricityData || null,

        bill: bill || null,
      });
    }

    return NextResponse.json({
      success: true,
      billingMonth,
      data: result,
    });
  } catch (error: any) {
    console.error(
      "GET BILLING ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Unable to load billing",
      },
      { status: 400 }
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
      otherCharges = 0,
      lateFee = 0,
      securityDepositAmount = 0,
      dueDate,
      notes = "",
    } = body;

    // --------------------------------
    // Validate required fields
    // --------------------------------

    if (!roomId || !billingMonth) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Room and billing month are required",
        },
        { status: 400 }
      );
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

    // Fix Mongoose lean TypeScript inference
    const roomData = room as any;

    // --------------------------------
    // Find active occupants
    // --------------------------------

    const students = await Student.find({
      ownerId: session.user.id,
      roomId,
      status: {
        $in: ["active", "notice_period"],
      },
    }).lean();

    if (students.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This room has no active occupants.",
        },
        { status: 400 }
      );
    }

    // --------------------------------
    // Electricity
    // --------------------------------

    let electricityAmount = 0;

    const electricity =
      await ElectricityReading.findOne({
        ownerId: session.user.id,
        roomId,
        billingMonth,
      }).lean();

    if (electricity) {
      // Fix lean TypeScript inference
      const electricityData =
        electricity as any;

      electricityAmount = Number(
        electricityData.amount || 0
      );
    } else if (
      roomData.electricityType === "fixed"
    ) {
      electricityAmount = Number(
        roomData.fixedElectricity || 0
      );
    }

    // --------------------------------
    // Existing bill
    // --------------------------------

    const existingBill =
      await Bill.findOne({
        ownerId: session.user.id,
        roomId,
        billingMonth,
      });

    const amountAlreadyPaid = Number(
      existingBill?.amountPaid || 0
    );

    // --------------------------------
    // Room rent
    // --------------------------------
    //
    // IMPORTANT:
    // This is TOTAL ROOM RENT.
    //
    // Example:
    // Room 101 = ₹10,000
    // 2 students occupy it
    //
    // Bill = ₹10,000
    // NOT ₹5,000 + ₹5,000
    //
    // --------------------------------

    const rentAmount = Number(
      roomData.monthlyRent || 0
    );

    // --------------------------------
    // Other charges
    // --------------------------------

    const otherChargesAmount = Number(
      otherCharges || 0
    );

    const lateFeeAmount = Number(
      lateFee || 0
    );

    const securityDepositAmountValue =
      Number(securityDepositAmount || 0);

    // --------------------------------
    // Calculate total
    // --------------------------------

    const totalAmount =
      rentAmount +
      electricityAmount +
      otherChargesAmount +
      lateFeeAmount +
      securityDepositAmountValue;

    // --------------------------------
    // Calculate remaining
    // --------------------------------

    const remainingAmount = Math.max(
      totalAmount - amountAlreadyPaid,
      0
    );

    // --------------------------------
    // Determine status
    // --------------------------------

    let status:
      | "pending"
      | "partial"
      | "completed"
      | "overdue";

    if (remainingAmount === 0) {
      status = "completed";
    } else if (
      dueDate &&
      new Date() > new Date(dueDate)
    ) {
      status = "overdue";
    } else if (
      amountAlreadyPaid > 0
    ) {
      status = "partial";
    } else {
      status = "pending";
    }

    // --------------------------------
    // Create / Update room bill
    // --------------------------------

    const bill =
      await Bill.findOneAndUpdate(
        {
          ownerId: session.user.id,
          roomId,
          billingMonth,
        },
        {
          ownerId: session.user.id,

          // Room belongs to this PG
          pgId: roomData.pgId,

          roomId,

          billingMonth,

          // TOTAL room rent
          rentAmount,

          // TOTAL room electricity
          electricityAmount,

          otherCharges:
            otherChargesAmount,

          lateFee:
            lateFeeAmount,

          securityDepositAmount:
            securityDepositAmountValue,

          totalAmount,

          // Preserve payments already made
          amountPaid:
            amountAlreadyPaid,

          remainingAmount,

          dueDate: dueDate
            ? new Date(dueDate)
            : null,

          status,

          notes,
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

    return NextResponse.json({
      success: true,
      data: bill,
    });
  } catch (error: any) {
    console.error(
      "CREATE/UPDATE BILL ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Unable to create bill",
      },
      { status: 400 }
    );
  }
}