import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  // @ts-expect-error Next Request typing in app router
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });

  const now = new Date();
  
  // Получаем все активные челленджи
  const challenges = await prisma.challenge.findMany({
    where: { 
      startDate: { lte: now }, 
      endDate: { gte: now },
      isActive: true 
    },
    orderBy: { startDate: "asc" },
  });

  // Получаем прогресс пользователя по всем челленджам
  const progresses = await prisma.progress.findMany({ 
    where: { userId } 
  });
  const progressMap = new Map(progresses.map((p) => [p.challengeId, p]));

  const result = challenges.map((c) => {
    const p = progressMap.get(c.id);
    const currentTrips = p?.currentTrips ?? 0;
    const isCompleted = p?.isCompleted ?? currentTrips >= c.targetTrips;
    const ratio = Math.min(1, currentTrips / c.targetTrips);
    const isParticipating = !!p; // Пользователь участвует, если есть запись прогресса
    const betAmount = p?.betAmount ?? 0; // Ставка пользователя
    return { ...c, currentTrips, isCompleted, ratio, isParticipating, betAmount };
  });

  return NextResponse.json({ challenges: result });
}



