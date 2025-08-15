import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";
import { ProfileUpdateSchema } from "@/lib/validation";

export async function GET(req: Request) {
  // @ts-expect-error Next Request typing in app router
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
      id: true, 
      name: true, 
      phone: true, 
      birthDate: true, 
      photoUrl: true, 
      registeredAt: true,
      isAdmin: true 
    },
  });
  return NextResponse.json({ user });
}

export async function PUT(req: Request) {
  // @ts-expect-error Next Request typing in app router
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
  
  try {
    const json = await req.json();
    console.log("Profile update request data:", json);
    
    const parsed = ProfileUpdateSchema.safeParse(json);
    if (!parsed.success) {
      console.error("Profile validation failed:", parsed.error.flatten());
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { name, birthDate, photoUrl } = parsed.data;
    console.log("Profile update validated data:", { name, birthDate, photoUrl });
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name ? { name } : {}),
        ...(birthDate ? { birthDate: new Date(birthDate) } : {}),
        ...(photoUrl ? { photoUrl } : {}),
      },
      select: { 
        id: true, 
        name: true, 
        phone: true, 
        birthDate: true, 
        photoUrl: true, 
        registeredAt: true,
        isAdmin: true 
      },
    });
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}



