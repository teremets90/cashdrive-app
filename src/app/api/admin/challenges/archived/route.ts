import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAccess } from "@/lib/admin";

export async function GET(req: NextRequest) {
  const admin = await checkAdminAccess(req);
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const searchTerm = searchParams.get('search');

    // Строим условия фильтрации
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      isActive: false // Временно используем isActive вместо isArchived
    };

    if (startDate && endDate) {
      where.OR = [
        {
          startDate: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        },
        {
          endDate: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        }
      ];
    } else if (startDate) {
      where.startDate = {
        gte: new Date(startDate)
      };
    } else if (endDate) {
      where.endDate = {
        lte: new Date(endDate)
      };
    }

    if (searchTerm) {
      where.title = {
        contains: searchTerm,
        mode: 'insensitive'
      };
    }

    const challenges = await prisma.challenge.findMany({
      where,
      orderBy: { endDate: "desc" },
    });

    return NextResponse.json({ 
      challenges,
      total: challenges.length
    });
  } catch (error) {
    console.error("Error fetching archived challenges:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
