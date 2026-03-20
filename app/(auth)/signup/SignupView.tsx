'use client';

import { signup } from '@/app/actions/auth';
import { useActionState } from 'react';
import Link from 'next/link';
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Anchor,
  Box,
} from '@mantine/core';
import classes from './Signup.module.css';

export default function SignupView() {
    const [errorMessage, formAction, isPending] = useActionState(signup, undefined);

    return (
        <div className={classes.wrapper}>
            <Paper className={classes.paper}>
                <Box mb={24}>
                    <h2 className={classes.title}>Sign up</h2>
                    <p className={classes.subtitle}>
                        Already have an account?{' '}
                        <Anchor component={Link} href="/login" className={classes.link}>
                            Log in
                        </Anchor>
                    </p>
                </Box>

                <form action={formAction}>
                    <Box mb={20}>
                        <TextInput
                            id="name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            required
                            label="Full Name"
                            size="md"
                            classNames={{ label: classes.label, input: classes.input }}
                            withAsterisk={false}
                        />
                    </Box>

                    <Box mb={20}>
                        <TextInput
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            label="Email address"
                            size="md"
                            classNames={{ label: classes.label, input: classes.input }}
                            withAsterisk={false}
                        />
                    </Box>

                    <Box mb={32}>
                        <PasswordInput
                            id="password"
                            name="password"
                            autoComplete="new-password"
                            required
                            label="Password"
                            size="md"
                            classNames={{ label: classes.label, innerInput: classes.input }}
                            withAsterisk={false}
                        />
                    </Box>

                    <Button
                        type="submit"
                        fullWidth
                        loading={isPending}
                        className={classes.submitButton}
                    >
                        Sign up
                    </Button>

                    {errorMessage && (
                        <div className={classes.errorText} aria-live="polite">
                            {errorMessage}
                        </div>
                    )}

                    {!errorMessage && isPending === false && errorMessage === undefined && (
                        <div className={classes.successText} aria-live="polite">
                            Account created!{' '}
                            <Anchor component={Link} href="/login" className={classes.link} fw={600}>
                                Log in here
                            </Anchor>
                        </div>
                    )}
                </form>
            </Paper>
        </div>
    );
}
