import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAccess } from "@/lib/admin";

export async function GET(req: NextRequest) {
  try {
    console.log("Admin users API called");
    
    const admin = await checkAdminAccess(req);
    console.log("Admin check result:", admin);
    
    if (!admin) {
      console.log("Access denied - not admin");
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    console.log("Fetching users from database...");
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        isAdmin: true,
        registeredAt: true,
      },
      orderBy: { registeredAt: "desc" },
    });

    console.log("Users fetched successfully:", users.length);
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error in admin users API:", error);
    return NextResponse.json({ 
      error: "Ошибка сервера", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

