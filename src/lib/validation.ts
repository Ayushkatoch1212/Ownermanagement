import { z } from "zod";

/* =========================================================
   AUTH
========================================================= */

export const registerSchema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(7).max(20),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine(
    (v) => v.password === v.confirmPassword,
    {
      path: ["confirmPassword"],
      message: "Passwords do not match",
    }
  );

/* =========================================================
   PG
========================================================= */

export const pgSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(2),
  city: z.string().min(2),
  state: z.string().min(2),

  totalRooms: z
    .number()
    .int()
    .min(0),

  totalCapacity: z
    .number()
    .int()
    .min(0),

  description:
    z.string().optional(),

  amenities: z
    .array(z.string())
    .default([]),
});

/* =========================================================
   ROOM
========================================================= */

export const roomSchema = z.object({
  pgId: z.string().min(1),

  roomNumber: z.string().min(1),

  floor: z
    .number()
    .int()
    .optional(),

  /*
   * Maximum number of students
   * allowed in this room.
   *
   * Example:
   * Room 101 → capacity 4
   * Room 102 → capacity 6
   */
  capacity: z
    .number()
    .int()
    .min(1),

  /*
   * IMPORTANT:
   * This is the TOTAL monthly rent
   * for the room.
   *
   * It is NOT per student.
   */
  monthlyRent: z
    .number()
    .min(0),

  electricityType: z.enum([
    "fixed",
    "meter",
    "included",
  ]),

  electricityRate: z
    .number()
    .min(0)
    .optional(),

  fixedElectricity: z
    .number()
    .min(0)
    .optional(),

  status: z
    .enum([
      "available",
      "partially_occupied",
      "full",
      "maintenance",
    ])
    .default("available"),
});

/* =========================================================
   STUDENT
========================================================= */

export const studentSchema = z.object({
  pgId: z.string().min(1),

  /*
   * Student belongs to a ROOM.
   *
   * There is NO bedNumber.
   */
  roomId: z.string().min(1),

  name: z.string().min(2),

  phone: z.string().min(7),

  email: z
    .string()
    .email()
    .optional()
    .or(z.literal("")),

  registrationNumber:
    z.string().optional(),

  guardianName:
    z.string().optional(),

  guardianPhone:
    z.string().optional(),

  college:
    z.string().optional(),

  joiningDate:
    z.string().min(1),

  agreementStartDate:
    z.string().optional(),

  agreementEndDate:
    z.string().optional(),

  /*
   * Kept for student information.
   *
   * Room billing does NOT calculate:
   * Student A rent
   * Student B rent
   *
   * The monthly bill belongs to the ROOM.
   */
  monthlyRent: z
    .number()
    .min(0),

  securityDeposit:
    z.number().min(0),

  securityDepositPaid:
    z.number()
      .min(0)
      .default(0),

  status: z
    .enum([
      "active",
      "notice_period",
      "left",
    ])
    .default("active"),

  notes:
    z.string().optional(),
});

/* =========================================================
   PAYMENT
========================================================= */

/*
 * Payment is now ROOM based.
 *
 * One room can have multiple payments
 * for the same month.
 *
 * Example:
 *
 * Room 101
 * September
 *
 * Payment 1 → ₹5,000
 * Payment 2 → ₹7,000
 *
 * Total paid → ₹12,000
 */
export const paymentSchema = z.object({
  roomId:
    z.string().min(1),

  billingMonth:
    z.string().min(1),

  amount:
    z.number().positive(),

  paymentDate:
    z.string().optional(),

  paymentMethod:
    z.enum([
      "cash",
      "upi",
      "bank_transfer",
      "other",
    ]),

  notes:
    z.string().optional(),
});

/* =========================================================
   ELECTRICITY
========================================================= */

export const electricitySchema =
  z.object({
    roomId:
      z.string().min(1),

    billingMonth:
      z.string().min(1),

    previousReading:
      z.number().min(0),

    currentReading:
      z.number().min(0),

    ratePerUnit:
      z.number().min(0).optional(),

    overridden:
      z.boolean().optional(),

    amount:
      z.number().min(0).optional(),
  });

/* =========================================================
   BILLING
========================================================= */

export const billingSchema = z.object({
  roomId:
    z.string().min(1),

  billingMonth:
    z.string().min(1),

  otherCharges:
    z.number().min(0).default(0),

  lateFee:
    z.number().min(0).default(0),

  securityDepositAmount:
    z.number().min(0).default(0),

  dueDate:
    z.string().optional(),

  notes:
    z.string().optional(),
});