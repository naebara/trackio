"use client";

import {
  AppShell,
  Box,
  Burger,
  Group,
  NavLink,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import {
  Activity,
  BarChart3,
  Calendar,
  CheckSquare,
  ListTodo,
} from "lucide-react";
import { SignOutButton } from "@/app/components/sign-out-button";
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
  const isMobile = useMediaQuery("(max-width: 48em)");

  return (
    <>
      <AppShell
        header={{ height: 48 }}
        navbar={
          isMobile
            ? undefined
            : { width: 220, breakpoint: "sm", collapsed: { mobile: true } }
        }
        padding="md"
        className={classes.appShell}
      >
        <AppShell.Header className={classes.header}>
          <Group h="100%" px="md" justify="space-between">
            <Group gap="xs">
              <ThemeIcon size="sm" radius="md" variant="filled" color="blue">
                <Activity size={14} />
              </ThemeIcon>
              <Text size="md" fw={700} className={classes.brandText}>
                Trackio
              </Text>
            </Group>
            <Group gap="sm">
              <Text size="xs" c="dimmed" fw={500} visibleFrom="sm">
                {userLabel}
              </Text>
              <SignOutButton />
            </Group>
          </Group>
        </AppShell.Header>

        {!isMobile && (
          <AppShell.Navbar p="sm" className={classes.navbar}>
            <Stack gap={2}>
              {navItems.map((item) => (
                <NavLink
                  key={item.value}
                  active={item.value === activeTab}
                  label={item.label}
                  leftSection={
                    <item.icon
                      size={16}
                      strokeWidth={item.value === activeTab ? 2.5 : 1.8}
                    />
                  }
                  onClick={() => onTabChange(item.value)}
                  className={classes.navLink}
                  color="blue"
                  variant="light"
                  fw={item.value === activeTab ? 600 : 400}
                />
              ))}
            </Stack>
          </AppShell.Navbar>
        )}

        <AppShell.Main className={classes.mainContent}>
          <Box px={{ base: 0, sm: "xs" }}>{children}</Box>
        </AppShell.Main>
      </AppShell>

      {isMobile && (
        <nav className={classes.bottomNav}>
          {navItems.map((item) => (
            <button
              key={item.value}
              type="button"
              className={classes.bottomNavButton}
              data-active={item.value === activeTab}
              onClick={() => onTabChange(item.value)}
            >
              <item.icon size={20} strokeWidth={item.value === activeTab ? 2.5 : 1.8} />
              <span className={classes.bottomNavLabel}>{item.label}</span>
            </button>
          ))}
        </nav>
      )}
    </>
  );
}
