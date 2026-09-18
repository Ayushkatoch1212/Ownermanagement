import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/auth";

import Student from "@/models/Student";
import Room from "@/models/Room";

import { studentSchema } from "@/lib/validation";

export async function GET() {
  try {
    const s = await requireSession();

    await connectDB();

    const data =
      await Student.find({
        ownerId: s.user.id,
      })
        .populate("pgId", "name")
        .populate(
          "roomId",
          "roomNumber capacity monthlyRent electricityType"
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (e: any) {
    console.error(
      "GET STUDENTS ERROR:",
      e
    );

    return NextResponse.json(
      {
        success: false,
        message:
          e?.message ||
          "Unable to load students",
      },
      {
        status: 401,
      }
    );
  }
}

export async function POST(
  req: Request
) {
  try {
    const s = await requireSession();

    const body =
      studentSchema.parse(
        await req.json()
      );

    await connectDB();

    /*
     * Make sure the selected room
     * belongs to the selected PG
     * and current owner.
     */
    const room =
      await Room.findOne({
        _id: body.roomId,
        pgId: body.pgId,
        ownerId: s.user.id,
      });

    if (!room) {
      return NextResponse.json(
        {
          success: false,
          message: "Room not found",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Count active occupants.
     *
     * A student who has left the PG
     * does not count towards room occupancy.
     */
    const occupied =
      await Student.countDocuments({
        ownerId: s.user.id,

        roomId: body.roomId,

        status: {
          $ne: "left",
        },
      });

    /*
     * Capacity is room occupancy,
     * not number of beds.
     */
    if (
      occupied >=
      Number(room.capacity)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `Room ${room.roomNumber} is full. Capacity: ${room.capacity}`,
        },
        {
          status: 409,
        }
      );
    }

    const securityDepositDue =
      Math.max(
        Number(
          body.securityDeposit || 0
        ) -
          Number(
            body.securityDepositPaid ||
              0
          ),
        0
      );

    const student =
      await Student.create({
        ...body,

        ownerId: s.user.id,

        securityDepositDue,

        joiningDate: body.joiningDate
          ? new Date(
              body.joiningDate
            )
          : undefined,

        agreementStartDate:
          body.agreementStartDate
            ? new Date(
                body.agreementStartDate
              )
            : undefined,

        agreementEndDate:
          body.agreementEndDate
            ? new Date(
                body.agreementEndDate
              )
            : undefined,
      });

    return NextResponse.json(
      {
        success: true,
        data: student,
      },
      {
        status: 201,
      }
    );
  } catch (e: any) {
    console.error(
      "CREATE STUDENT ERROR:",
      e
    );

    return NextResponse.json(
      {
        success: false,
        message:
          e?.issues?.[0]?.message ||
          e?.message ||
          "Unable to create student",
      },
      {
        status: 400,
      }
    );
  }
}