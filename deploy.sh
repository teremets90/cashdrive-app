#!/bin/bash

# Скрипт развертывания CashDrive на VPS

echo "🚀 Начинаем развертывание CashDrive..."

# Обновляем систему
echo "📦 Обновляем систему..."
sudo apt update && sudo apt upgrade -y

# Устанавливаем Docker
echo "🐳 Устанавливаем Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Устанавливаем Docker Compose
echo "📋 Устанавливаем Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Создаем папки
echo "📁 Создаем необходимые папки..."
mkdir -p ssl
mkdir -p uploads

# Останавливаем старые контейнеры
echo "🛑 Останавливаем старые контейнеры..."
docker-compose down

# Собираем и запускаем
echo "🔨 Собираем и запускаем приложение..."
docker-compose up -d --build

# Ждем запуска базы данных
echo "⏳ Ждем запуска базы данных..."
sleep 10

# Применяем миграции
echo "🗄️ Применяем миграции базы данных..."
docker-compose exec app npx prisma db push

# Заполняем тестовыми данными
echo "🌱 Заполняем тестовыми данными..."
docker-compose exec app npm run db:seed

echo "✅ Развертывание завершено!"
echo "🌐 Приложение доступно по адресу: http://$(curl -s ifconfig.me)"
echo "📊 Статус контейнеров:"
docker-compose ps
