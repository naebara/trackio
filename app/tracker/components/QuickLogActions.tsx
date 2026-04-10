"use client";

import { Button, Group } from "@mantine/core";
import classes from "./QuickLogActions.module.css";

interface QuickLogActionsProps {
  onYes: () => void;
  onNo: () => void;
  onCustom: () => void;
}

export default function QuickLogActions({
  onYes,
  onNo,
  onCustom,
}: QuickLogActionsProps) {
  return (
    <Group className={classes.actions} gap="xs" wrap="nowrap">
      <Button className={classes.yes} radius="md" size="xs" onClick={onYes}>
        Yes
      </Button>
      <Button className={classes.no} radius="md" size="xs" variant="light" onClick={onNo}>
        No
      </Button>
      <Button
        className={classes.custom}
        radius="md"
        size="xs"
        variant="default"
        onClick={onCustom}
      >
        Custom
      </Button>
    </Group>
  );
}
