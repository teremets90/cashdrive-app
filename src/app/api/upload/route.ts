import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: Request) {
  // @ts-expect-error Next Request typing in app router
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });

  const formData = await (req as any).formData?.() ?? null;
  if (!formData) return NextResponse.json({ error: "Ожидалась форма" }, { status: 400 });
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Файл не найден" }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, fileName);
  await fs.writeFile(filePath, bytes);

  const url = `/uploads/${fileName}`;
  return NextResponse.json({ url });
}



