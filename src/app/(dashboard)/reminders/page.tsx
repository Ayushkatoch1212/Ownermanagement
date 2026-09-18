"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

type Reminder = {
  _id: string;
  title: string;
  description?: string;
  date: string;
  type: string;
  completed: boolean;
  isAutomatic?: boolean;
};

const initialForm = {
  title: "",
  description: "",
  date: new Date().toISOString().slice(0, 16),
  type: "custom",
};

export default function Reminders() {
  const [data, setData] = useState<Reminder[]>([]);

  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [v, setV] = useState(initialForm);


  // ----------------------------------------
  // LOAD REMINDERS
  // ----------------------------------------

  async function load() {
    try {
      const response = await fetch(
        "/api/reminders",
        {
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to load reminders"
        );
      }

      setData(result.data || []);
    } catch (error: any) {
      setError(
        error?.message || "Unable to load reminders"
      );
    }
  }


  useEffect(() => {
    load();
  }, []);


  // ----------------------------------------
  // CREATE REMINDER
  // ----------------------------------------

  async function save() {
    if (!v.title.trim()) {
      setError("Please enter reminder title");
      return;
    }

    if (!v.date) {
      setError("Please select reminder date");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/reminders",
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
        throw new Error(
          result.message || "Unable to create reminder"
        );
      }

      setOpen(false);

      setV(initialForm);

      await load();
    } catch (error: any) {
      setError(
        error?.message || "Unable to create reminder"
      );
    } finally {
      setLoading(false);
    }
  }


  // ----------------------------------------
  // COMPLETE REMINDER
  // ----------------------------------------

  async function completeReminder(id: string) {
    try {
      await fetch("/api/reminders", {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          id,
          completed: true,
        }),
      });

      await load();
    } catch {
      setError("Unable to update reminder");
    }
  }


  // ----------------------------------------
  // DELETE
  // ----------------------------------------

  async function deleteReminder(id: string) {
    try {
      await fetch(
        `/api/reminders?id=${id}`,
        {
          method: "DELETE",
        }
      );

      await load();
    } catch {
      setError("Unable to delete reminder");
    }
  }


  // ----------------------------------------
  // STATUS
  // ----------------------------------------

  function getStatus(reminder: Reminder) {
    if (reminder.completed) {
      return "completed";
    }

    const now = new Date();

    const date = new Date(reminder.date);

    if (date < now) {
      return "overdue";
    }

    return "upcoming";
  }


  // ----------------------------------------
  // COUNTS
  // ----------------------------------------

  const counts = useMemo(() => {
    let overdue = 0;
    let upcoming = 0;
    let completed = 0;

    data.forEach((item) => {
      const status = getStatus(item);

      if (status === "overdue") overdue++;

      if (status === "upcoming") upcoming++;

      if (status === "completed") completed++;
    });

    return {
      overdue,
      upcoming,
      completed,
      total: data.length,
    };
  }, [data]);


  return (
    <Box>

      {/* HEADER */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
          >
            Reminders
          </Typography>

          <Typography color="text.secondary">
            Manage rent, electricity, agreements
            and important PG tasks.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setError("");
            setOpen(true);
          }}
        >
          Add Reminder
        </Button>
      </Box>


      {/* ERROR */}

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}


      {/* SUMMARY */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >

        <Card variant="outlined">
          <CardContent>
            <Typography
              color="text.secondary"
              variant="body2"
            >
              Total
            </Typography>

            <Typography
              variant="h4"
              fontWeight={800}
            >
              {counts.total}
            </Typography>
          </CardContent>
        </Card>


        <Card variant="outlined">
          <CardContent>
            <Typography
              color="text.secondary"
              variant="body2"
            >
              Upcoming
            </Typography>

            <Typography
              variant="h4"
              fontWeight={800}
            >
              {counts.upcoming}
            </Typography>
          </CardContent>
        </Card>


        <Card variant="outlined">
          <CardContent>
            <Typography
              color="text.secondary"
              variant="body2"
            >
              Overdue
            </Typography>

            <Typography
              variant="h4"
              fontWeight={800}
            >
              {counts.overdue}
            </Typography>
          </CardContent>
        </Card>


        <Card variant="outlined">
          <CardContent>
            <Typography
              color="text.secondary"
              variant="body2"
            >
              Completed
            </Typography>

            <Typography
              variant="h4"
              fontWeight={800}
            >
              {counts.completed}
            </Typography>
          </CardContent>
        </Card>

      </Box>


      {/* REMINDERS */}

      <Stack spacing={2}>

        {data.length === 0 && (
          <Card variant="outlined">
            <CardContent
              sx={{
                py: 6,
                textAlign: "center",
              }}
            >
              <NotificationsActiveIcon
                sx={{
                  fontSize: 45,
                  color: "text.secondary",
                  mb: 1,
                }}
              />

              <Typography
                variant="h6"
                fontWeight={700}
              >
                No reminders
              </Typography>

              <Typography
                color="text.secondary"
              >
                Create your first reminder.
              </Typography>
            </CardContent>
          </Card>
        )}


        {data.map((item) => {

          const status = getStatus(item);

          return (
            <Card
              key={item._id}
              variant="outlined"
              sx={{
                opacity:
                  status === "completed"
                    ? 0.65
                    : 1,
              }}
            >
              <CardContent>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >

                  <Box sx={{ flex: 1 }}>

                    {/* TYPE */}

                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mb: 1 }}
                    >

                      <Chip
                        size="small"
                        label={item.type}
                      />

                      {item.isAutomatic && (
                        <Chip
                          size="small"
                          icon={
                            <NotificationsActiveIcon />
                          }
                          label="Automatic"
                          color="primary"
                          variant="outlined"
                        />
                      )}

                      {status === "overdue" && (
                        <Chip
                          size="small"
                          label="Overdue"
                          color="error"
                        />
                      )}

                      {status === "completed" && (
                        <Chip
                          size="small"
                          label="Completed"
                          color="success"
                        />
                      )}

                    </Stack>


                    {/* TITLE */}

                    <Typography
                      variant="h6"
                      fontWeight={700}
                    >
                      {item.title}
                    </Typography>


                    {/* DESCRIPTION */}

                    {item.description && (
                      <Typography
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {item.description}
                      </Typography>
                    )}


                    {/* DATE */}

                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mt: 1.5 }}
                    >

                      <AccessTimeIcon
                        fontSize="small"
                        color="action"
                      />

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {new Date(
                          item.date
                        ).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </Typography>

                    </Stack>

                  </Box>


                  {/* ACTIONS */}

                  {status !== "completed" && (
                    <Stack
                      direction="row"
                      alignItems="flex-start"
                    >

                      <IconButton
                        color="success"
                        title="Mark completed"
                        onClick={() =>
                          completeReminder(
                            item._id
                          )
                        }
                      >
                        <CheckCircleIcon />
                      </IconButton>


                      <IconButton
                        color="error"
                        title="Delete"
                        onClick={() =>
                          deleteReminder(
                            item._id
                          )
                        }
                      >
                        <DeleteIcon />
                      </IconButton>

                    </Stack>
                  )}

                </Box>

              </CardContent>
            </Card>
          );
        })}

      </Stack>


      {/* ADD REMINDER DIALOG */}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >

        <DialogTitle>
          Add Reminder
        </DialogTitle>


        <DialogContent>

          <Stack spacing={2} sx={{ pt: 1 }}>

            <TextField
              label="Title"
              fullWidth
              required
              value={v.title}
              onChange={(e) =>
                setV({
                  ...v,
                  title: e.target.value,
                })
              }
            />


            <TextField
              label="Description"
              multiline
              rows={3}
              fullWidth
              value={v.description}
              onChange={(e) =>
                setV({
                  ...v,
                  description:
                    e.target.value,
                })
              }
            />


            <TextField
              type="datetime-local"
              label="Reminder Date"
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
              value={v.date}
              onChange={(e) =>
                setV({
                  ...v,
                  date: e.target.value,
                })
              }
            />


            <TextField
              select
              label="Reminder Type"
              fullWidth
              value={v.type}
              onChange={(e) =>
                setV({
                  ...v,
                  type: e.target.value,
                })
              }
            >

              <MenuItem value="rent">
                Rent
              </MenuItem>

              <MenuItem value="agreement">
                Agreement
              </MenuItem>

              <MenuItem value="security">
                Security Deposit
              </MenuItem>

              <MenuItem value="electricity">
                Electricity
              </MenuItem>

              <MenuItem value="custom">
                Custom
              </MenuItem>

            </TextField>

          </Stack>

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
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Reminder"}
          </Button>

        </DialogActions>

      </Dialog>

    </Box>
  );
}