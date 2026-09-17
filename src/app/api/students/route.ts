import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import Student from "@/models/Student";
import Room from "@/models/Room";
import { studentSchema } from "@/lib/validation";

export async function GET() {
  try { const s=await requireSession(); await connectDB(); const data=await Student.find({ownerId:s.user.id}).populate("pgId","name").populate("roomId","roomNumber capacity").sort({createdAt:-1}).lean(); return NextResponse.json({success:true,data}); } catch { return NextResponse.json({success:false,message:"Unauthorized"},{status:401}); }
}
export async function POST(req:Request){
 try{const s=await requireSession();const body=studentSchema.parse(await req.json());await connectDB();const room=await Room.findOne({_id:body.roomId,pgId:body.pgId,ownerId:s.user.id});if(!room)return NextResponse.json({success:false,message:"Room not found"},{status:404});const occupied=await Student.countDocuments({ownerId:s.user.id,roomId:body.roomId,status:{$ne:"left"}});if(occupied>=room.capacity)return NextResponse.json({success:false,message:"Room is full"},{status:409});const student=await Student.create({...body,ownerId:s.user.id,securityDepositDue:Math.max(body.securityDeposit-body.securityDepositPaid,0),joiningDate:new Date(body.joiningDate),agreementStartDate:body.agreementStartDate?new Date(body.agreementStartDate):undefined,agreementEndDate:body.agreementEndDate?new Date(body.agreementEndDate):undefined});return NextResponse.json({success:true,data:student},{status:201});}catch(e:any){return NextResponse.json({success:false,message:e?.issues?.[0]?.message||e.message},{status:400});}
}
