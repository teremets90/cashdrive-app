import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";
import { ProgressUpdateSchema } from "@/lib/validation";

export async function POST(req: Request) {
  // @ts-expect-error Next Request typing in app router
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });

  const json = await req.json();
  const parsed = ProgressUpdateSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { challengeId, addTrips } = parsed.data;
  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (!challenge) return NextResponse.json({ error: "Челлендж не найден" }, { status: 404 });

  const progress = await prisma.progress.upsert({
    where: { userId_challengeId: { userId, challengeId } },
    create: { userId, challengeId, currentTrips: addTrips, isCompleted: addTrips >= challenge.targetTrips },
    update: {
      currentTrips: { increment: addTrips },
      isCompleted: undefined,
      lastUpdated: new Date(),
    },
  });

  const updated = await prisma.progress.update({
    where: { userId_challengeId: { userId, challengeId } },
    data: {
      isCompleted: progress.currentTrips + addTrips >= challenge.targetTrips,
      lastUpdated: new Date(),
    },
  });

  return NextResponse.json({ progress: updated });
}



