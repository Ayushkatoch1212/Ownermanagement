"use client";

import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import { money } from "@/lib/utils";

export default function Payments() {
  const now = new Date();

  const [data, setData] = useState<any[]>([]);
  const [billingData, setBillingData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const [month, setMonth] = useState(
    `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`
  );

  const [v, setV] = useState<any>({
    roomId: "",
    billId: "",
    amount: "",
    paymentMethod: "cash",
    paymentDate: now.toISOString().slice(0, 10),
    notes: "",
  });

  // ---------------------------------------
  // Load Payments
  // ---------------------------------------
  async function loadPayments() {
    try {
      const response = await fetch(
        `/api/payments?billingMonth=${month}`
      );

      const result = await response.json();

      setData(result.data || []);
    } catch (error) {
      console.error("LOAD PAYMENTS ERROR:", error);
    }
  }

  // ---------------------------------------
  // Load Billing
  // ---------------------------------------
  async function loadBilling() {
    try {
      const response = await fetch(
        `/api/billing?month=${month}`
      );

      const result = await response.json();

      setBillingData(result.data || []);
    } catch (error) {
      console.error("LOAD BILLING ERROR:", error);
    }
  }

  // ---------------------------------------
  // Load All
  // ---------------------------------------
  async function load() {
    await Promise.all([
      loadPayments(),
      loadBilling(),
    ]);
  }

  useEffect(() => {
    load();
  }, [month]);

  // ---------------------------------------
  // Selected Room
  // ---------------------------------------
  const selectedRoom = billingData.find(
    (x) => x.room._id === v.roomId
  );

  // ---------------------------------------
  // Numeric Input Handler
  // ---------------------------------------
  function handleAmountChange(value: string) {
    // Allow numbers only
    const numericValue = value.replace(/\D/g, "");

    setV((prev: any) => ({
      ...prev,
      amount: numericValue,
    }));
  }

  // ---------------------------------------
  // Save Payment
  // ---------------------------------------
  async function save() {
    if (!v.roomId) {
      alert("Select a room.");
      return;
    }

    if (!v.billId) {
      alert(
        "Generate the bill for this room first."
      );
      return;
    }

    if (Number(v.amount) <= 0) {
      alert("Enter a valid payment amount.");
      return;
    }

    if (
      selectedRoom?.bill &&
      Number(v.amount) >
        Number(
          selectedRoom.bill.remainingAmount
        )
    ) {
      alert(
        `Maximum payable amount is ${money(
          selectedRoom.bill.remainingAmount
        )}`
      );

      return;
    }

    try {
      const response = await fetch(
        "/api/payments",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            roomId: v.roomId,
            billId: v.billId,
            billingMonth: month,
            amount: Number(v.amount),
            paymentMethod: v.paymentMethod,
            paymentDate: v.paymentDate,
            notes: v.notes,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(
          result.message ||
            "Unable to save payment."
        );

        return;
      }

      setOpen(false);

      setV({
        roomId: "",
        billId: "",
        amount: "",
        paymentMethod: "cash",
        paymentDate: new Date()
          .toISOString()
          .slice(0, 10),
        notes: "",
      });

      load();
    } catch (error) {
      console.error(
        "SAVE PAYMENT ERROR:",
        error
      );

      alert(
        "Unable to save payment. Please try again."
      );
    }
  }

  // ---------------------------------------
  // Open Payment Dialog
  // ---------------------------------------
  function openPaymentDialog() {
    setV({
      roomId: "",
      billId: "",
      amount: "",
      paymentMethod: "cash",
      paymentDate: new Date()
        .toISOString()
        .slice(0, 10),
      notes: "",
    });

    setOpen(true);
  }

  return (
    <Box>
      {/* ---------------------------------------
          Header
      --------------------------------------- */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
          >
            Room Payments
          </Typography>

          <Typography color="text.secondary">
            Record payments against a room's
            monthly bill.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openPaymentDialog}
        >
          Record Payment
        </Button>
      </Box>

      {/* ---------------------------------------
          Payment List
      --------------------------------------- */}
      <Card variant="outlined">
        <CardContent>
          <TextField
            type="month"
            label="Billing Month"
            InputLabelProps={{
              shrink: true,
            }}
            value={month}
            onChange={(e) =>
              setMonth(e.target.value)
            }
            sx={{ mb: 3 }}
          />

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  Room
                </TableCell>

                <TableCell>
                  Payment Date
                </TableCell>

                <TableCell>
                  Amount
                </TableCell>

                <TableCell>
                  Method
                </TableCell>

                <TableCell>
                  Notes
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {data.map((p) => (
                <TableRow key={p._id}>
                  <TableCell>
                    Room{" "}
                    {p.roomId?.roomNumber}
                  </TableCell>

                  <TableCell>
                    {p.paymentDate
                      ? new Date(
                          p.paymentDate
                        ).toLocaleDateString(
                          "en-IN"
                        )
                      : "-"}
                  </TableCell>

                  <TableCell>
                    {money(p.amount)}
                  </TableCell>

                  <TableCell>
                    {p.paymentMethod}
                  </TableCell>

                  <TableCell>
                    {p.notes || "-"}
                  </TableCell>
                </TableRow>
              ))}

              {data.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align="center"
                  >
                    No payments found for this
                    month.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ---------------------------------------
          Payment Dialog
      --------------------------------------- */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Record Room Payment
        </DialogTitle>

        <DialogContent
          sx={{
            display: "grid",
            gap: 2,
            pt: 2,
          }}
        >
          {/* Room */}
          <TextField
            select
            label="Room"
            value={v.roomId}
            onChange={(e) => {
              const room = billingData.find(
                (x) =>
                  x.room._id ===
                  e.target.value
              );

              setV({
                ...v,
                roomId: e.target.value,
                billId:
                  room?.bill?._id || "",
                amount: "",
              });
            }}
            fullWidth
          >
            {billingData.map((r) => (
              <MenuItem
                key={r.room._id}
                value={r.room._id}
                disabled={
                  !r.bill ||
                  Number(
                    r.bill.remainingAmount
                  ) <= 0
                }
              >
                Room {r.room.roomNumber} · Due{" "}
                {money(
                  r.bill?.remainingAmount || 0
                )}
              </MenuItem>
            ))}
          </TextField>

          {/* Selected Room Bill */}
          {selectedRoom && (
            <Card
              variant="outlined"
              sx={{ p: 2 }}
            >
              <Typography>
                Room Rent:{" "}
                <b>
                  {money(
                    selectedRoom.bill
                      ?.rentAmount || 0
                  )}
                </b>
              </Typography>

              <Typography>
                Electricity:{" "}
                <b>
                  {money(
                    selectedRoom.bill
                      ?.electricityAmount || 0
                  )}
                </b>
              </Typography>

              <Typography>
                Total:{" "}
                <b>
                  {money(
                    selectedRoom.bill
                      ?.totalAmount || 0
                  )}
                </b>
              </Typography>

              <Typography>
                Paid:{" "}
                <b>
                  {money(
                    selectedRoom.bill
                      ?.amountPaid || 0
                  )}
                </b>
              </Typography>

              <Typography>
                Remaining:{" "}
                <b>
                  {money(
                    selectedRoom.bill
                      ?.remainingAmount || 0
                  )}
                </b>
              </Typography>
            </Card>
          )}

          {/* ---------------------------------------
              Amount Received
              Normal text input - NO spinner
          --------------------------------------- */}
          <TextField
            type="text"
            label="Amount Received"
            value={v.amount}
            placeholder="Enter amount"
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
            onChange={(e) =>
              handleAmountChange(
                e.target.value
              )
            }
            fullWidth
          />

          {/* Payment Date */}
          <TextField
            type="date"
            label="Payment Date"
            InputLabelProps={{
              shrink: true,
            }}
            value={v.paymentDate}
            onChange={(e) =>
              setV({
                ...v,
                paymentDate:
                  e.target.value,
              })
            }
            fullWidth
          />

          {/* Payment Method */}
          <TextField
            select
            label="Payment Method"
            value={v.paymentMethod}
            onChange={(e) =>
              setV({
                ...v,
                paymentMethod:
                  e.target.value,
              })
            }
            fullWidth
          >
            <MenuItem value="cash">
              Cash
            </MenuItem>

            <MenuItem value="upi">
              UPI
            </MenuItem>

            <MenuItem value="bank_transfer">
              Bank Transfer
            </MenuItem>

            <MenuItem value="other">
              Other
            </MenuItem>
          </TextField>

          {/* Notes */}
          <TextField
            label="Notes"
            multiline
            rows={2}
            value={v.notes}
            onChange={(e) =>
              setV({
                ...v,
                notes: e.target.value,
              })
            }
            fullWidth
          />
        </DialogContent>

        {/* Dialog Actions */}
        <DialogActions>
          <Button
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={save}
          >
            Save Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}