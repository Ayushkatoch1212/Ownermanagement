"use client";

import { useEffect, useState } from "react";

import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";

import RefreshIcon from "@mui/icons-material/Refresh";

import { money } from "@/lib/utils";

export default function Billing() {
  const today = new Date();

  const [month, setMonth] =
    useState(
      `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}`
    );

  const [rooms, setRooms] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [selectedRoom, setSelectedRoom] =
    useState<any>(null);

  const [billDialog, setBillDialog] =
    useState(false);

  const [billValues, setBillValues] =
    useState({
      otherCharges: 0,
      lateFee: 0,
      securityDepositAmount: 0,
      dueDate: "",
      notes: "",
    });

  async function load() {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/billing?month=${month}`
      );

      const result =
        await response.json();

      setRooms(result.data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [month]);

  async function generateBill(
    room: any
  ) {
    const response = await fetch(
      "/api/billing",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          roomId: room.room._id,
          billingMonth: month,
          ...billValues,
        }),
      }
    );

    const result =
      await response.json();

    if (!response.ok) {
      alert(result.message);
      return;
    }

    setBillDialog(false);

    setBillValues({
      otherCharges: 0,
      lateFee: 0,
      securityDepositAmount: 0,
      dueDate: "",
      notes: "",
    });

    load();
  }

  function openBillDialog(room: any) {
    setSelectedRoom(room);

    setBillDialog(true);
  }

  const totalDue = rooms.reduce(
    (sum, r) =>
      sum +
      Number(
        r.bill?.totalAmount || 0
      ),
    0
  );

  const totalPaid = rooms.reduce(
    (sum, r) =>
      sum +
      Number(
        r.bill?.amountPaid || 0
      ),
    0
  );

  const totalRemaining =
    rooms.reduce(
      (sum, r) =>
        sum +
        Number(
          r.bill?.remainingAmount || 0
        ),
      0
    );

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
          >
            Smart Rent Management
          </Typography>

          <Typography color="text.secondary">
            Manage rent, electricity and
            payments at room level.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={
            <RefreshIcon />
          }
          onClick={load}
        >
          Refresh
        </Button>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr 1fr",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Card variant="outlined">
          <CardContent>
            <Typography
              color="text.secondary"
            >
              Total Due
            </Typography>

            <Typography
              variant="h5"
              fontWeight={800}
            >
              {money(totalDue)}
            </Typography>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Typography
              color="text.secondary"
            >
              Collected
            </Typography>

            <Typography
              variant="h5"
              fontWeight={800}
            >
              {money(totalPaid)}
            </Typography>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Typography
              color="text.secondary"
            >
              Remaining
            </Typography>

            <Typography
              variant="h5"
              fontWeight={800}
            >
              {money(
                totalRemaining
              )}
            </Typography>
          </CardContent>
        </Card>
      </Box>

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
                  Occupants
                </TableCell>

                <TableCell>
                  Rent
                </TableCell>

                <TableCell>
                  Electricity
                </TableCell>

                <TableCell>
                  Total
                </TableCell>

                <TableCell>
                  Paid
                </TableCell>

                <TableCell>
                  Due
                </TableCell>

                <TableCell>
                  Status
                </TableCell>

                <TableCell>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rooms.map((r) => {
                const bill =
                  r.bill;

                return (
                  <TableRow
                    key={
                      r.room._id
                    }
                  >
                    <TableCell>
                      <Typography fontWeight={700}>
                        Room{" "}
                        {
                          r.room
                            .roomNumber
                        }
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {
                          r.pg?.name
                        }
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={600}>
                        {
                          r.occupants
                            .length
                        }{" "}
                        students
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {money(
                        bill?.rentAmount ||
                          r.room
                            .monthlyRent ||
                          0
                      )}
                    </TableCell>

                    <TableCell>
                      {money(
                        bill?.electricityAmount ||
                          r.electricity
                            ?.amount ||
                          0
                      )}
                    </TableCell>

                    <TableCell>
                      {bill
                        ? money(
                            bill.totalAmount
                          )
                        : "-"}
                    </TableCell>

                    <TableCell>
                      {bill
                        ? money(
                            bill.amountPaid
                          )
                        : "-"}
                    </TableCell>

                    <TableCell>
                      {bill
                        ? money(
                            bill.remainingAmount
                          )
                        : "-"}
                    </TableCell>

                    <TableCell>
                      {bill ? (
                        <Chip
                          size="small"
                          label={
                            bill.status
                          }
                        />
                      ) : (
                        <Chip
                          size="small"
                          label="Not Generated"
                        />
                      )}
                    </TableCell>

                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() =>
                          openBillDialog(
                            r
                          )
                        }
                      >
                        {bill
                          ? "Update Bill"
                          : "Generate Bill"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}

              {!loading &&
                rooms.length ===
                  0 && (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      align="center"
                    >
                      No occupied rooms
                      found.
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={billDialog}
        onClose={() =>
          setBillDialog(false)
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {selectedRoom
            ? `Room ${selectedRoom.room.roomNumber} Bill`
            : "Generate Bill"}
        </DialogTitle>

        <DialogContent
          sx={{
            display: "grid",
            gap: 2,
            pt: 2,
          }}
        >
          {selectedRoom && (
            <>
              <Box>
                <Typography
                  color="text.secondary"
                >
                  Occupants
                </Typography>

                <Typography fontWeight={700}>
                  {selectedRoom.occupants
                    .map(
                      (s: any) =>
                        s.name
                    )
                    .join(", ")}
                </Typography>
              </Box>

              <Divider />

              <Typography>
                Room Rent:{" "}
                <b>
                  {money(
                    selectedRoom
                      .room
                      .monthlyRent
                  )}
                </b>
              </Typography>

              <Typography>
                Electricity:{" "}
                <b>
                  {money(
                    selectedRoom
                      .electricity
                      ?.amount ||
                      0
                  )}
                </b>
              </Typography>
            </>
          )}

          <TextField
            type="number"
            label="Other Charges"
            value={
              billValues.otherCharges
            }
            onChange={(e) =>
              setBillValues({
                ...billValues,
                otherCharges:
                  Number(
                    e.target.value
                  ),
              })
            }
          />

          <TextField
            type="number"
            label="Late Fee"
            value={
              billValues.lateFee
            }
            onChange={(e) =>
              setBillValues({
                ...billValues,
                lateFee:
                  Number(
                    e.target.value
                  ),
              })
            }
          />

          <TextField
            type="number"
            label="Security Deposit"
            value={
              billValues.securityDepositAmount
            }
            onChange={(e) =>
              setBillValues({
                ...billValues,
                securityDepositAmount:
                  Number(
                    e.target.value
                  ),
              })
            }
          />

          <TextField
            type="date"
            label="Due Date"
            InputLabelProps={{
              shrink: true,
            }}
            value={
              billValues.dueDate
            }
            onChange={(e) =>
              setBillValues({
                ...billValues,
                dueDate:
                  e.target.value,
              })
            }
          />

          <TextField
            label="Notes"
            multiline
            rows={3}
            value={
              billValues.notes
            }
            onChange={(e) =>
              setBillValues({
                ...billValues,
                notes:
                  e.target.value,
              })
            }
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setBillDialog(false)
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={() =>
              generateBill(
                selectedRoom
              )
            }
          >
            Generate Bill
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}