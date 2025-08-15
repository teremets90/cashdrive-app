# CashDrive - Приложение для челленджей

Веб-приложение для управления челленджами поездок с системой ставок и рейтингов.

## 🚀 Быстрый старт

### Локальная разработка

1. **Установите зависимости:**
   ```bash
   npm install
   ```

2. **Настройте базу данных:**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

3. **Запустите сервер разработки:**
   ```bash
   npm run dev
   ```

4. **Откройте [http://localhost:3000](http://localhost:3000)**

### Тестовые аккаунты

- **Администратор:** `+79001234567` / `admin123`
- **Пользователь:** `+79001234568` / `user123`

## 🛠 Технологии

- **Frontend:** Next.js 15, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **База данных:** SQLite (разработка) / PostgreSQL (продакшен)
- **ORM:** Prisma
- **Аутентификация:** JWT токены

## 📦 Развертывание

### Railway (Рекомендуется)

1. **Подключите репозиторий к Railway**
2. **Добавьте PostgreSQL базу данных**
3. **Настройте переменные окружения:**
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-super-secret-key
   NODE_ENV=production
   ```

### Vercel

1. **Подключите репозиторий к Vercel**
2. **Настройте внешнюю базу данных (Neon/Supabase)**
3. **Настройте переменные окружения**

## 🔧 Скрипты

- `npm run dev` - Запуск сервера разработки
- `npm run build` - Сборка для продакшена
- `npm run start` - Запуск продакшен сервера
- `npm run db:generate` - Генерация Prisma клиента
- `npm run db:push` - Применение схемы к базе данных
- `npm run db:seed` - Заполнение базы тестовыми данными

## 📁 Структура проекта

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API endpoints
│   ├── admin/          # Админ-панель
│   ├── challenges/     # Страница челленджей
│   ├── profile/        # Профиль пользователя
│   └── ratings/        # Рейтинги
├── components/         # React компоненты
├── lib/               # Утилиты и конфигурация
└── generated/         # Сгенерированные файлы Prisma
```

## 🔒 Безопасность

- JWT токены для аутентификации
- Валидация входных данных с Zod
- Защищенные API endpoints
- Хеширование паролей с bcrypt

## 📝 Лицензия

MIT
