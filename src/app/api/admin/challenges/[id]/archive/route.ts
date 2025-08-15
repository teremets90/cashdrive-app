import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAccess } from "@/lib/admin";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    console.log("Archive API called");
    
    const admin = await checkAdminAccess(req);
    console.log("Admin check result:", admin);
    
    if (!admin) {
      console.log("Access denied - not admin");
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const params = await context.params;
    const challengeId = params.id;
    console.log("Archiving challenge:", challengeId);
    
    const json = await req.json();
    const { isArchived } = json;
    console.log("Archive status:", isArchived);

    const challenge = await prisma.challenge.update({
      where: { id: challengeId },
      data: { 
        isActive: isArchived ? false : true // При архивировании деактивируем
      },
    });

    console.log("Challenge updated successfully:", challenge.id);

    return NextResponse.json({ 
      challenge,
      message: isArchived ? "Челлендж отправлен в архив" : "Челлендж восстановлен из архива"
    });
  } catch (error) {
    console.error("Error archiving challenge:", error);
    return NextResponse.json({ 
      error: "Ошибка сервера",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
