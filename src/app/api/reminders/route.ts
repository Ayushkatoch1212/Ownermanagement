import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import Reminder from "@/models/Reminder";


// GET REMINDERS
export async function GET() {
  try {
    const session = await requireSession();

    await connectDB();

    const ownerId = session.user.id;

    /*
      ------------------------------------------------
      AUTOMATIC MONTHLY RENT REMINDER
      ------------------------------------------------

      Create reminder 7 days before the next month.

      Example:

      September 24
          ↓
      October 1 rent reminder

      September 25
          ↓
      October 1 rent reminder
    */

    const today = new Date();

    const nextMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      1
    );

    const reminderDate = new Date(nextMonth);

    reminderDate.setDate(
      reminderDate.getDate() - 7
    );

    /*
      Only create the reminder when we reach
      the 7-day window.
    */
    if (today >= reminderDate) {
      const monthName = nextMonth.toLocaleString(
        "en-IN",
        {
          month: "long",
        }
      );

      const year = nextMonth.getFullYear();

      /*
        Check whether this automatic reminder
        already exists.
      */
      const existing = await Reminder.findOne({
        ownerId,
        type: "rent",
        isAutomatic: true,
        title: `Prepare ${monthName} ${year} Rent Collection`,
      });

      if (!existing) {
        await Reminder.create({
          ownerId,

          title: `Prepare ${monthName} ${year} Rent Collection`,

          description:
            `Monthly rent collection for ${monthName} ${year} starts soon.`,

          date: reminderDate,

          type: "rent",

          completed: false,

          isAutomatic: true,
        });
      }
    }

    const data = await Reminder.find({
      ownerId,
    })
      .sort({
        completed: 1,
        date: 1,
      })
      .lean();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("GET REMINDERS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Unable to load reminders",
      },
      {
        status: 401,
      }
    );
  }
}


// CREATE REMINDER
export async function POST(req: Request) {
  try {
    const session = await requireSession();

    const body = await req.json();

    if (!body.title || !body.date) {
      return NextResponse.json(
        {
          success: false,
          message: "Title and date are required",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const reminder = await Reminder.create({
      ownerId: session.user.id,

      title: body.title,

      description: body.description || "",

      date: new Date(body.date),

      type: body.type || "custom",

      completed: false,

      isAutomatic: false,

      studentId: body.studentId || null,

      pgId: body.pgId || null,
    });

    return NextResponse.json(
      {
        success: true,
        data: reminder,
      },
      {
        status: 201,
      }
    );
  } catch (error: any) {
    console.error("CREATE REMINDER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message || "Unable to create reminder",
      },
      {
        status: 400,
      }
    );
  }
}


// UPDATE REMINDER
export async function PATCH(req: Request) {
  try {
    const session = await requireSession();

    const body = await req.json();

    if (!body.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Reminder ID is required",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const reminder = await Reminder.findOneAndUpdate(
      {
        _id: body.id,
        ownerId: session.user.id,
      },
      {
        ...(typeof body.completed === "boolean" && {
          completed: body.completed,
        }),

        ...(body.title && {
          title: body.title,
        }),

        ...(body.description !== undefined && {
          description: body.description,
        }),

        ...(body.date && {
          date: new Date(body.date),
        }),

        ...(body.type && {
          type: body.type,
        }),
      },
      {
        new: true,
      }
    );

    if (!reminder) {
      return NextResponse.json(
        {
          success: false,
          message: "Reminder not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: reminder,
    });
  } catch (error: any) {
    console.error("UPDATE REMINDER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message || "Unable to update reminder",
      },
      {
        status: 400,
      }
    );
  }
}


// DELETE REMINDER
export async function DELETE(req: Request) {
  try {
    const session = await requireSession();

    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Reminder ID is required",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const reminder = await Reminder.findOneAndDelete({
      _id: id,
      ownerId: session.user.id,
    });

    if (!reminder) {
      return NextResponse.json(
        {
          success: false,
          message: "Reminder not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Reminder deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE REMINDER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message || "Unable to delete reminder",
      },
      {
        status: 400,
      }
    );
  }
}