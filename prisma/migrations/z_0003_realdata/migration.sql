/*
  Migration: z_0003_realdata
  Description: realdata
  Date: 2026-04-09T11:12:35.141Z
*/

-- CreateEnum
CREATE TYPE "TopicRecurrenceType" AS ENUM ('DAILY', 'EVERY_X_DAYS', 'SELECTED_WEEKDAYS', 'WEEKLY', 'MONTHLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "TopicRecurrenceUnit" AS ENUM ('DAY', 'WEEK', 'MONTH');

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "color" TEXT NOT NULL DEFAULT '#2269c8',
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "archivedAt" TIMESTAMP(3),
    "recurrenceType" "TopicRecurrenceType" NOT NULL,
    "recurrenceInterval" INTEGER,
    "recurrenceWeekdays" INTEGER[],
    "recurrenceDayOfWeek" INTEGER,
    "recurrenceDayOfMonth" INTEGER,
    "recurrenceUnit" "TopicRecurrenceUnit",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "value" INTEGER NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Topic_userId_idx" ON "Topic"("userId");

-- CreateIndex
CREATE INDEX "Topic_userId_archivedAt_idx" ON "Topic"("userId", "archivedAt");

-- CreateIndex
CREATE INDEX "Topic_userId_startDate_idx" ON "Topic"("userId", "startDate");

-- CreateIndex
CREATE INDEX "DailyEntry_userId_idx" ON "DailyEntry"("userId");

-- CreateIndex
CREATE INDEX "DailyEntry_topicId_idx" ON "DailyEntry"("topicId");

-- CreateIndex
CREATE INDEX "DailyEntry_userId_date_idx" ON "DailyEntry"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyEntry_topicId_date_key" ON "DailyEntry"("topicId", "date");

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyEntry" ADD CONSTRAINT "DailyEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyEntry" ADD CONSTRAINT "DailyEntry_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;



/*
  ROLLBACK PLAN:
  -- Write your rollback SQL here
*/
