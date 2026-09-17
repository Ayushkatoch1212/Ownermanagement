import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import PG from "@/models/PG";
import Room from "@/models/Room";
import Student from "@/models/Student";
import Payment from "@/models/Payment";
import Expense from "@/models/Expense";
export async function GET(){
 try{
  const s=await requireSession();await connectDB();const oid=new mongoose.Types.ObjectId(s.user.id);
  const [pgs,rooms,students,payments,expenses]=await Promise.all([
   PG.countDocuments({ownerId:oid}),Room.find({ownerId:oid}).lean(),Student.find({ownerId:oid,status:{$ne:"left"}}).lean(),Payment.find({ownerId:oid}).lean(),Expense.find({ownerId:oid}).lean()
  ]);
  const occupied=students.length;const capacity=rooms.reduce((a,r)=>a+r.capacity,0);const collected=payments.reduce((a,p)=>a+p.amountPaid,0);const pending=payments.reduce((a,p)=>a+p.remainingAmount,0);const expenseTotal=expenses.reduce((a,e)=>a+e.amount,0);
  const months=[...Array(6)].map((_,i)=>{const d=new Date();d.setMonth(d.getMonth()-(5-i));return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`});
  const revenue=months.map(m=>({month:m,revenue:payments.filter(p=>p.billingMonth===m).reduce((a,p)=>a+p.amountPaid,0)}));
  const status={completed:payments.filter(p=>p.status==="completed").length,partial:payments.filter(p=>p.status==="partial").length,pending:payments.filter(p=>p.status==="pending").length};
  return NextResponse.json({success:true,data:{pgs,rooms:rooms.length,students:occupied,capacity,occupancy:capacity?Math.round(occupied/capacity*100):0,collected,pending,expenses:expenseTotal,netIncome:collected-expenseTotal,revenue,status}});
 }catch(e:any){return NextResponse.json({success:false,message:e.message},{status:401});}
}
