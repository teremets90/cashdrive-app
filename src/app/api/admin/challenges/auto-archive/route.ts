import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAccess } from "@/lib/admin";

export async function POST(req: NextRequest) {
  const admin = await checkAdminAccess(req);
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
  }

  try {
    const now = new Date();
    
    // Находим все завершенные челленджи, которые еще не в архиве
    const completedChallenges = await prisma.challenge.findMany({
      where: {
        endDate: { lt: now },
        isActive: true // Временно используем isActive вместо isArchived
      }
    });

    if (completedChallenges.length === 0) {
      return NextResponse.json({ 
        message: "Нет завершенных челленджей для архивирования",
        archivedCount: 0
      });
    }

    // Архивируем все завершенные челленджи
    const updateResult = await prisma.challenge.updateMany({
      where: {
        endDate: { lt: now },
        isActive: true // Временно используем isActive вместо isArchived
      },
      data: {
        isActive: false // Временно используем isActive вместо isArchived
      }
    });

    return NextResponse.json({ 
      message: `Автоматически архивировано ${updateResult.count} челленджей`,
      archivedCount: updateResult.count,
      challenges: completedChallenges.map(c => ({ id: c.id, title: c.title }))
    });
  } catch (error) {
    console.error("Error auto-archiving challenges:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
