import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LoginSchema } from "@/lib/validation";
import { verifyPassword } from "@/lib/hash";
import { signAuthToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    console.log("=== LOGIN ATTEMPT START ===");
    const json = await req.json();
    console.log("Request body:", json);
    
    const parsed = LoginSchema.safeParse(json);
    if (!parsed.success) {
      console.log("Validation failed:", parsed.error.flatten());
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { phone, password } = parsed.data;
    console.log("Phone:", phone, "password length:", password.length);

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      console.log("User not found");
      return NextResponse.json({ error: "Неверные данные" }, { status: 401 });
    }
    console.log("User found:", user.id);

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      console.log("Password verification failed");
      return NextResponse.json({ error: "Неверные данные" }, { status: 401 });
    }
    console.log("Password verified successfully");

    const token = signAuthToken({ userId: user.id });
    console.log("Token generated:", token.substring(0, 20) + "...");

    const res = NextResponse.json({ ok: true });
    console.log("Setting cookie...");
    res.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // В development режиме false
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    console.log("Cookie set successfully");
    console.log("=== LOGIN ATTEMPT END ===");
    return res;
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}


