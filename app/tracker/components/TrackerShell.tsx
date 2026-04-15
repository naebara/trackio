"use client";

import { signOut } from "next-auth/react";
import { Activity, BarChart3, Calendar, CheckSquare, ListTodo, LogOut } from "lucide-react";
import classes from "../TrackerView.module.css";
import { trackerText } from "../constants/i18n";

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

function Navigation({
  activeTab,
  onTabChange,
}: Pick<TrackerShellProps, "activeTab" | "onTabChange">) {
  return (
    <nav className={classes.nav}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = item.value === activeTab;

        return (
          <button
            key={item.value}
            type="button"
            className={`${classes.link} ${active ? classes.active : ""}`}
            onClick={() => onTabChange(item.value)}
          >
            <span className={classes.iconWrap}>
              <Icon size={18} />
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default function TrackerShell({
  activeTab,
  children,
  onTabChange,
  userLabel,
}: TrackerShellProps) {
  return (
    <div className={classes.pageShell}>
      <aside className={classes.sidebar}>
        <div className={classes.brand}>
          <div className={classes.brandGlow} />
          <span className={classes.brandBadge}>Tr</span>
          <div className={classes.brandInfo}>
            <p>Trackio</p>
            <small>Tracker Module</small>
          </div>
        </div>

        <Navigation activeTab={activeTab} onTabChange={onTabChange} />

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className={`${classes.link} ${classes.logoutButton}`}
          title="Sign out"
        >
          <span className={classes.iconWrap}>
            <LogOut size={18} />
          </span>
          <span>Sign out</span>
        </button>

        <div className={classes.footer}>
          <p>{userLabel}</p>
          <small>Sidebar Menu</small>
        </div>
      </aside>

      <div className={classes.contentColumn}>
        <header className={classes.mobileHeader}>
          <div className={classes.mobileBrand}>
            <span className={classes.mobileBrandBadge}>
              <Activity size={16} />
            </span>
            <div className={classes.mobileBrandInfo}>
              <p>Trackio</p>
              <small>{userLabel}</small>
            </div>
          </div>
          <button
            type="button"
            className={classes.mobileLogout}
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut size={18} />
          </button>
        </header>

        <main className={classes.mainContent}>{children}</main>
      </div>

      <nav className={classes.bottomNav} aria-label="Tracker navigation">
        <div className={classes.navInner}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.value === activeTab;

            return (
              <button
                key={item.value}
                type="button"
                className={`${classes.navItem} ${active ? classes.active : ""}`}
                onClick={() => onTabChange(item.value)}
              >
                <span className={classes.iconWrap}>
                  <Icon size={18} />
                </span>
                <span className={classes.label}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
