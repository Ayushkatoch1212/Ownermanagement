import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import PG from "@/models/PG";
import Room from "@/models/Room";
import Student from "@/models/Student";
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try { const s=await requireSession(); const {id}=await params; await connectDB(); const pg=await PG.findOne({_id:id,ownerId:s.user.id}).lean(); if(!pg)return NextResponse.json({success:false,message:"Not found"},{status:404}); return NextResponse.json({success:true,data:pg}); } catch { return NextResponse.json({success:false,message:"Unauthorized"},{status:401});}
}
export async function DELETE(_: Request,{params}:{params:Promise<{id:string}>}) {
  try { const s=await requireSession(); const {id}=await params; await connectDB(); const active=await Student.countDocuments({ownerId:s.user.id,pgId:id,status:{$ne:"left"}}); const rooms=await Room.countDocuments({ownerId:s.user.id,pgId:id}); if(active||rooms)return NextResponse.json({success:false,message:"Remove active students and rooms first"},{status:409}); await PG.deleteOne({_id:id,ownerId:s.user.id}); return NextResponse.json({success:true}); } catch {return NextResponse.json({success:false,message:"Unauthorized"},{status:401});}
}
