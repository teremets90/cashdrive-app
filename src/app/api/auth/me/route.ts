import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  // @ts-expect-error Next Request typing in app router
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ user: null }, { status: 401 });
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, phone: true, birthDate: true, photoUrl: true, registeredAt: true },
  });
  return NextResponse.json({ user });
}



