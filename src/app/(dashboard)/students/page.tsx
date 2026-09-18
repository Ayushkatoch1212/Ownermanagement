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
    joiningDate: new Date()
      .toISOString()
      .slice(0, 10),

    monthlyRent: 7000,

    securityDeposit: 7000,
    securityDepositPaid: 0,

    status: "active",
    notes: "",
  });

  async function load() {
    const response = await fetch(
      "/api/students"
    );

    const result = await response.json();

    setData(result.data || []);
  }

  useEffect(() => {
    load();

    fetch("/api/pgs")
      .then((r) => r.json())
      .then((x) => setPgs(x.data || []));

    fetch("/api/rooms")
      .then((r) => r.json())
      .then((x) => setRooms(x.data || []));
  }, []);

  const roomOptions = rooms.filter(
    (r) =>
      !v.pgId ||
      String(r.pgId?._id || r.pgId) ===
        String(v.pgId)
  );

  async function save() {
    if (!v.pgId || !v.roomId || !v.name || !v.phone) {
      alert(
        "PG, Room, Name and Phone are required."
      );
      return;
    }

    const response = await fetch(
      "/api/students",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(v),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      alert(result.message);
      return;
    }

    setOpen(false);

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
      joiningDate: new Date()
        .toISOString()
        .slice(0, 10),
      monthlyRent: 7000,
      securityDeposit: 7000,
      securityDepositPaid: 0,
      status: "active",
      notes: "",
    });

    load();
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
          onClick={() => setOpen(true)}
        >
          Add Student
        </Button>
      </Box>

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

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
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

          {[
            ["name", "Full name"],
            ["phone", "Phone"],
            ["email", "Email"],
            [
              "registrationNumber",
              "Registration number",
            ],
            ["guardianName", "Guardian name"],
            ["guardianPhone", "Guardian phone"],
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
            />
          ))}

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
          />

          <TextField
            type="number"
            label="Monthly Rent"
            value={v.monthlyRent}
            onChange={(e) =>
              setV({
                ...v,
                monthlyRent: Number(
                  e.target.value
                ),
              })
            }
            helperText="Stored for student reference. Room billing uses the room rent."
          />

          <TextField
            type="number"
            label="Security Deposit"
            value={v.securityDeposit}
            onChange={(e) =>
              setV({
                ...v,
                securityDeposit: Number(
                  e.target.value
                ),
              })
            }
          />

          <TextField
            type="number"
            label="Deposit Paid"
            value={v.securityDepositPaid}
            onChange={(e) =>
              setV({
                ...v,
                securityDepositPaid: Number(
                  e.target.value
                ),
              })
            }
          />

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
          />
        </DialogContent>

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
            Save Student
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}