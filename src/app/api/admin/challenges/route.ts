import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAccess } from "@/lib/admin";

export async function GET(req: NextRequest) {
  try {
    console.log("Admin challenges API called");
    
    const admin = await checkAdminAccess(req);
    console.log("Admin check result:", admin);
    
    if (!admin) {
      console.log("Access denied - not admin");
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    console.log("Fetching challenges from database...");
    const challenges = await prisma.challenge.findMany({
      orderBy: { startDate: "desc" },
    });

    console.log("Challenges fetched successfully:", challenges.length);
    return NextResponse.json({ challenges });
  } catch {
    console.error("Error in admin challenges API");
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await checkAdminAccess(req);
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
  }

  try {
    const json = await req.json();
    const { title, type, targetTrips, startDate, endDate } = json;

    if (!title || !type || !targetTrips || !startDate || !endDate) {
      return NextResponse.json({ error: "Не все поля заполнены" }, { status: 400 });
    }

    const challenge = await prisma.challenge.create({
      data: {
        title,
        type,
        targetTrips: Number(targetTrips),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: true,
      },
    });

    return NextResponse.json({ challenge });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

