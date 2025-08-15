import { PrismaClient } from "../src/generated/prisma";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const now = new Date();

  // Создаем тестового админа
  const adminPasswordHash = await hash("admin123", 10);
  await prisma.user.upsert({
    where: { phone: "+79001234567" },
    update: {},
    create: {
      name: "Администратор",
      phone: "+79001234567",
      passwordHash: adminPasswordHash,
      birthDate: new Date("1990-01-01"),
      isAdmin: true,
    },
  });

  // Создаем тестового обычного пользователя
  const userPasswordHash = await hash("user123", 10);
  await prisma.user.upsert({
    where: { phone: "+79001234568" },
    update: {},
    create: {
      name: "Тестовый пользователь",
      phone: "+79001234568",
      passwordHash: userPasswordHash,
      birthDate: new Date("1990-01-01"),
      isAdmin: false,
    },
  });

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Создаем челленджи
  await prisma.challenge.createMany({
    data: [
      {
        type: "daily",
        title: "Ежедневный челлендж: 10 поездок",
        targetTrips: 10,
        startDate: todayStart,
        endDate: todayEnd,
        isActive: true,
      },
      {
        type: "monthly",
        title: "Месячный челлендж: 200 поездок",
        targetTrips: 200,
        startDate: monthStart,
        endDate: monthEnd,
        isActive: true,
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });



