import { NextResponse, NextRequest } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { checkAdminAccess } from "@/lib/admin";

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    const admin = await checkAdminAccess(req);
    
    return NextResponse.json({
      isAuthenticated: !!userId,
      isAdmin: !!admin,
      userId,
      adminInfo: admin ? { userId: admin.userId, name: admin.user.name } : null
    });
  } catch (error) {
    return NextResponse.json({
      error: "Ошибка проверки авторизации",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
