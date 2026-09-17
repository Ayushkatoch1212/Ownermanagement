import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  password: z.string().min(8),
  confirmPassword: z.string().min(8)
}).refine(v => v.password === v.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match"
});

export const pgSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(2),
  city: z.string().min(2),
  state: z.string().min(2),
  totalRooms: z.number().int().min(0),
  totalCapacity: z.number().int().min(0),
  description: z.string().optional(),
  amenities: z.array(z.string()).default([])
});

export const roomSchema = z.object({
  pgId: z.string().min(1),
  roomNumber: z.string().min(1),
  floor: z.number().int().optional(),
  capacity: z.number().int().min(1),
  monthlyRent: z.number().min(0),
  electricityType: z.enum(["fixed", "meter", "included"]),
  electricityRate: z.number().min(0).optional(),
  fixedElectricity: z.number().min(0).optional(),
  status: z.enum(["available", "partially_occupied", "full", "maintenance"]).default("available")
});

export const studentSchema = z.object({
  pgId: z.string().min(1),
  roomId: z.string().min(1),
  name: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email().optional().or(z.literal("")),
  registrationNumber: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  college: z.string().optional(),
  bedNumber: z.string().optional(),
  joiningDate: z.string(),
  agreementStartDate: z.string().optional(),
  agreementEndDate: z.string().optional(),
  monthlyRent: z.number().min(0),
  securityDeposit: z.number().min(0),
  securityDepositPaid: z.number().min(0).default(0),
  status: z.enum(["active", "notice_period", "left"]).default("active"),
  notes: z.string().optional()
});

export const paymentSchema = z.object({
  studentId: z.string(),
  pgId: z.string(),
  billingMonth: z.string(),
  rentAmount: z.number().min(0),
  electricityAmount: z.number().min(0),
  otherCharges: z.number().min(0),
  lateFee: z.number().min(0),
  securityDepositAmount: z.number().min(0),
  amountPaid: z.number().min(0),
  paymentDate: z.string().optional(),
  paymentMethod: z.enum(["cash", "upi", "bank_transfer", "other"]),
  notes: z.string().optional()
});
