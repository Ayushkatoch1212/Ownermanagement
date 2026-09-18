"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";

import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email) {
      setError("Email address is missing.");
      return;
    }

    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Invalid OTP.");
        return;
      }

      setSuccess("Email verified successfully. Redirecting to login...");

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (error) {
      console.error("VERIFY OTP ERROR:", error);
      setError("Unable to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email address is missing.");
      return;
    }

    setResending(true);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Unable to resend OTP.");
        return;
      }

      setSuccess("A new OTP has been sent to your email.");
      setOtp("");
    } catch (error) {
      console.error("RESEND OTP ERROR:", error);
      setError("Unable to resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        p: 2,
        backgroundColor: "background.default",
      }}
    >
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          width: "100%",
          maxWidth: 460,
          p: {
            xs: 3,
            sm: 5,
          },
        }}
      >
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{ mb: 1 }}
        >
          Verify your email
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          We have sent a 6-digit OTP to:
        </Typography>

        <Typography
          fontWeight={700}
          sx={{
            mb: 3,
            wordBreak: "break-word",
          }}
        >
          {email || "Email not found"}
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
          >
            {success}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={verifyOtp}
          sx={{
            display: "grid",
            gap: 2,
          }}
        >
          <TextField
            label="Enter OTP"
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
            }}
            fullWidth
            autoFocus
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || otp.length !== 6}
          >
            {loading ? (
              <>
                <CircularProgress
                  size={20}
                  sx={{ mr: 1 }}
                  color="inherit"
                />
                Verifying...
              </>
            ) : (
              "Verify Email"
            )}
          </Button>
        </Box>

        <Box
          sx={{
            mt: 3,
            textAlign: "center",
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1 }}
          >
            Didn't receive the OTP?
          </Typography>

          <Button
            variant="text"
            onClick={resendOtp}
            disabled={resending}
          >
            {resending ? "Sending..." : "Resend OTP"}
          </Button>
        </Box>

        <Box
          sx={{
            mt: 2,
            textAlign: "center",
          }}
        >
          <Button
            variant="text"
            color="inherit"
            onClick={() => router.push("/login")}
          >
            Back to Login
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}