'use client';

import { Container, Paper, Group } from '@mantine/core';
import { SignOutButton } from "@/app/components/sign-out-button";
import classes from './Dashboard.module.css';

export default function DashboardView({ user }: { user?: { name?: string | null, email?: string | null } }) {
    return (
        <div className={classes.container}>
            <Container size="md">
                <Paper className={classes.paper}>
                    <h1 className={classes.title}>Dashboard</h1>
                    <p className={classes.greeting}>
                        Welcome back, <span className={classes.highlight}>{user?.name || user?.email}</span>! 👋
                    </p>
                    <Group>
                        <SignOutButton />
                    </Group>
                </Paper>
            </Container>
        </div>
    );
}
