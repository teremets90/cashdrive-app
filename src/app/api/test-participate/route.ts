import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    const { challengeId, betAmount } = await req.json();
    
    return NextResponse.json({
      isAuthenticated: !!userId,
      userId,
      challengeId,
      betAmount,
      message: "Тестовый запрос успешен"
    });
  } catch (error) {
    return NextResponse.json({
      error: "Ошибка тестового запроса",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
