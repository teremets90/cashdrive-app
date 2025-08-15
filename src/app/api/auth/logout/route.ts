import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  
  // Удаляем cookie с токеном, устанавливая его в прошлое
  // Используем те же параметры, что и при установке cookie
  response.cookies.set("token", "", {
    expires: new Date(0),
    path: "/",
    httpOnly: true,
    secure: false, // В development режиме false
    sameSite: "lax",
    maxAge: 0
  });
  
  return response;
}
