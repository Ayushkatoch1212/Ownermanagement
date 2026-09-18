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
  Grid,
  MenuItem,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import StatusChip from "@/components/StatusChip";

export default function Rooms() {
  const [data, setData] = useState<any[]>([]);
  const [pgs, setPgs] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const [v, setV] = useState<any>({
    pgId: "",
    roomNumber: "",
    floor: "1",
    capacity: "4",
    monthlyRent: "10000",
    electricityType: "meter",
    electricityRate: "8",
    fixedElectricity: "500",
  });

  // ---------------------------------------
  // Reset form
  // ---------------------------------------
  function resetForm() {
    setV({
      pgId: "",
      roomNumber: "",
      floor: "1",
      capacity: "4",
      monthlyRent: "10000",
      electricityType: "meter",
      electricityRate: "8",
      fixedElectricity: "500",
    });
  }

  // ---------------------------------------
  // Load Rooms
  // ---------------------------------------
  async function load() {
    try {
      const response = await fetch("/api/rooms");

      const result = await response.json();

      setData(result.data || []);
    } catch (error) {
      console.error("LOAD ROOMS ERROR:", error);
    }
  }

  // ---------------------------------------
  // Load data
  // ---------------------------------------
  useEffect(() => {
    load();

    fetch("/api/pgs")
      .then((r) => r.json())
      .then((x) => setPgs(x.data || []))
      .catch((error) => {
        console.error("LOAD PG ERROR:", error);
      });
  }, []);

  // ---------------------------------------
  // Numeric input handler
  // ---------------------------------------
  function handleNumberChange(
    field:
      | "floor"
      | "capacity"
      | "monthlyRent"
      | "electricityRate"
      | "fixedElectricity",
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
  // Save Room
  // ---------------------------------------
  async function save() {
    if (!v.pgId || !v.roomNumber || !v.capacity) {
      alert("PG, Room Number and Capacity are required.");
      return;
    }

    const payload = {
      ...v,

      floor: Number(v.floor || 0),
      capacity: Number(v.capacity || 0),
      monthlyRent: Number(v.monthlyRent || 0),
      electricityRate: Number(v.electricityRate || 0),
      fixedElectricity: Number(v.fixedElectricity || 0),
    };

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Unable to create room.");
        return;
      }

      setOpen(false);

      resetForm();

      load();
    } catch (error) {
      console.error("SAVE ROOM ERROR:", error);

      alert("Unable to create room. Please try again.");
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
            Rooms
          </Typography>

          <Typography color="text.secondary">
            Manage rooms, occupants, rent and
            electricity settings.
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
          Add Room
        </Button>
      </Box>

      {/* ---------------------------------------
          Room Cards
      --------------------------------------- */}
      <Grid container spacing={2}>
        {data.map((r) => (
          <Grid
            key={r._id}
            size={{
              xs: 12,
              sm: 6,
              lg: 4,
            }}
          >
            <Card variant="outlined">
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight={700}
                  >
                    Room {r.roomNumber}
                  </Typography>

                  <StatusChip status={r.status} />
                </Box>

                <Typography color="text.secondary">
                  {r.pgId?.name || "PG"} · Floor{" "}
                  {r.floor ?? "-"}
                </Typography>

                <Typography sx={{ mt: 2 }}>
                  Occupancy{" "}
                  <b>
                    {r.occupied || 0}/{r.capacity}
                  </b>
                </Typography>

                <Typography sx={{ mt: 1 }}>
                  Room Rent{" "}
                  <b>
                    ₹{r.monthlyRent || 0}
                  </b>
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Electricity:{" "}
                  {r.electricityType === "meter"
                    ? `₹${r.electricityRate || 0}/unit`
                    : r.electricityType === "fixed"
                    ? `₹${r.fixedElectricity || 0} fixed`
                    : "Included"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ---------------------------------------
          Add Room Dialog
      --------------------------------------- */}
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          resetForm();
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Add Room
        </DialogTitle>

        <DialogContent
          sx={{
            display: "grid",
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

          {/* Room Number */}
          <TextField
            label="Room Number"
            value={v.roomNumber}
            onChange={(e) =>
              setV({
                ...v,
                roomNumber: e.target.value,
              })
            }
            fullWidth
          />

          {/* ---------------------------------------
              Floor
              Normal text input - NO spinner
          --------------------------------------- */}
          <TextField
            label="Floor"
            type="text"
            value={v.floor}
            placeholder="Enter floor number"
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
            onChange={(e) =>
              handleNumberChange(
                "floor",
                e.target.value
              )
            }
            fullWidth
          />

          {/* ---------------------------------------
              Maximum Occupancy
              Normal text input - NO spinner
          --------------------------------------- */}
          <TextField
            label="Maximum Occupancy"
            type="text"
            value={v.capacity}
            placeholder="Enter maximum occupancy"
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
            onChange={(e) =>
              handleNumberChange(
                "capacity",
                e.target.value
              )
            }
            helperText="Example: 4 students"
            fullWidth
          />

          {/* ---------------------------------------
              Room Monthly Rent
              Normal text input - NO spinner
          --------------------------------------- */}
          <TextField
            label="Room Monthly Rent"
            type="text"
            value={v.monthlyRent}
            placeholder="Enter room rent"
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
            helperText="This is the total rent for the room."
            fullWidth
          />

          {/* Electricity Type */}
          <TextField
            select
            label="Electricity Type"
            value={v.electricityType}
            onChange={(e) =>
              setV({
                ...v,
                electricityType:
                  e.target.value,
              })
            }
            fullWidth
          >
            <MenuItem value="fixed">
              Fixed
            </MenuItem>

            <MenuItem value="meter">
              Meter
            </MenuItem>

            <MenuItem value="included">
              Included
            </MenuItem>
          </TextField>

          {/* ---------------------------------------
              Fixed Electricity
              Normal text input - NO spinner
          --------------------------------------- */}
          {v.electricityType === "fixed" && (
            <TextField
              label="Fixed Electricity"
              type="text"
              value={v.fixedElectricity}
              placeholder="Enter fixed electricity"
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*",
              }}
              onChange={(e) =>
                handleNumberChange(
                  "fixedElectricity",
                  e.target.value
                )
              }
              fullWidth
            />
          )}

          {/* ---------------------------------------
              Rate Per Unit
              Normal text input - NO spinner
          --------------------------------------- */}
          {v.electricityType === "meter" && (
            <TextField
              label="Rate Per Unit"
              type="text"
              value={v.electricityRate}
              placeholder="Enter rate per unit"
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*",
              }}
              onChange={(e) =>
                handleNumberChange(
                  "electricityRate",
                  e.target.value
                )
              }
              fullWidth
            />
          )}
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
            Save Room
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}