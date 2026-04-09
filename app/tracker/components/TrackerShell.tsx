"use client";

import {
  AppShell,
  Box,
  Burger,
  Container,
  Group,
  NavLink,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  Activity,
  BarChart3,
  Calendar,
  CheckSquare,
  Grid,
  ListTodo,
} from "lucide-react";
import { trackerText } from "../constants/i18n";
import classes from "../TrackerView.module.css";

interface TrackerShellProps {
  activeTab: string;
  children: React.ReactNode;
  onTabChange: (value: string) => void;
  userLabel: string;
}

const navItems = [
  { value: "today", label: trackerText.todayTab, icon: CheckSquare },
  { value: "calendar", label: trackerText.calendarTab, icon: Calendar },
  { value: "matrix", label: trackerText.matrixTab, icon: Grid },
  { value: "topics", label: trackerText.topicsTab, icon: ListTodo },
  { value: "insights", label: trackerText.insightsTab, icon: BarChart3 },
];

export default function TrackerShell({
  activeTab,
  children,
  onTabChange,
  userLabel,
}: TrackerShellProps) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 260, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
      className={classes.appShell}
    >
      <AppShell.Header className={classes.header}>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Group gap="xs">
              <ThemeIcon
                size="md"
                radius="xl"
                variant="gradient"
                gradient={{ from: "indigo", to: "cyan" }}
              >
                <Activity size={18} />
              </ThemeIcon>
              <Text size="lg" fw={800} className={classes.brandText}>
                Trackio
              </Text>
            </Group>
          </Group>
          <Text size="sm" c="dimmed" fw={500} visibleFrom="xs">
            {userLabel}
          </Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" className={classes.navbar}>
        <Box mb="xl" px="xs">
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={1}>
            Routine
          </Text>
        </Box>
        <Stack gap="xs">
          {navItems.map((item) => (
            <NavLink
              key={item.value}
              active={item.value === activeTab}
              label={item.label}
              leftSection={<item.icon size={18} strokeWidth={item.value === activeTab ? 2.5 : 2} />}
              onClick={() => {
                onTabChange(item.value);
                if (opened) toggle();
              }}
              className={classes.navLink}
              color="indigo"
              variant="filled"
              fw={item.value === activeTab ? 600 : 500}
            />
          ))}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main className={classes.mainContent}>
        <Container size="xl" p={0}>
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
