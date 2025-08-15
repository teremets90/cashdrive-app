import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("Testing database connection...");
    
    // Простой запрос для проверки подключения
    const userCount = await prisma.user.count();
    console.log("User count:", userCount);
    
    return NextResponse.json({ 
      success: true, 
      message: "Database connection successful",
      userCount 
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
