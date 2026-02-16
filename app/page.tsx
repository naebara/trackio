import { auth } from "@/auth";
import { SignOutButton } from "@/app/components/sign-out-button";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-center sm:text-left">
          Welcome to your Next.js App
        </h1>

        {session?.user ? (
          <div className="space-y-4 text-center sm:text-left">
            <p className="text-xl">
              Hello, <span className="font-semibold text-indigo-600 dark:text-indigo-400">{session.user.name || session.user.email}</span>! 👋
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You are signed in as {session.user.email}
            </p>
            <div className="flex gap-4 items-center justify-center sm:justify-start">
              <SignOutButton />
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-center sm:text-left">
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Get started by signing in or creating an account.
            </p>
            <div className="flex gap-4 items-center flex-col sm:flex-row">
              <Link
                href="/login"
                className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
