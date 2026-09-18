"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Link as MuiLink,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { Animated } from "@/components/Animated";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError("Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Something went wrong. Please try again.");
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
        bgcolor: "background.default",
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
            maxWidth: 430,
          }}
        >
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ mb: 1 }}
          >
            Welcome back
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Sign in to manage your PGs.
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
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              autoComplete="email"
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              autoComplete="current-password"
            />

            <Button
              variant="contained"
              size="large"
              type="submit"
              disabled={loading}
              fullWidth
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </Box>
          <Box
  sx={{
    display: "flex",
    justifyContent: "flex-end",
  }}
>
  <Link
    href="/forgot-password"
    style={{
      textDecoration: "none",
      fontSize: "14px",
    }}
  >
    Forgot Password?
  </Link>
</Box>

          <Typography
            sx={{ mt: 3 }}
            variant="body2"
            textAlign="center"
          >
            New admin?{" "}
            <MuiLink href="/signup">
              Create account
            </MuiLink>
          </Typography>
        </Paper>
      </Animated>
    </Box>
  );
}