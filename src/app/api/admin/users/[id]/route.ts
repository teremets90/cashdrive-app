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
    const { name, phone, isAdmin, isBlocked } = json;

    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(isAdmin !== undefined && { isAdmin }),
        ...(isBlocked !== undefined && { isBlocked }),
      },
      select: {
        id: true,
        name: true,
        phone: true,
        isAdmin: true,
        isBlocked: true,
        registeredAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await checkAdminAccess(req);
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
  }

  try {
    const params = await context.params;
    
    // Проверяем, что не удаляем самих себя
    if (params.id === admin.userId) {
      return NextResponse.json({ error: "Нельзя удалить свой аккаунт" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
