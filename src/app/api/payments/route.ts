import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import Payment from "@/models/Payment";
import Student from "@/models/Student";
import { paymentSchema } from "@/lib/validation";
import { paymentStatus } from "@/lib/utils";

export async function GET() {
  try { const s=await requireSession(); await connectDB(); const data=await Payment.find({ownerId:s.user.id}).populate("studentId","name phone").populate("pgId","name").sort({billingMonth:-1,createdAt:-1}).lean(); return NextResponse.json({success:true,data}); } catch {return NextResponse.json({success:false,message:"Unauthorized"},{status:401});}
}
export async function POST(req:Request){
 try{const s=await requireSession();const body=paymentSchema.parse(await req.json());await connectDB();const student=await Student.findOne({_id:body.studentId,ownerId:s.user.id,pgId:body.pgId});if(!student)return NextResponse.json({success:false,message:"Student not found"},{status:404});const total=body.rentAmount+body.electricityAmount+body.otherCharges+body.lateFee+body.securityDepositAmount;const paid=Math.min(body.amountPaid,total);const p=await Payment.findOneAndUpdate({ownerId:s.user.id,studentId:body.studentId,billingMonth:body.billingMonth},{...body,totalAmount:total,amountPaid:paid,remainingAmount:Math.max(total-paid,0),status:paymentStatus(total,paid),paymentDate:body.paymentDate?new Date(body.paymentDate):new Date()},{upsert:true,new:true,setDefaultsOnInsert:true});return NextResponse.json({success:true,data:p});}catch(e:any){return NextResponse.json({success:false,message:e?.issues?.[0]?.message||e.message},{status:400});}
}
