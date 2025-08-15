import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

type AdminUser = {
  id: string;
  isAdmin: boolean;
  name: string;
};

export async function checkAdminAccess(req: NextRequest): Promise<{ userId: string; user: AdminUser } | null> {
  try {
    console.log("Checking admin access...");
    
    const userId = getUserIdFromRequest(req);
    console.log("User ID from request:", userId);
    
    if (!userId) {
      console.log("No user ID found in request");
      return null;
    }

    console.log("Looking up user in database...");
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isAdmin: true, name: true },
    });

    console.log("User found:", user);

    if (!user || !user.isAdmin) {
      console.log("User not found or not admin");
      return null;
    }

    console.log("Admin access granted for user:", user.name);
    return { userId, user };
  } catch (error) {
    console.error("Error in checkAdminAccess:", error);
    return null;
  }
}

