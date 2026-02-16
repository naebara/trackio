/*
  Migration: z_0001_init
  Description: Initial User table setup with PostgreSQL extensions
  Date: 2026-02-16
*/

-- CreateExtensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

/*
  ROLLBACK PLAN:
  DROP TABLE "User";
  DROP EXTENSION "unaccent";
  DROP EXTENSION "pg_trgm";
*/
