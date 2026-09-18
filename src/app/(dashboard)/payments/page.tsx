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
import StatusChip from "@/components/StatusChip";

export default function Payments() {
  const [data, setData] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const now = new Date();

  const [v, setV] = useState<any>({
    studentId: "",
    pgId: "",
    billingMonth: `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`,
    rentAmount: 0,
    electricityAmount: 0,
    otherCharges: 0,
    lateFee: 0,
    securityDepositAmount: 0,
    amountPaid: 0,
    paymentMethod: "cash",
    notes: "",
  });

  async function load() {
    setData(
      (await (await fetch("/api/payments")).json()).data || []
    );
  }

  useEffect(() => {
    load();

    fetch("/api/students")
      .then((r) => r.json())
      .then((x) => setStudents(x.data || []));
  }, []);

  const student = students.find(
    (s) => s._id === v.studentId
  );

  async function save() {
    const payload = {
      ...v,
      pgId: student?.pgId?._id || student?.pgId,
      rentAmount: Number(v.rentAmount),
      electricityAmount: Number(v.electricityAmount),
      otherCharges: Number(v.otherCharges),
      lateFee: Number(v.lateFee),
      securityDepositAmount: Number(
        v.securityDepositAmount
      ),
      amountPaid: Number(v.amountPaid),
    };

    const r = await fetch("/api/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const x = await r.json();

    if (!r.ok) {
      alert(x.message);
    } else {
      setOpen(false);
      load();
    }
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Payments
          </Typography>

          <Typography color="text.secondary">
            Record payments manually. No payment gateway.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Record Payment
        </Button>
      </Box>

      <Card variant="outlined">
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Month</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Due</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {data.map((p) => (
                <TableRow key={p._id}>
                  <TableCell>
                    {p.studentId?.name}
                  </TableCell>

                  <TableCell>
                    {p.billingMonth}
                  </TableCell>

                  <TableCell>
                    {money(p.totalAmount)}
                  </TableCell>

                  <TableCell>
                    {money(p.amountPaid)}
                  </TableCell>

                  <TableCell>
                    {money(p.remainingAmount)}
                  </TableCell>

                  <TableCell>
                    <StatusChip status={p.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Record Monthly Payment
        </DialogTitle>

        <DialogContent
          sx={{
            display: "grid",
            gap: 2,
            pt: 2,
          }}
        >
          <TextField
            select
            label="Student"
            value={v.studentId}
            onChange={(e) => {
              const st = students.find(
                (s) => s._id === e.target.value
              );

              setV({
                ...v,
                studentId: e.target.value,
                pgId:
                  st?.pgId?._id || st?.pgId,
                rentAmount: st?.monthlyRent || 0,
              });
            }}
          >
            {students.map((s) => (
              <MenuItem
                key={s._id}
                value={s._id}
              >
                {s.name} · Room{" "}
                {s.roomId?.roomNumber}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            type="month"
            label="Billing month"
            InputLabelProps={{
              shrink: true,
            }}
            value={v.billingMonth}
            onChange={(e) =>
              setV({
                ...v,
                billingMonth: e.target.value,
              })
            }
          />

          {[
            ["rentAmount", "Rent"],
            ["electricityAmount", "Electricity"],
            ["otherCharges", "Other charges"],
            ["lateFee", "Late fee"],
            [
              "securityDepositAmount",
              "Security deposit",
            ],
            ["amountPaid", "Amount paid"],
          ].map(([k, l]) => (
            <TextField
              key={k}
              type="number"
              label={l}
              value={v[k]}
              onChange={(e) =>
                setV({
                  ...v,
                  [k]: Number(e.target.value),
                })
              }
            />
          ))}

          <TextField
            select
            label="Payment method"
            value={v.paymentMethod}
            onChange={(e) =>
              setV({
                ...v,
                paymentMethod: e.target.value,
              })
            }
          >
            {[
              "cash",
              "upi",
              "bank_transfer",
              "other",
            ].map((x) => (
              <MenuItem
                key={x}
                value={x}
              >
                {x}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>
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