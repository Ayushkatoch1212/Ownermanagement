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
  Chip,
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
    capacity: 2,
    monthlyRent: 7000,
    electricityType: "fixed",
    electricityRate: 8,
    fixedElectricity: 500,
  });

  async function load() {
    setData((await (await fetch("/api/rooms")).json()).data || []);
  }

  useEffect(() => {
    load();

    fetch("/api/pgs")
      .then((r) => r.json())
      .then((x) => setPgs(x.data || []));
  }, []);

  async function save() {
    const r = await fetch("/api/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(v),
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
            Rooms
          </Typography>

          <Typography color="text.secondary">
            Capacity, rent and occupancy.
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
            size={{ xs: 12, sm: 6, lg: 4 }}
          >
            <Card variant="outlined">
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
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
                  {r.pgId?.name || "PG"} · Floor {r.floor || "-"}
                </Typography>

                <Typography sx={{ mt: 2 }}>
                  Occupancy{" "}
                  <b>
                    {r.occupied}/{r.capacity}
                  </b>{" "}
                  · Rent <b>₹{r.monthlyRent}</b>
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ mt: 1 }}
                >
                  Available beds: {r.availableBeds}
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
        <DialogTitle>Add Room</DialogTitle>

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

          {[
            "roomNumber",
            "floor",
            "capacity",
            "monthlyRent",
          ].map((k) => (
            <TextField
              key={k}
              label={k}
              type={
                k === "roomNumber"
                  ? "text"
                  : "number"
              }
              value={v[k]}
              onChange={(e) =>
                setV({
                  ...v,
                  [k]:
                    k === "roomNumber"
                      ? e.target.value
                      : Number(e.target.value),
                })
              }
            />
          ))}

          <TextField
            select
            label="Electricity type"
            value={v.electricityType}
            onChange={(e) =>
              setV({
                ...v,
                electricityType: e.target.value,
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

          {v.electricityType === "fixed" && (
            <TextField
              label="Fixed electricity"
              type="number"
              value={v.fixedElectricity}
              onChange={(e) =>
                setV({
                  ...v,
                  fixedElectricity: Number(
                    e.target.value
                  ),
                })
              }
            />
          )}

          {v.electricityType === "meter" && (
            <TextField
              label="Rate per unit"
              type="number"
              value={v.electricityRate}
              onChange={(e) =>
                setV({
                  ...v,
                  electricityRate: Number(
                    e.target.value
                  ),
                })
              }
            />
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={save}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}