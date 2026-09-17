"use client";

import { ReactNode, useMemo, useState } from "react";
import { SessionProvider } from "next-auth/react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";

import { AppContext } from "@/components/theme-context";

export default function Providers({
  children,
}: {
  children: ReactNode;
}) {
  const [mode, setMode] = useState<"light" | "dark">("light");

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,

          primary: {
            main: "#4f46e5",
          },

          background: {
            default: mode === "dark" ? "#0b1020" : "#f6f7fb",
            paper: mode === "dark" ? "#11182a" : "#ffffff",
          },
        },

        shape: {
          borderRadius: 10,
        },

        typography: {
          fontFamily: "Inter, Arial, sans-serif",
        },
      }),
    [mode]
  );

  return (
    <SessionProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <AppContext.Provider
          value={{
            mode,
            setMode,
          }}
        >
          {children}
        </AppContext.Provider>
      </ThemeProvider>
    </SessionProvider>
  );
}