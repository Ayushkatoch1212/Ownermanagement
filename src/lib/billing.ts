export function calculateRoomBill({
  rentAmount,
  electricityAmount = 0,
  otherCharges = 0,
  lateFee = 0,
  securityDepositAmount = 0,
  amountPaid = 0,
  dueDate,
}: {
  rentAmount: number;
  electricityAmount?: number;
  otherCharges?: number;
  lateFee?: number;
  securityDepositAmount?: number;
  amountPaid?: number;
  dueDate?: Date | null;
}) {
  const totalAmount =
    Number(rentAmount || 0) +
    Number(electricityAmount || 0) +
    Number(otherCharges || 0) +
    Number(lateFee || 0) +
    Number(securityDepositAmount || 0);

  const paid = Math.max(Number(amountPaid || 0), 0);

  const remainingAmount = Math.max(
    totalAmount - paid,
    0
  );

  let status:
    | "pending"
    | "partial"
    | "completed"
    | "overdue";

  if (remainingAmount === 0) {
    status = "completed";
  } else if (
    dueDate &&
    new Date() > new Date(dueDate)
  ) {
    status = "overdue";
  } else if (paid > 0) {
    status = "partial";
  } else {
    status = "pending";
  }

  return {
    totalAmount,
    amountPaid: paid,
    remainingAmount,
    status,
  };
}