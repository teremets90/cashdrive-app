import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAccess } from "@/lib/admin";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await checkAdminAccess(req);
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
  }

  try {
    const params = await context.params;
    const json = await req.json();
    const { isActive } = json;

    const challenge = await prisma.challenge.update({
      where: { id: params.id },
      data: { isActive },
    });

    return NextResponse.json({ challenge });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

