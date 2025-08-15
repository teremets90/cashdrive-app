import { PrismaClient } from "../generated/prisma";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma: PrismaClient = globalThis.prismaGlobal ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;



