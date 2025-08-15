import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    console.log("Participate API called");
    
    const userId = getUserIdFromRequest(req);
    console.log("User ID:", userId);
    
    if (!userId) {
      console.log("User not authenticated");
      return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
    }

    const params = await context.params;
    const challengeId = params.id;
    console.log("Challenge ID:", challengeId);
    
    const body = await req.json();
    const { betAmount } = body;
    console.log("Bet amount:", betAmount);

    // Валидация ставки
    if (!betAmount || betAmount < 50) {
      console.log("Invalid bet amount (too low):", betAmount);
      return NextResponse.json({ error: "Минимальная ставка 50 рублей" }, { status: 400 });
    }

    if (betAmount % 25 !== 0) {
      console.log("Invalid bet amount (not multiple of 25):", betAmount);
      return NextResponse.json({ error: "Ставка должна быть кратна 25 рублям" }, { status: 400 });
    }

    // Проверяем, что челлендж существует и активен
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    console.log("Challenge found:", challenge ? challenge.title : "not found");

    if (!challenge) {
      return NextResponse.json({ error: "Челлендж не найден" }, { status: 404 });
    }

    if (!challenge.isActive) {
      console.log("Challenge not active");
      return NextResponse.json({ error: "Челлендж неактивен" }, { status: 400 });
    }

    const now = new Date();
    if (now < challenge.startDate || now > challenge.endDate) {
      console.log("Challenge not in active period");
      return NextResponse.json({ error: "Челлендж не в активном периоде" }, { status: 400 });
    }

    // Проверяем, не участвует ли уже пользователь
    const existingProgress = await prisma.progress.findUnique({
      where: {
        userId_challengeId: {
          userId,
          challengeId,
        },
      },
    });

    console.log("Existing progress:", existingProgress ? "found" : "not found");

    if (existingProgress) {
      return NextResponse.json({ error: "Вы уже участвуете в этом челлендже" }, { status: 400 });
    }

    // Создаем запись о прогрессе с ставкой
    const progress = await prisma.progress.create({
      data: {
        userId,
        challengeId,
        currentTrips: 0,
        isCompleted: false,
        betAmount,
      },
    });

    console.log("Progress created successfully");

    return NextResponse.json({ 
      success: true, 
      message: `Вы успешно присоединились к челленджу со ставкой ${betAmount} рублей!`,
      progress 
    });
  } catch (error) {
    console.error("Error participating in challenge:", error);
    return NextResponse.json({ 
      error: "Ошибка сервера",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
