import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/auth";

import Room from "@/models/Room";
import PG from "@/models/PG";
import Student from "@/models/Student";

import { roomSchema } from "@/lib/validation";

export async function GET() {
  try {
    const s = await requireSession();

    await connectDB();

    const rooms = await Room.find({
      ownerId: s.user.id,
    })
      .populate("pgId", "name")
      .sort({ roomNumber: 1 })
      .lean();

    const counts = await Student.aggregate([
      {
        $match: {
          ownerId: new mongoose.Types.ObjectId(
            s.user.id
          ),

          status: {
            $ne: "left",
          },
        },
      },

      {
        $group: {
          _id: "$roomId",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const occupancyMap = new Map(
      counts.map((x: any) => [
        String(x._id),
        x.count,
      ])
    );

    const data = rooms.map((room: any) => {
      const occupied =
        occupancyMap.get(
          String(room._id)
        ) || 0;

      let status = room.status;

      // Do not change maintenance status automatically.
      if (room.status !== "maintenance") {
        if (occupied === 0) {
          status = "available";
        } else if (
          occupied >= room.capacity
        ) {
          status = "full";
        } else {
          status = "partially_occupied";
        }
      }

      return {
        ...room,

        // Number of active occupants
        occupied,

        // Remaining occupancy capacity
        availableCapacity: Math.max(
          room.capacity - occupied,
          0
        ),

        status,
      };
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (e: any) {
    console.error(
      "GET ROOMS ERROR:",
      e
    );

    return NextResponse.json(
      {
        success: false,
        message:
          e?.message ||
          "Unable to load rooms",
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
      roomSchema.parse(
        await req.json()
      );

    await connectDB();

    const pg = await PG.findOne({
      _id: body.pgId,
      ownerId: s.user.id,
    });

    if (!pg) {
      return NextResponse.json(
        {
          success: false,
          message: "PG not found",
        },
        {
          status: 404,
        }
      );
    }

    const room =
      await Room.create({
        ...body,
        ownerId: s.user.id,
        status: "available",
      });

    return NextResponse.json(
      {
        success: true,
        data: room,
      },
      {
        status: 201,
      }
    );
  } catch (e: any) {
    console.error(
      "CREATE ROOM ERROR:",
      e
    );

    return NextResponse.json(
      {
        success: false,
        message:
          e?.issues?.[0]?.message ||
          e?.message ||
          "Unable to create room",
      },
      {
        status: 400,
      }
    );
  }
}