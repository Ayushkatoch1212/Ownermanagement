import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import PG from "@/models/PG";
import { pgSchema } from "@/lib/validation";

export async function GET() {
  try {
    const s = await requireSession(); await connectDB();
    const data = await PG.find({ ownerId: s.user.id }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data });
  } catch { return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 }); }
}
export async function POST(req: Request) {
  try {
    const s = await requireSession(); const body = pgSchema.parse(await req.json()); await connectDB();
    const pg = await PG.create({ ...body, ownerId: s.user.id });
    return NextResponse.json({ success: true, data: pg }, { status: 201 });
  } catch (e: any) { return NextResponse.json({ success: false, message: e?.issues?.[0]?.message || e.message }, { status: 400 }); }
}
