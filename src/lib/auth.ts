import { NextRequest } from "next/server";

const DEFAULT_SECRET = "dev_super_secret_change_me_please";

export type AuthPayload = { userId: string };

// Простая функция для создания JWT-подобного токена (для Edge Runtime)
export function signAuthToken(payload: AuthPayload, expiresIn: string = "7d"): string {
  const secret = process.env.JWT_SECRET || DEFAULT_SECRET;
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (expiresIn === "7d" ? 7 * 24 * 60 * 60 : 60 * 60); // 7 дней или 1 час
  
  const data = {
    ...payload,
    iat: now,
    exp: exp
  };
  
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(data));
  
  // Простая подпись (в продакшене используйте более безопасные методы)
  const signature = btoa(secret + encodedHeader + encodedPayload);
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Простая функция для верификации токена (для Edge Runtime)
export function verifyAuthToken(token: string): AuthPayload | null {
  try {
    const secret = process.env.JWT_SECRET || DEFAULT_SECRET;
    console.log("Verifying token with secret:", secret ? "set" : "not set");
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [encodedHeader, encodedPayload, signature] = parts;
    
    // Проверяем подпись
    const expectedSignature = btoa(secret + encodedHeader + encodedPayload);
    if (signature !== expectedSignature) return null;
    
    // Декодируем payload
    const payload = JSON.parse(atob(encodedPayload));
    
    // Проверяем срок действия
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;
    
    console.log("Token verification result:", payload);
    return { userId: payload.userId };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  return req.cookies.get("token")?.value ?? null;
}

export function getUserIdFromRequest(req: NextRequest): string | null {
  try {
    console.log("Getting user ID from request...");
    
    const token = getTokenFromRequest(req);
    console.log("Token found:", token ? "yes" : "no");
    
    if (!token) {
      console.log("No token in request");
      return null;
    }
    
    console.log("Verifying token...");
    const payload = verifyAuthToken(token);
    console.log("Token verification result:", payload);
    
    return payload?.userId ?? null;
  } catch (error) {
    console.error("Error in getUserIdFromRequest:", error);
    return null;
  }
}


