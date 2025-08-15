"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navigation() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/profile", {
        credentials: "include"
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Navigation: Profile data:", data);
        setIsAuthenticated(true);
        setIsAdmin(data.user?.isAdmin || false);
        console.log("Navigation: isAdmin set to:", data.user?.isAdmin);
      } else {
        console.log("Navigation: Profile request failed");
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Navigation: Ошибка проверки аутентификации:", error);
      setIsAuthenticated(false);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/logout", { 
        method: "POST",
        credentials: "include"
      });
      
      if (response.ok) {
        // Сразу обновляем состояние
        setIsAuthenticated(false);
        setIsAdmin(false);
        
        // Перенаправляем на главную
        router.push("/");
        
        // Принудительно обновляем страницу через небольшую задержку
        setTimeout(() => {
          router.refresh();
        }, 100);
      } else {
        console.error("Ошибка при выходе");
      }
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Показываем состояние загрузки
  if (isLoading) {
    return (
      <nav className="flex gap-3 text-sm">
        <Link href="/challenges">Челленджи</Link>
        <Link href="/profile">Профиль</Link>
        <Link href="/admin" className="text-purple-600 font-medium">Админ</Link>
        <Link href="/login">Вход</Link>
      </nav>
    );
  }

  console.log("Navigation render: isAuthenticated:", isAuthenticated, "isAdmin:", isAdmin);

  return (
    <nav className="flex gap-3 text-sm">
      <Link href="/challenges">Челленджи</Link>
      <Link href="/ratings">🏆 Рейтинг</Link>
      <Link href="/profile">Профиль</Link>
      {isAdmin && (
        <Link href="/admin" className="text-purple-600 font-medium">Админ</Link>
      )}
      {isAuthenticated ? (
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Выход..." : "Выйти"}
        </button>
      ) : (
        <Link href="/login">Вход</Link>
      )}
    </nav>
  );
}
