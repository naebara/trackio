"use client";

import { Paper, Text } from "@mantine/core";
import classes from "./StatCard.module.css";

interface StatCardProps {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning";
}

export default function StatCard({
  label,
  value,
  tone = "default",
}: StatCardProps) {
  return (
    <Paper className={classes.card} data-tone={tone} radius="xl" withBorder>
      <Text className={classes.label}>{label}</Text>
      <Text className={classes.value}>{value}</Text>
    </Paper>
  );
}
