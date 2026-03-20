'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@mantine/core';

export function SignOutButton() {
    return (
        <Button
            onClick={() => signOut({ callbackUrl: '/' })}
            variant="outline"
            color="red"
            radius="xl"
        >
            Sign Out
        </Button>
    );
}
