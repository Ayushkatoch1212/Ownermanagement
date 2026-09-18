"use client";

import { Card, CardContent, Typography, Box } from "@mui/material";
import { ReactNode } from "react";
import { Animated } from "./Animated";

export default function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: ReactNode;
}) {
  return (
    <Animated>
      <Card variant="outlined">
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {title}
              </Typography>

              <Typography
                variant="h5"
                fontWeight={800}
                sx={{ mt: 0.5 }}
              >
                {value}
              </Typography>
            </Box>

            <Box
              sx={{
                p: 1.2,
                borderRadius: 2,
                bgcolor: "action.hover",
              }}
            >
              {icon}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Animated>
  );
}