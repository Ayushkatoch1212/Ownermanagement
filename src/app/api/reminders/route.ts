import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import Reminder from "@/models/Reminder";
export async function GET(){try{const s=await requireSession();await connectDB();const data=await Reminder.find({ownerId:s.user.id}).sort({date:1}).lean();return NextResponse.json({success:true,data});}catch{return NextResponse.json({success:false,message:"Unauthorized"},{status:401});}}
export async function POST(req:Request){try{const s=await requireSession();const b=await req.json();if(!b.title||!b.date)return NextResponse.json({success:false,message:"Title and date required"},{status:400});await connectDB();const x=await Reminder.create({...b,ownerId:s.user.id,date:new Date(b.date)});return NextResponse.json({success:true,data:x},{status:201});}catch(e:any){return NextResponse.json({success:false,message:e.message},{status:400});}}
