-- Миграция схемы для PostgreSQL
-- Выполните этот скрипт после настройки PostgreSQL

-- Создание enum типа
CREATE TYPE "ChallengeType" AS ENUM ('daily', 'monthly');

-- Создание таблицы пользователей
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "photoUrl" TEXT,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Создание таблицы челленджей
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL,
    "type" "ChallengeType" NOT NULL,
    "title" TEXT NOT NULL,
    "targetTrips" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- Создание таблицы прогресса
CREATE TABLE "Progress" (
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "currentTrips" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "betAmount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Progress_pkey" PRIMARY KEY ("userId", "challengeId")
);

-- Добавление внешних ключей
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Создание уникального индекса для телефона
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- Создание индексов для производительности
CREATE INDEX "Progress_userId_idx" ON "Progress"("userId");
CREATE INDEX "Progress_challengeId_idx" ON "Progress"("challengeId");
CREATE INDEX "Challenge_isActive_idx" ON "Challenge"("isActive");
CREATE INDEX "Challenge_startDate_idx" ON "Challenge"("startDate");
CREATE INDEX "Challenge_endDate_idx" ON "Challenge"("endDate");
