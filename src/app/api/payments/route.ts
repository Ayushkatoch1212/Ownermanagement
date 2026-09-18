import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/auth";

import Payment from "@/models/Payment";
import Bill from "@/models/Bill";
import Room from "@/models/Room";

export async function GET(req: Request) {
  try {
    const session = await requireSession();

    await connectDB();

    const { searchParams } = new URL(req.url);

    const billingMonth =
      searchParams.get("billingMonth");

    const filter: any = {
      ownerId: session.user.id,
    };

    if (billingMonth) {
      filter.billingMonth = billingMonth;
    }

    const data = await Payment.find(filter)
      .populate("roomId", "roomNumber")
      .populate("pgId", "name")
      .sort({
        paymentDate: -1,
        createdAt: -1,
      })
      .lean();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("GET PAYMENTS ERROR:", error);

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
      billId,
      billingMonth,
      amount,
      paymentMethod,
      paymentDate,
      notes,
    } = body;

    // -----------------------------
    // Basic validation
    // -----------------------------

    if (
      !roomId ||
      !billId ||
      !billingMonth ||
      amount === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Room, bill, billing month and amount are required",
        },
        { status: 400 }
      );
    }

    const paymentAmount = Number(amount);

    if (
      !Number.isFinite(paymentAmount) ||
      paymentAmount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment amount must be greater than 0",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // -----------------------------
    // Find room
    // -----------------------------

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

    // -----------------------------
    // Find bill
    // -----------------------------

    const bill = await Bill.findOne({
      _id: billId,
      ownerId: session.user.id,
      roomId,
      billingMonth,
    });

    if (!bill) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Bill not found. Generate the room bill first.",
        },
        { status: 404 }
      );
    }

    // -----------------------------
    // Check remaining amount
    // -----------------------------

    const remainingBeforePayment =
      Number(bill.remainingAmount || 0);

    if (remainingBeforePayment <= 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This room bill is already fully paid.",
        },
        { status: 400 }
      );
    }

    if (
      paymentAmount >
      remainingBeforePayment
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `Maximum payable amount is ₹${remainingBeforePayment}`,
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // Create payment
    // -----------------------------

    const payment = await Payment.create({
      ownerId: session.user.id,

      // Explicitly access pgId
      // to avoid the Mongoose lean type issue.
      pgId: (room as any).pgId,

      roomId,

      billingMonth,

      amount: paymentAmount,

      paymentDate: paymentDate
        ? new Date(paymentDate)
        : new Date(),

      paymentMethod:
        paymentMethod || "cash",

      notes: notes || "",
    });

    // -----------------------------
    // Update bill
    // -----------------------------

    const newPaid =
      Number(bill.amountPaid || 0) +
      paymentAmount;

    const newRemaining = Math.max(
      Number(bill.totalAmount || 0) -
        newPaid,
      0
    );

    let status:
      | "pending"
      | "partial"
      | "completed"
      | "overdue";

    if (newRemaining === 0) {
      status = "completed";
    } else if (
      bill.dueDate &&
      new Date() > new Date(bill.dueDate)
    ) {
      status = "overdue";
    } else {
      status = "partial";
    }

    bill.amountPaid = newPaid;
    bill.remainingAmount = newRemaining;
    bill.status = status;

    await bill.save();

    // -----------------------------
    // Response
    // -----------------------------

    return NextResponse.json(
      {
        success: true,
        data: {
          payment,
          bill,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(
      "CREATE PAYMENT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Unable to record payment",
      },
      { status: 400 }
    );
  }
}