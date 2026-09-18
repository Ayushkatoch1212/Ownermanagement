"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";

type Room = {
  _id: string;
  roomNumber: string;
  capacity: number;
  occupied: number;
  monthlyRent: number;
  electricityType: "fixed" | "meter" | "included";
  electricityRate: number;
  fixedElectricity: number;
  status: string;
  pgId?: {
    _id: string;
    name: string;
  };
};

type ElectricityReading = {
  _id: string;
  roomId:
    | string
    | {
        _id: string;
        roomNumber: string;
      };
  pgId?: {
    _id: string;
    name: string;
  };
  billingMonth: string;
  previousReading: number;
  currentReading: number;
  unitsUsed: number;
  ratePerUnit: number;
  amount: number;
  overridden: boolean;
};

export default function ElectricityPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [readings, setReadings] = useState<ElectricityReading[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [open, setOpen] = useState(false);
  const [editingReading, setEditingReading] =
    useState<ElectricityReading | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [billingMonth, setBillingMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [form, setForm] = useState({
    roomId: "",
    previousReading: "",
    currentReading: "",
    ratePerUnit: "",
    overridden: false,
    amount: "",
  });

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [roomsRes, electricityRes] = await Promise.all([
        fetch("/api/rooms"),
        fetch(`/api/electricity?billingMonth=${billingMonth}`),
      ]);

      const roomsJson = await roomsRes.json();
      const electricityJson = await electricityRes.json();

      if (!roomsRes.ok || !roomsJson.success) {
        throw new Error(
          roomsJson.message || "Unable to load rooms"
        );
      }

      if (!electricityRes.ok || !electricityJson.success) {
        throw new Error(
          electricityJson.message ||
            "Unable to load electricity readings"
        );
      }

      setRooms(roomsJson.data || []);
      setReadings(electricityJson.data || []);
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [billingMonth]);

  function resetForm() {
    setForm({
      roomId: "",
      previousReading: "",
      currentReading: "",
      ratePerUnit: "",
      overridden: false,
      amount: "",
    });

    setEditingReading(null);
  }

  function handleOpenCreate() {
    resetForm();
    setOpen(true);
  }

  function handleEdit(reading: ElectricityReading) {
    const roomId =
      typeof reading.roomId === "string"
        ? reading.roomId
        : reading.roomId._id;

    setEditingReading(reading);

    setForm({
      roomId,
      previousReading: String(reading.previousReading ?? ""),
      currentReading: String(reading.currentReading ?? ""),
      ratePerUnit: String(reading.ratePerUnit ?? ""),
      overridden: Boolean(reading.overridden),
      amount: String(reading.amount ?? ""),
    });

    setOpen(true);
  }

  function handleClose() {
    if (saving) return;

    setOpen(false);
    resetForm();
  }

  function handleRoomChange(roomId: string) {
    const room = rooms.find((r) => r._id === roomId);

    setForm((prev) => ({
      ...prev,
      roomId,
      ratePerUnit:
        room?.electricityType === "meter"
          ? String(room.electricityRate ?? 0)
          : prev.ratePerUnit,
    }));
  }

  const selectedRoom = useMemo(
    () => rooms.find((r) => r._id === form.roomId),
    [rooms, form.roomId]
  );

  const previousReading = Number(form.previousReading || 0);
  const currentReading = Number(form.currentReading || 0);
  const ratePerUnit = Number(form.ratePerUnit || 0);

  const unitsUsed = Math.max(
    currentReading - previousReading,
    0
  );

  const calculatedAmount =
    unitsUsed * ratePerUnit;

  const displayAmount = form.overridden
    ? Number(form.amount || 0)
    : calculatedAmount;

  async function handleSubmit() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!form.roomId) {
        throw new Error("Please select a room");
      }

      if (currentReading < previousReading) {
        throw new Error(
          "Current reading cannot be less than previous reading"
        );
      }

      if (ratePerUnit < 0) {
        throw new Error(
          "Rate per unit cannot be negative"
        );
      }

      if (form.overridden && Number(form.amount || 0) < 0) {
        throw new Error(
          "Electricity amount cannot be negative"
        );
      }

      const payload = {
        roomId: form.roomId,
        billingMonth,
        previousReading,
        currentReading,
        ratePerUnit,
        overridden: form.overridden,
        ...(form.overridden
          ? {
              amount: Number(form.amount || 0),
            }
          : {}),
      };

      const response = await fetch("/api/electricity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to save electricity reading"
        );
      }

      setSuccess(
        editingReading
          ? "Electricity reading updated successfully"
          : "Electricity reading saved successfully"
      );

      setOpen(false);
      resetForm();

      await loadData();

      setTimeout(() => {
        setSuccess("");
      }, 4000);
    } catch (err: any) {
      setError(err?.message || "Unable to save reading");
    } finally {
      setSaving(false);
    }
  }

  const readingMap = new Map(
    readings.map((reading) => {
      const roomId =
        typeof reading.roomId === "string"
          ? reading.roomId
          : reading.roomId._id;

      return [roomId, reading];
    })
  );

  const totalElectricity = readings.reduce(
    (sum, reading) => sum + Number(reading.amount || 0),
    0
  );

  const totalUnits = readings.reduce(
    (sum, reading) => sum + Number(reading.unitsUsed || 0),
    0
  );

  const roomsWithMeter = rooms.filter(
    (room) => room.electricityType === "meter"
  );

  return (
    <Box>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ mb: 0.5 }}
          >
            Electricity
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Manage room-wise electricity readings and
            monthly charges
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            disabled={loading}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
          >
            Add Reading
          </Button>
        </Stack>
      </Stack>

      {/* Alerts */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}

      {/* Month selector */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "stretch", sm: "center" }}
            spacing={2}
          >
            <TextField
              label="Billing Month"
              type="month"
              value={billingMonth}
              onChange={(e) =>
                setBillingMonth(e.target.value)
              }
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ minWidth: 220 }}
            />

            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Showing electricity data for
              </Typography>

              <Typography fontWeight={600}>
                {new Date(
                  `${billingMonth}-01`
                ).toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
              >
                <ElectricBoltIcon
                  sx={{
                    fontSize: 38,
                    color: "warning.main",
                  }}
                />

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Total Units
                  </Typography>

                  <Typography
                    variant="h5"
                    fontWeight={700}
                  >
                    {totalUnits.toFixed(2)} Units
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Electricity Charges
              </Typography>

              <Typography
                variant="h5"
                fontWeight={700}
                sx={{ mt: 0.5 }}
              >
                ₹{totalElectricity.toLocaleString("en-IN")}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Meter Rooms
              </Typography>

              <Typography
                variant="h5"
                fontWeight={700}
                sx={{ mt: 0.5 }}
              >
                {roomsWithMeter.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Room cards */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 8,
          }}
        >
          <CircularProgress />
        </Box>
      ) : rooms.length === 0 ? (
        <Card>
          <CardContent>
            <Typography
              textAlign="center"
              color="text.secondary"
              py={5}
            >
              No rooms found. Create a room first.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {rooms.map((room) => {
            const reading = readingMap.get(room._id);

            const isMeter =
              room.electricityType === "meter";

            const isFixed =
              room.electricityType === "fixed";

            const isIncluded =
              room.electricityType === "included";

            return (
              <Grid
                key={room._id}
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 4,
                }}
              >
                <Card
                  sx={{
                    height: "100%",
                    transition: "0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Box>
                        <Typography
                          variant="h6"
                          fontWeight={700}
                        >
                          Room {room.roomNumber}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {room.pgId?.name ||
                            "PG"}
                        </Typography>
                      </Box>

                      <IconButton
                        size="small"
                        onClick={() =>
                          reading &&
                          handleEdit(reading)
                        }
                        disabled={!reading}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Stack spacing={1.3}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Occupancy
                        </Typography>

                        <Typography fontWeight={600}>
                          {room.occupied}/
                          {room.capacity}
                        </Typography>
                      </Stack>

                      <Stack
                        direction="row"
                        justifyContent="space-between"
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Electricity Type
                        </Typography>

                        <Typography
                          fontWeight={600}
                          textTransform="capitalize"
                        >
                          {room.electricityType}
                        </Typography>
                      </Stack>

                      {isMeter && (
                        <>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              Previous Reading
                            </Typography>

                            <Typography fontWeight={600}>
                              {reading
                                ? reading.previousReading
                                : "-"}
                            </Typography>
                          </Stack>

                          <Stack
                            direction="row"
                            justifyContent="space-between"
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              Current Reading
                            </Typography>

                            <Typography fontWeight={600}>
                              {reading
                                ? reading.currentReading
                                : "-"}
                            </Typography>
                          </Stack>

                          <Stack
                            direction="row"
                            justifyContent="space-between"
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              Units Used
                            </Typography>

                            <Typography fontWeight={600}>
                              {reading
                                ? `${reading.unitsUsed} Units`
                                : "-"}
                            </Typography>
                          </Stack>

                          <Stack
                            direction="row"
                            justifyContent="space-between"
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              Rate / Unit
                            </Typography>

                            <Typography fontWeight={600}>
                              {reading
                                ? `₹${reading.ratePerUnit}`
                                : `₹${room.electricityRate || 0}`}
                            </Typography>
                          </Stack>

                          <Divider />

                          <Stack
                            direction="row"
                            justifyContent="space-between"
                          >
                            <Typography fontWeight={600}>
                              Electricity Amount
                            </Typography>

                            <Typography
                              fontWeight={700}
                              color="primary"
                            >
                              ₹
                              {Number(
                                reading?.amount || 0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </Typography>
                          </Stack>

                          {!reading && (
                            <Button
                              variant="contained"
                              fullWidth
                              startIcon={<AddIcon />}
                              onClick={() => {
                                resetForm();

                                setForm((prev) => ({
                                  ...prev,
                                  roomId: room._id,
                                  ratePerUnit:
                                    String(
                                      room.electricityRate ||
                                        0
                                    ),
                                }));

                                setOpen(true);
                              }}
                              sx={{ mt: 1 }}
                            >
                              Add Reading
                            </Button>
                          )}
                        </>
                      )}

                      {isFixed && (
                        <>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              Fixed Electricity
                            </Typography>

                            <Typography
                              fontWeight={700}
                            >
                              ₹
                              {Number(
                                room.fixedElectricity ||
                                  0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </Typography>
                          </Stack>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Fixed electricity will be
                            used automatically in the
                            monthly room bill.
                          </Typography>
                        </>
                      )}

                      {isIncluded && (
                        <Alert
                          severity="info"
                          icon={false}
                        >
                          Electricity is included in
                          the room rent.
                        </Alert>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
              >
                {editingReading
                  ? "Update Electricity Reading"
                  : "Add Electricity Reading"}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Room-wise electricity for{" "}
                {new Date(
                  `${billingMonth}-01`
                ).toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </Typography>
            </Box>

            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              fullWidth
              label="Room"
              value={form.roomId}
              onChange={(e) =>
                handleRoomChange(e.target.value)
              }
              disabled={Boolean(editingReading)}
            >
              {rooms
                .filter(
                  (room) =>
                    room.electricityType === "meter"
                )
                .map((room) => (
                  <MenuItem
                    key={room._id}
                    value={room._id}
                  >
                    Room {room.roomNumber} —{" "}
                    {room.pgId?.name || "PG"}
                  </MenuItem>
                ))}
            </TextField>

            {selectedRoom && (
              <Alert severity="info">
                Room {selectedRoom.roomNumber} has{" "}
                {selectedRoom.occupied}/
                {selectedRoom.capacity} occupants.
                Electricity will be billed to the
                room, not individually to students.
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Previous Reading"
                  value={form.previousReading}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      previousReading:
                        e.target.value,
                    }))
                  }
                  inputProps={{
                    min: 0,
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Current Reading"
                  value={form.currentReading}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      currentReading:
                        e.target.value,
                    }))
                  }
                  inputProps={{
                    min: 0,
                  }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Rate Per Unit"
                  value={form.ratePerUnit}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      ratePerUnit:
                        e.target.value,
                    }))
                  }
                  inputProps={{
                    min: 0,
                    step: "0.01",
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Units Used"
                  value={unitsUsed}
                  slotProps={{
                    input: {
                      readOnly: true,
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Card variant="outlined">
              <CardContent>
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Typography color="text.secondary">
                      Calculation
                    </Typography>

                    <Typography fontWeight={600}>
                      {unitsUsed} × ₹
                      {ratePerUnit}
                    </Typography>
                  </Stack>

                  <Divider />

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Typography fontWeight={700}>
                      Electricity Amount
                    </Typography>

                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color="primary"
                    >
                      ₹
                      {calculatedAmount.toLocaleString(
                        "en-IN",
                        {
                          maximumFractionDigits: 2,
                        }
                      )}
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Button
              variant={
                form.overridden
                  ? "contained"
                  : "outlined"
              }
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  overridden: !prev.overridden,
                }))
              }
            >
              {form.overridden
                ? "Manual Amount Enabled"
                : "Override Amount Manually"}
            </Button>

            {form.overridden && (
              <TextField
                fullWidth
                type="number"
                label="Manual Electricity Amount"
                value={form.amount}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }))
                }
                inputProps={{
                  min: 0,
                  step: "0.01",
                }}
                helperText="Use this only when the calculated amount needs to be overridden."
              />
            )}

            <Alert severity="success">
              Final room electricity charge:{" "}
              <strong>
                ₹
                {displayAmount.toLocaleString(
                  "en-IN",
                  {
                    maximumFractionDigits: 2,
                  }
                )}
              </strong>
            </Alert>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleClose}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              saving ||
              !form.roomId ||
              currentReading < previousReading
            }
          >
            {saving
              ? "Saving..."
              : editingReading
              ? "Update Reading"
              : "Save Reading"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}