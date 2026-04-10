'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@mantine/core';

export function SignOutButton() {
    return (
        <Button
            onClick={() => signOut({ callbackUrl: '/' })}
            variant="subtle"
            color="gray"
            radius="md"
            size="xs"
        >
            Sign Out
        </Button>
    );
}
