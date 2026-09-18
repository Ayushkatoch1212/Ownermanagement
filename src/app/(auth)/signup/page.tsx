"use client";

import { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Link as MuiLink,
} from "@mui/material";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Animated } from "@/components/Animated";

export default function Signup() {
  const [v, setV] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const router = useRouter();

  const change =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setV({
        ...v,
        [k]: e.target.value,
      });
    };

  async function submit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");

    // -----------------------------
    // Client-side validation
    // -----------------------------

    if (
      !v.name.trim() ||
      !v.email.trim() ||
      !v.phone.trim() ||
      !v.password ||
      !v.confirmPassword
    ) {
      setError(
        "Please fill in all fields"
      );

      return;
    }

    if (v.password.length < 8) {
      setError(
        "Password must be at least 8 characters"
      );

      return;
    }

    if (
      v.password !==
      v.confirmPassword
    ) {
      setError(
        "Passwords do not match"
      );

      return;
    }

    setLoading(true);

    try {
      const r = await fetch(
        "/api/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(v),
        }
      );

      const d = await r.json();

      if (!r.ok || !d.success) {
        setError(
          d.message ||
            "Unable to create account"
        );

        return;
      }

      // -----------------------------
      // Registration successful
      // Go to OTP verification
      // -----------------------------

      router.push(
        `/verify-email?email=${encodeURIComponent(
          v.email.trim().toLowerCase()
        )}`
      );
    } catch (error: any) {
      console.error(
        "SIGNUP ERROR:",
        error
      );

      setError(
        "Unable to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        p: 2,
      }}
    >
      <Animated>
        <Paper
          variant="outlined"
          sx={{
            p: {
              xs: 3,
              sm: 5,
            },
            width: "100%",
            maxWidth: 480,
          }}
        >
          <Typography
            variant="h4"
            fontWeight={800}
          >
            Create admin account
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Set up your PG Manager account.
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
            >
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={submit}
            sx={{
              display: "grid",
              gap: 2,
            }}
          >
            <TextField
              label="Full name"
              value={v.name}
              onChange={change("name")}
              required
              fullWidth
            />

            <TextField
              label="Email"
              type="email"
              value={v.email}
              onChange={change("email")}
              required
              fullWidth
            />

            <TextField
              label="Phone"
              type="tel"
              value={v.phone}
              onChange={change("phone")}
              required
              fullWidth
            />

            <TextField
              label="Password"
              type="password"
              value={v.password}
              onChange={change("password")}
              required
              fullWidth
              helperText="Minimum 8 characters"
            />

            <TextField
              label="Confirm password"
              type="password"
              value={v.confirmPassword}
              onChange={change(
                "confirmPassword"
              )}
              required
              fullWidth
            />

            <Button
              variant="contained"
              size="large"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Creating..."
                : "Create account"}
            </Button>
          </Box>

          <Typography
            sx={{ mt: 3 }}
            variant="body2"
          >
            Already registered?{" "}
            <MuiLink
              component={Link}
              href="/login"
            >
              Sign in
            </MuiLink>
          </Typography>
        </Paper>
      </Animated>
    </Box>
  );
}