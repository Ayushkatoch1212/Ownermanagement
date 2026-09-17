import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import Expense from "@/models/Expense";
export async function GET(){try{const s=await requireSession();await connectDB();const data=await Expense.find({ownerId:s.user.id}).populate("pgId","name").sort({date:-1}).lean();return NextResponse.json({success:true,data});}catch{return NextResponse.json({success:false,message:"Unauthorized"},{status:401});}}
export async function POST(req:Request){try{const s=await requireSession();const b=await req.json();if(!b.title||Number(b.amount)<0)return NextResponse.json({success:false,message:"Title and valid amount required"},{status:400});await connectDB();const x=await Expense.create({...b,ownerId:s.user.id,amount:Number(b.amount),date:b.date?new Date(b.date):new Date()});return NextResponse.json({success:true,data:x},{status:201});}catch(e:any){return NextResponse.json({success:false,message:e.message},{status:400});}}
