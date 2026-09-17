import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { registerSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = registerSchema.parse(await req.json());
    await connectDB();
    
    const email = body.email.toLowerCase();
    const exists = await User.findOne({ email });
    if (exists) return NextResponse.json({ success: false, message: "Email already registered" }, { status: 409 });
    const password = await bcrypt.hash(body.password, 12);
    await User.create({ name: body.name, email, phone: body.phone, password, role: "admin" });
    return NextResponse.json({ success: true, message: "Admin account created" }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e?.issues?.[0]?.message || "Invalid request" }, { status: 400 });
  }
}
