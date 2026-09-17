import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "../src/lib/db";
import User from "../src/models/User";
import PG from "../src/models/PG";
import Room from "../src/models/Room";
import Student from "../src/models/Student";
async function main(){
 await connectDB();
 const email="admin@example.com";
 const password=await bcrypt.hash("Admin@12345",12);
 const user=await User.findOneAndUpdate({email},{name:"PG Admin",email,phone:"9999999999",password,role:"admin"},{upsert:true,new:true});
 await PG.deleteMany({ownerId:user._id}); await Room.deleteMany({ownerId:user._id}); await Student.deleteMany({ownerId:user._id});
 const pg=await PG.create({ownerId:user._id,name:"Royal Residency",address:"University Road",city:"Phagwara",state:"Punjab",totalRooms:4,totalCapacity:10,amenities:["WiFi","Laundry","Parking"]});
 const rooms=await Room.insertMany([1,2,3,4].map(n=>({ownerId:user._id,pgId:pg._id,roomNumber:String(200+n),floor:2,capacity:n===4?4:2,monthlyRent:7000,electricityType:"fixed",fixedElectricity:500,status:"available"})));
 await Student.create({ownerId:user._id,pgId:pg._id,roomId:rooms[0]._id,name:"Rahul Sharma",phone:"9876543210",college:"University",bedNumber:"A",joiningDate:new Date(),monthlyRent:7000,securityDeposit:7000,securityDepositPaid:7000,securityDepositDue:0,status:"active"});
 console.log("Seeded. Login: admin@example.com / Admin@12345"); process.exit(0);
}
main().catch(e=>{console.error(e);process.exit(1)});
