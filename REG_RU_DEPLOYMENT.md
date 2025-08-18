# 🚀 Развертывание CashDrive на REG.RU Cloud

## 📋 Требования к серверу

### **Минимальная конфигурация:**
- **RAM:** 4 GB (рекомендуется)
- **CPU:** 2 ядра
- **Диск:** 40 GB SSD
- **ОС:** Ubuntu 22.04 LTS
- **Тариф:** от 200₽/месяц

### **Рекомендуемая конфигурация:**
- **RAM:** 8 GB
- **CPU:** 4 ядра
- **Диск:** 80 GB SSD
- **Тариф:** от 400₽/месяц

## 🔧 Пошаговое развертывание

### **Шаг 1: Создание VPS на REG.RU**

1. **Перейдите на [REG.RU Cloud](https://reg.cloud/services/)**
2. **Войдите в личный кабинет**
3. **Нажмите "Создать сервер"**
4. **Выберите конфигурацию:**
   - **ОС:** Ubuntu 22.04 LTS
   - **RAM:** 4 GB
   - **CPU:** 2 ядра
   - **Диск:** 40 GB SSD
5. **Нажмите "Создать"**

### **Шаг 2: Подключение к серверу**

```bash
# Подключитесь к серверу
ssh root@YOUR_SERVER_IP

# Создайте пользователя для приложения
adduser cashdrive --disabled-password --gecos ""
usermod -aG sudo cashdrive

# Переключитесь на пользователя
su - cashdrive
```

### **Шаг 3: Клонирование и развертывание**

```bash
# Клонируйте репозиторий
git clone https://github.com/teremets90/cashdrive-app.git
cd cashdrive-app

# Сделайте скрипт исполняемым
chmod +x deploy.sh

# Запустите развертывание
./deploy.sh
```

## 🔍 Проверка развертывания

### **После завершения скрипта:**

```bash
# Проверьте статус контейнеров
docker-compose ps

# Проверьте логи приложения
docker-compose logs app

# Проверьте доступность
curl http://localhost
```

### **Ожидаемый результат:**

```
Name                    Command               State           Ports
--------------------------------------------------------------------------------
cashdrive-app-app-1     node server.js        Up      0.0.0.0:3000->3000/tcp
cashdrive-app-db-1      docker-entrypoint.sh  Up      0.0.0.0:5432->5432/tcp
cashdrive-app-nginx-1   /docker-entrypoint.sh Up      0.0.0.0:80->80/tcp
```

## 🌐 Доступ к приложению

### **URL приложения:**
- **Основной:** `http://YOUR_SERVER_IP`
- **Прямой доступ:** `http://YOUR_SERVER_IP:3000`

### **Тестовые аккаунты:**
- **Администратор:** `+79001234567` / `admin123`
- **Пользователь:** `+79001234568` / `user123`

## 🔧 Управление приложением

### **Основные команды:**

```bash
# Статус контейнеров
docker-compose ps

# Логи приложения
docker-compose logs app

# Логи базы данных
docker-compose logs db

# Остановить приложение
docker-compose down

# Запустить приложение
docker-compose up -d

# Перезапустить приложение
docker-compose restart

# Обновить приложение
git pull
docker-compose up -d --build
```

### **Бэкап базы данных:**

```bash
# Создать бэкап
docker-compose exec db pg_dump -U postgres cashdrive > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановить из бэкапа
docker-compose exec -T db psql -U postgres cashdrive < backup_file.sql
```

## 🔒 Безопасность

### **Рекомендуемые меры:**

1. **Измените пароли по умолчанию:**
   ```bash
   # Измените пароль PostgreSQL
   docker-compose exec db psql -U postgres -c "ALTER USER postgres PASSWORD 'new_password';"
   ```

2. **Настройте файрвол:**
   ```bash
   sudo ufw allow 22
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```

3. **Настройте SSL сертификат:**
   ```bash
   # Установите Certbot
   sudo apt install certbot python3-certbot-nginx
   
   # Получите сертификат
   sudo certbot --nginx -d your-domain.com
   ```

## 🆘 Решение проблем

### **Если контейнеры не запускаются:**

```bash
# Проверьте логи
docker-compose logs

# Проверьте использование ресурсов
htop

# Перезапустите Docker
sudo systemctl restart docker
```

### **Если база данных не подключается:**

```bash
# Проверьте статус PostgreSQL
docker-compose exec db pg_isready -U postgres

# Перезапустите базу данных
docker-compose restart db
```

### **Если приложение не отвечает:**

```bash
# Проверьте порты
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :3000

# Проверьте логи Nginx
docker-compose logs nginx
```

## 📞 Поддержка

При возникновении проблем:
1. **Проверьте логи:** `docker-compose logs`
2. **Проверьте ресурсы:** `htop`
3. **Проверьте статус:** `docker-compose ps`
4. **Обратитесь к документации** или создайте issue в репозитории

## 💰 Стоимость

- **Минимальная конфигурация:** от 200₽/месяц
- **Рекомендуемая конфигурация:** от 400₽/месяц
- **Дополнительные услуги:** SSL, домен, бэкапы
