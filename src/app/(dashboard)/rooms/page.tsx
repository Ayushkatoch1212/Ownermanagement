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
    floor: 1,
    capacity: 4,
    monthlyRent: 10000,
    electricityType: "meter",
    electricityRate: 8,
    fixedElectricity: 500,
  });

  async function load() {
    const response = await fetch(
      "/api/rooms"
    );

    const result = await response.json();

    setData(result.data || []);
  }

  useEffect(() => {
    load();

    fetch("/api/pgs")
      .then((r) => r.json())
      .then((x) => setPgs(x.data || []));
  }, []);

  async function save() {
    if (
      !v.pgId ||
      !v.roomNumber ||
      !v.capacity
    ) {
      alert(
        "PG, Room Number and Capacity are required."
      );
      return;
    }

    const response = await fetch(
      "/api/rooms",
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
          onClick={() => setOpen(true)}
        >
          Add Room
        </Button>
      </Box>

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
                    justifyContent:
                      "space-between",
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight={700}
                  >
                    Room {r.roomNumber}
                  </Typography>

                  <StatusChip
                    status={r.status}
                  />
                </Box>

                <Typography color="text.secondary">
                  {r.pgId?.name || "PG"} · Floor{" "}
                  {r.floor ?? "-"}
                </Typography>

                <Typography sx={{ mt: 2 }}>
                  Occupancy{" "}
                  <b>
                    {r.occupied || 0}/
                    {r.capacity}
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
                  {r.electricityType ===
                  "meter"
                    ? `₹${r.electricityRate || 0}/unit`
                    : r.electricityType ===
                      "fixed"
                    ? `₹${r.fixedElectricity || 0} fixed`
                    : "Included"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
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
            label="Room Number"
            value={v.roomNumber}
            onChange={(e) =>
              setV({
                ...v,
                roomNumber: e.target.value,
              })
            }
          />

          <TextField
            label="Floor"
            type="number"
            value={v.floor}
            onChange={(e) =>
              setV({
                ...v,
                floor: Number(
                  e.target.value
                ),
              })
            }
          />

          <TextField
            label="Maximum Occupancy"
            type="number"
            value={v.capacity}
            onChange={(e) =>
              setV({
                ...v,
                capacity: Number(
                  e.target.value
                ),
              })
            }
            helperText="Example: 4 students"
          />

          <TextField
            label="Room Monthly Rent"
            type="number"
            value={v.monthlyRent}
            onChange={(e) =>
              setV({
                ...v,
                monthlyRent: Number(
                  e.target.value
                ),
              })
            }
            helperText="This is the total rent for the room."
          />

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

          {v.electricityType ===
            "fixed" && (
            <TextField
              label="Fixed Electricity"
              type="number"
              value={v.fixedElectricity}
              onChange={(e) =>
                setV({
                  ...v,
                  fixedElectricity:
                    Number(
                      e.target.value
                    ),
                })
              }
            />
          )}

          {v.electricityType ===
            "meter" && (
            <TextField
              label="Rate Per Unit"
              type="number"
              value={v.electricityRate}
              onChange={(e) =>
                setV({
                  ...v,
                  electricityRate:
                    Number(
                      e.target.value
                    ),
                })
              }
            />
          )}
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
            Save Room
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}