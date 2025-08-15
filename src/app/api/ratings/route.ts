import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("Ratings API called");
    
    // Получаем всех пользователей с их прогрессом по активным челленджам
    const now = new Date();
    console.log("Current time:", now);
    
    // Сначала получаем активные челленджи
    const activeChallenges = await prisma.challenge.findMany({
      where: { 
        startDate: { lte: now }, 
        endDate: { gte: now },
        isActive: true 
      },
      select: { id: true, title: true, type: true, targetTrips: true }
    });

    console.log("Active challenges found:", activeChallenges.length);

    if (activeChallenges.length === 0) {
      console.log("No active challenges, returning empty ratings");
      return NextResponse.json({ 
        ratings: [],
        message: "Нет активных челленджей"
      });
    }

    // Получаем всех пользователей с их прогрессом
    const usersWithProgress = await prisma.user.findMany({
      where: {
        progresses: {
          some: {
            challengeId: { in: activeChallenges.map(c => c.id) }
          }
        }
      },
      select: {
        id: true,
        name: true,
        phone: true,
        registeredAt: true,
        progresses: {
          where: {
            challengeId: { in: activeChallenges.map(c => c.id) }
          },
          select: {
            challengeId: true,
            currentTrips: true,
            isCompleted: true,
            lastUpdated: true,
            betAmount: true // Добавляем betAmount в выборку
          }
        }
      },
      orderBy: { name: "asc" }
    });

    // Вычисляем рейтинги
    const ratings = usersWithProgress.map(user => {
      let totalTrips = 0;
      let completedChallenges = 0;
      let totalProgress = 0;
      let averageProgress = 0;

      // Считаем общую статистику по всем активным челленджам
      activeChallenges.forEach(challenge => {
        const progress = user.progresses.find(p => p.challengeId === challenge.id);
        const currentTrips = progress?.currentTrips || 0;
        const isCompleted = progress?.isCompleted || currentTrips >= challenge.targetTrips;
        
        totalTrips += currentTrips;
        if (isCompleted) completedChallenges++;
        
        const challengeProgress = Math.min(1, currentTrips / challenge.targetTrips);
        totalProgress += challengeProgress;
      });

      averageProgress = activeChallenges.length > 0 ? totalProgress / activeChallenges.length : 0;

      return {
        id: user.id,
        name: user.name,
        phone: user.phone,
        registeredAt: user.registeredAt,
        totalTrips,
        completedChallenges,
        activeChallenges: activeChallenges.length,
        averageProgress: Math.round(averageProgress * 100),
        totalBetAmount: user.progresses.reduce((sum, p) => sum + p.betAmount, 0), // Общая сумма ставок
        score: Math.round((completedChallenges * 100) + (averageProgress * 50) + totalTrips + (user.progresses.reduce((sum, p) => sum + p.betAmount, 0) / 10)), // Включаем ставки в очки
        challenges: activeChallenges.map(challenge => {
          const progress = user.progresses.find(p => p.challengeId === challenge.id);
          const currentTrips = progress?.currentTrips || 0;
          const isCompleted = progress?.isCompleted || currentTrips >= challenge.targetTrips;
          
          return {
            id: challenge.id,
            title: challenge.title,
            type: challenge.type,
            targetTrips: challenge.targetTrips,
            currentTrips,
            isCompleted,
            betAmount: progress?.betAmount || 0,
            progress: Math.round(Math.min(100, (currentTrips / challenge.targetTrips) * 100))
          };
        })
      };
    });

    // Сортируем по очкам (убывание)
    ratings.sort((a, b) => b.score - a.score);

    // Добавляем позиции
    const ratingsWithPositions = ratings.map((rating, index) => ({
      ...rating,
      position: index + 1
    }));

    return NextResponse.json({ 
      ratings: ratingsWithPositions,
      totalParticipants: ratings.length,
      activeChallenges: activeChallenges.length
    });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    return NextResponse.json({ 
      error: "Ошибка загрузки рейтингов" 
    }, { status: 500 });
  }
}
