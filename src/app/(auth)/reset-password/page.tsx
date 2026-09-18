"use client";

import { FormEvent, Suspense, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import LockResetIcon from "@mui/icons-material/LockReset";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const emailFromUrl = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromUrl);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email.");
      setLoading(false);
      return;
    }

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to reset password"
        );
      }

      setSuccess(
        "Password reset successfully. Redirecting to login..."
      );

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error: any) {
      console.error("RESET PASSWORD ERROR:", error);

      setError(
        error?.message || "Unable to reset password"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        backgroundColor: "background.default",
      }}
    >
      <Card
        variant="outlined"
        sx={{
          width: "100%",
          maxWidth: 430,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            {/* Header */}
            <Box textAlign="center">
              <LockResetIcon
                sx={{
                  fontSize: 50,
                  color: "primary.main",
                  mb: 1,
                }}
              />

              <Typography
                variant="h5"
                fontWeight={700}
              >
                Reset Password
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Enter the OTP sent to your email and
                create a new password.
              </Typography>
            </Box>

            {/* Error */}
            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            {/* Success */}
            {success && (
              <Alert severity="success">
                {success}
              </Alert>
            )}

            {/* Form */}
            <Box
              component="form"
              onSubmit={handleSubmit}
            >
              <Stack spacing={2}>
                {/* Email */}
                <TextField
                  fullWidth
                  required
                  type="email"
                  label="Email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  autoComplete="email"
                />

                {/* OTP */}
                <TextField
                  fullWidth
                  required
                  label="6-Digit OTP"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6);

                    setOtp(value);
                  }}
                  placeholder="Enter 6-digit OTP"
                  inputProps={{
                    maxLength: 6,
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                  }}
                />

                {/* New Password */}
                <TextField
                  fullWidth
                  required
                  type="password"
                  label="New Password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  helperText="Minimum 8 characters"
                  autoComplete="new-password"
                />

                {/* Confirm Password */}
                <TextField
                  fullWidth
                  required
                  type="password"
                  label="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  autoComplete="new-password"
                />

                {/* Submit */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={
                    loading ||
                    otp.length !== 6 ||
                    !email ||
                    !password ||
                    !confirmPassword
                  }
                >
                  {loading ? (
                    <>
                      <CircularProgress
                        size={20}
                        color="inherit"
                        sx={{ mr: 1 }}
                      />
                      Updating...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </Stack>
            </Box>

            {/* Back */}
            <Button
              component={Link}
              href="/login"
              variant="text"
            >
              Back to Login
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

/**
 * Page wrapper.
 *
 * useSearchParams() is used inside ResetPasswordForm,
 * which is wrapped in Suspense to satisfy Next.js
 * prerender/build requirements.
 */
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            backgroundColor: "background.default",
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}