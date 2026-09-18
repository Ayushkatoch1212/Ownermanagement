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

import StatusChip from "@/components/StatusChip";

export default function Students() {
  const [data, setData] = useState<any[]>([]);
  const [pgs, setPgs] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const [v, setV] = useState<any>({
    pgId: "",
    roomId: "",
    name: "",
    phone: "",
    email: "",
    registrationNumber: "",
    guardianName: "",
    guardianPhone: "",
    college: "",
    joiningDate: new Date().toISOString().slice(0, 10),

    monthlyRent: "7000",

    securityDeposit: "7000",
    securityDepositPaid: "0",

    status: "active",
    notes: "",
  });

  // ---------------------------------------
  // Reset form
  // ---------------------------------------
  function resetForm() {
    setV({
      pgId: "",
      roomId: "",
      name: "",
      phone: "",
      email: "",
      registrationNumber: "",
      guardianName: "",
      guardianPhone: "",
      college: "",
      joiningDate: new Date().toISOString().slice(0, 10),

      monthlyRent: "7000",

      securityDeposit: "7000",
      securityDepositPaid: "0",

      status: "active",
      notes: "",
    });
  }

  // ---------------------------------------
  // Load Students
  // ---------------------------------------
  async function load() {
    try {
      const response = await fetch("/api/students");

      const result = await response.json();

      setData(result.data || []);
    } catch (error) {
      console.error("LOAD STUDENTS ERROR:", error);
    }
  }

  // ---------------------------------------
  // Initial Load
  // ---------------------------------------
  useEffect(() => {
    load();

    fetch("/api/pgs")
      .then((r) => r.json())
      .then((x) => setPgs(x.data || []))
      .catch((error) => {
        console.error("LOAD PG ERROR:", error);
      });

    fetch("/api/rooms")
      .then((r) => r.json())
      .then((x) => setRooms(x.data || []))
      .catch((error) => {
        console.error("LOAD ROOMS ERROR:", error);
      });
  }, []);

  // ---------------------------------------
  // Filter rooms according to selected PG
  // ---------------------------------------
  const roomOptions = rooms.filter(
    (r) =>
      !v.pgId ||
      String(r.pgId?._id || r.pgId) ===
        String(v.pgId)
  );

  // ---------------------------------------
  // Numeric input handler
  // ---------------------------------------
  function handleNumberChange(
    field:
      | "monthlyRent"
      | "securityDeposit"
      | "securityDepositPaid",
    value: string
  ) {
    // Allow numbers only
    const numericValue = value.replace(/\D/g, "");

    setV((prev: any) => ({
      ...prev,
      [field]: numericValue,
    }));
  }

  // ---------------------------------------
  // Save Student
  // ---------------------------------------
  async function save() {
    if (
      !v.pgId ||
      !v.roomId ||
      !v.name ||
      !v.phone
    ) {
      alert(
        "PG, Room, Name and Phone are required."
      );

      return;
    }

    const payload = {
      ...v,

      monthlyRent: Number(v.monthlyRent || 0),

      securityDeposit: Number(
        v.securityDeposit || 0
      ),

      securityDepositPaid: Number(
        v.securityDepositPaid || 0
      ),
    };

    try {
      const response = await fetch(
        "/api/students",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(
          result.message ||
            "Unable to create student."
        );

        return;
      }

      setOpen(false);

      resetForm();

      load();
    } catch (error) {
      console.error(
        "SAVE STUDENT ERROR:",
        error
      );

      alert(
        "Unable to create student. Please try again."
      );
    }
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
            Students
          </Typography>

          <Typography color="text.secondary">
            Manage tenants and their assigned
            rooms.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setOpen(true);
          }}
        >
          Add Student
        </Button>
      </Box>

      {/* ---------------------------------------
          Students Table
      --------------------------------------- */}
      <Card variant="outlined">
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  Name
                </TableCell>

                <TableCell>
                  Registration
                </TableCell>

                <TableCell>
                  PG
                </TableCell>

                <TableCell>
                  Room
                </TableCell>

                <TableCell>
                  Monthly Rent
                </TableCell>

                <TableCell>
                  Status
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {data.map((s) => (
                <TableRow key={s._id}>
                  <TableCell>
                    <b>{s.name}</b>

                    <br />

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {s.phone}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    {s.registrationNumber ||
                      "-"}
                  </TableCell>

                  <TableCell>
                    {s.pgId?.name || "-"}
                  </TableCell>

                  <TableCell>
                    Room{" "}
                    {s.roomId?.roomNumber ||
                      "-"}
                  </TableCell>

                  <TableCell>
                    ₹{s.monthlyRent || 0}
                  </TableCell>

                  <TableCell>
                    <StatusChip
                      status={s.status}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ---------------------------------------
          Add Student Dialog
      --------------------------------------- */}
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          resetForm();
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Add Student
        </DialogTitle>

        <DialogContent
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
            },
            gap: 2,
            pt: 2,
          }}
        >
          {/* PG */}
          <TextField
            select
            label="PG"
            value={v.pgId}
            onChange={(e) =>
              setV({
                ...v,
                pgId: e.target.value,
                roomId: "",
              })
            }
            fullWidth
          >
            {pgs.map((p) => (
              <MenuItem
                key={p._id}
                value={p._id}
              >
                {p.name}
              </MenuItem>
            ))}
          </TextField>

          {/* Room */}
          <TextField
            select
            label="Room"
            value={v.roomId}
            onChange={(e) =>
              setV({
                ...v,
                roomId: e.target.value,
              })
            }
            fullWidth
          >
            {roomOptions.map((r) => (
              <MenuItem
                key={r._id}
                value={r._id}
              >
                Room {r.roomNumber} ·{" "}
                {r.occupied || 0}/
                {r.capacity} occupied
              </MenuItem>
            ))}
          </TextField>

          {/* Basic Information */}
          {[
            ["name", "Full name"],
            ["phone", "Phone"],
            ["email", "Email"],
            [
              "registrationNumber",
              "Registration number",
            ],
            ["guardianName", "Guardian name"],
            [
              "guardianPhone",
              "Guardian phone",
            ],
            ["college", "College"],
          ].map(([key, label]) => (
            <TextField
              key={key}
              label={label}
              value={v[key]}
              onChange={(e) =>
                setV({
                  ...v,
                  [key]: e.target.value,
                })
              }
              fullWidth
            />
          ))}

          {/* Joining Date */}
          <TextField
            type="date"
            label="Joining date"
            InputLabelProps={{
              shrink: true,
            }}
            value={v.joiningDate}
            onChange={(e) =>
              setV({
                ...v,
                joiningDate: e.target.value,
              })
            }
            fullWidth
          />

          {/* ---------------------------------------
              Monthly Rent
              Normal text input - NO spinner
          --------------------------------------- */}
          <TextField
            type="text"
            label="Monthly Rent"
            value={v.monthlyRent}
            placeholder="Enter monthly rent"
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
            onChange={(e) =>
              handleNumberChange(
                "monthlyRent",
                e.target.value
              )
            }
            helperText="Stored for student reference. Room billing uses the room rent."
            fullWidth
          />

          {/* ---------------------------------------
              Security Deposit
              Normal text input - NO spinner
          --------------------------------------- */}
          <TextField
            type="text"
            label="Security Deposit"
            value={v.securityDeposit}
            placeholder="Enter security deposit"
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
            onChange={(e) =>
              handleNumberChange(
                "securityDeposit",
                e.target.value
              )
            }
            fullWidth
          />

          {/* ---------------------------------------
              Deposit Paid
              Normal text input - NO spinner
          --------------------------------------- */}
          <TextField
            type="text"
            label="Deposit Paid"
            value={v.securityDepositPaid}
            placeholder="Enter amount paid"
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
            onChange={(e) =>
              handleNumberChange(
                "securityDepositPaid",
                e.target.value
              )
            }
            fullWidth
          />

          {/* Notes */}
          <TextField
            label="Notes"
            value={v.notes}
            onChange={(e) =>
              setV({
                ...v,
                notes: e.target.value,
              })
            }
            multiline
            minRows={2}
            fullWidth
          />
        </DialogContent>

        {/* ---------------------------------------
            Dialog Actions
        --------------------------------------- */}
        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false);
              resetForm();
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={save}
          >
            Save Student
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}