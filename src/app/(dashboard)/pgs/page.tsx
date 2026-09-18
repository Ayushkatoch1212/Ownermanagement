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
  IconButton,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import { Animated } from "@/components/Animated";

export default function PGs() {
  const [data, setData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const [v, setV] = useState<any>({
    name: "",
    address: "",
    city: "",
    state: "",
    totalRooms: "",
    totalCapacity: "",
    description: "",
    amenities: [],
  });

  // --------------------------------
  // Load PGs
  // --------------------------------
  async function load() {
    try {
      const response = await fetch("/api/pgs");
      const result = await response.json();

      setData(result.data || []);
    } catch (error) {
      console.error("LOAD PG ERROR:", error);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // --------------------------------
  // Save PG
  // --------------------------------
 async function save() {
  const payload = {
    ...v,
    totalRooms: Number(v.totalRooms || 0),
    totalCapacity: Number(v.totalCapacity || 0),
  };

  const r = await fetch("/api/pgs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (r.ok) {
    setOpen(false);

    setV({
      name: "",
      address: "",
      city: "",
      state: "",
      totalRooms: "",
      totalCapacity: "",
      description: "",
      amenities: [],
    });

    load();
  }
}

  // --------------------------------
  // Delete PG
  // --------------------------------
  async function del(id: string) {
    if (!confirm("Delete this PG?")) return;

    try {
      const response = await fetch(`/api/pgs/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Unable to delete PG");
        return;
      }

      load();
    } catch (error) {
      console.error("DELETE PG ERROR:", error);
      alert("Unable to delete PG");
    }
  }

  // --------------------------------
  // Numeric input handler
  // --------------------------------
  function handleNumberChange(
    field: "totalRooms" | "totalCapacity",
    value: string
  ) {
    // Allow only numbers
    const numericValue = value.replace(/\D/g, "");

    setV((prev: any) => ({
      ...prev,
      [field]: numericValue,
    }));
  }

  return (
    <Animated>
      {/* --------------------------------
          Header
      -------------------------------- */}
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
            PGs
          </Typography>

          <Typography color="text.secondary">
            Manage all properties.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Add PG
        </Button>
      </Box>

      {/* --------------------------------
          PG Cards
      -------------------------------- */}
      <Grid container spacing={2}>
        {data.map((pg) => (
          <Grid
            key={pg._id}
            size={{
              xs: 12,
              md: 6,
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
                    {pg.name}
                  </Typography>

                  <IconButton
                    color="error"
                    onClick={() => del(pg._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>

                <Typography color="text.secondary">
                  {pg.address}, {pg.city}
                </Typography>

                <Typography sx={{ mt: 2 }}>
                  Rooms: <b>{pg.totalRooms}</b>
                  {" · "}
                  Capacity: <b>{pg.totalCapacity}</b>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* --------------------------------
          Add PG Dialog
      -------------------------------- */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Add PG
        </DialogTitle>

        <DialogContent
          sx={{
            display: "grid",
            gap: 2,
            pt: 2,
          }}
        >
          {/* Name */}
          <TextField
            label="Name"
            value={v.name}
            onChange={(e) =>
              setV({
                ...v,
                name: e.target.value,
              })
            }
            fullWidth
          />

          {/* Address */}
          <TextField
            label="Address"
            value={v.address}
            onChange={(e) =>
              setV({
                ...v,
                address: e.target.value,
              })
            }
            fullWidth
          />

          {/* City */}
          <TextField
            label="City"
            value={v.city}
            onChange={(e) =>
              setV({
                ...v,
                city: e.target.value,
              })
            }
            fullWidth
          />

          {/* State */}
          <TextField
            label="State"
            value={v.state}
            onChange={(e) =>
              setV({
                ...v,
                state: e.target.value,
              })
            }
            fullWidth
          />

          {/* Description */}
          <TextField
            label="Description"
            value={v.description}
            onChange={(e) =>
              setV({
                ...v,
                description: e.target.value,
              })
            }
            fullWidth
            multiline
            minRows={3}
          />

          {/* Total Rooms + Total Capacity */}
         <Box sx={{ display: "flex", gap: 2 }}>
  <TextField
    fullWidth
    type="text"
    label="Total rooms"
    value={v.totalRooms}
    placeholder="Enter total rooms"
    onChange={(e) => {
      const value = e.target.value.replace(/\D/g, "");

      setV({
        ...v,
        totalRooms: value,
      });
    }}
  />

  <TextField
    fullWidth
    type="text"
    label="Total capacity"
    value={v.totalCapacity}
    placeholder="Enter total capacity"
    onChange={(e) => {
      const value = e.target.value.replace(/\D/g, "");

      setV({
        ...v,
        totalCapacity: value,
      });
    }}
  />
</Box>
        </DialogContent>

        {/* --------------------------------
            Dialog Actions
        -------------------------------- */}
        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false);

              setV({
                name: "",
                address: "",
                city: "",
                state: "",
                totalRooms: "",
                totalCapacity: "",
                description: "",
                amenities: [],
              });
            }}
          >
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
    </Animated>
  );
}