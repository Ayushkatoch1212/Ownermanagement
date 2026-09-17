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
    const rooms = await Room.find({ ownerId: s.user.id }).populate("pgId", "name").sort({ roomNumber: 1 }).lean();
    const counts = await Student.aggregate([
      { $match: { ownerId: new mongoose.Types.ObjectId(s.user.id), status: { $ne: "left" } } },
      { $group: { _id: "$roomId", count: { $sum: 1 } } }
    ]);
    const map = new Map(counts.map((x: any) => [String(x._id), x.count]));
    const data = rooms.map((r: any) => ({
      ...r,
      occupied: map.get(String(r._id)) || 0,
      availableBeds: Math.max(r.capacity - (map.get(String(r._id)) || 0), 0)
    }));
    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const s = await requireSession();
    const body = roomSchema.parse(await req.json());
    await connectDB();
    const pg = await PG.findOne({ _id: body.pgId, ownerId: s.user.id });
    if (!pg) return NextResponse.json({ success: false, message: "PG not found" }, { status: 404 });
    const room = await Room.create({ ...body, ownerId: s.user.id });
    return NextResponse.json({ success: true, data: room }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e?.issues?.[0]?.message || e.message }, { status: 400 });
  }
}
