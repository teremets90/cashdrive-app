#!/bin/bash

# Скрипт развертывания CashDrive на REG.RU Cloud

echo "🚀 Начинаем развертывание CashDrive на REG.RU..."

# Проверяем, что мы в правильной папке
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Ошибка: docker-compose.yml не найден. Убедитесь, что вы в папке проекта."
    exit 1
fi

# Обновляем систему
echo "📦 Обновляем систему..."
sudo apt update && sudo apt upgrade -y

# Устанавливаем необходимые пакеты
echo "📋 Устанавливаем необходимые пакеты..."
sudo apt install -y curl wget git unzip htop

# Устанавливаем Docker
echo "🐳 Устанавливаем Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "✅ Docker установлен"
else
    echo "✅ Docker уже установлен"
fi

# Устанавливаем Docker Compose
echo "📋 Устанавливаем Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose установлен"
else
    echo "✅ Docker Compose уже установлен"
fi

# Создаем папки
echo "📁 Создаем необходимые папки..."
mkdir -p ssl
mkdir -p uploads
mkdir -p logs

# Останавливаем старые контейнеры
echo "🛑 Останавливаем старые контейнеры..."
docker-compose down

# Очищаем старые образы (опционально)
echo "🧹 Очищаем старые образы..."
docker system prune -f

# Собираем и запускаем
echo "🔨 Собираем и запускаем приложение..."
docker-compose up -d --build

# Ждем запуска базы данных
echo "⏳ Ждем запуска базы данных..."
sleep 15

# Проверяем статус контейнеров
echo "📊 Проверяем статус контейнеров..."
docker-compose ps

# Ждем еще немного для полного запуска
echo "⏳ Ждем полного запуска приложения..."
sleep 10

# Применяем миграции
echo "🗄️ Применяем миграции базы данных..."
docker-compose exec -T app npx prisma db push

# Заполняем тестовыми данными
echo "🌱 Заполняем тестовыми данными..."
docker-compose exec -T app npm run db:seed

# Проверяем логи
echo "📋 Проверяем логи приложения..."
docker-compose logs app --tail=20

echo "✅ Развертывание завершено!"
echo "🌐 Приложение доступно по адресу: http://$(curl -s ifconfig.me)"
echo "📊 Статус контейнеров:"
docker-compose ps

echo ""
echo "🔑 Тестовые аккаунты:"
echo "   Администратор: +79001234567 / admin123"
echo "   Пользователь: +79001234568 / user123"
echo ""
echo "📋 Полезные команды:"
echo "   docker-compose ps          - статус контейнеров"
echo "   docker-compose logs app    - логи приложения"
echo "   docker-compose down        - остановить приложение"
echo "   docker-compose up -d       - запустить приложение"
