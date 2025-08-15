"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type Challenge = {
  id: string;
  type: "daily" | "monthly";
  title: string;
  targetTrips: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isArchived: boolean;
};

export default function ArchivePage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Фильтры
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadArchivedChallenges();
  }, [startDate, endDate, searchTerm]);

  // Очищаем уведомления
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  async function loadArchivedChallenges() {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (searchTerm) params.append('search', searchTerm);

      const res = await fetch(`/api/admin/challenges/archived?${params}`);
      if (!res.ok) {
        throw new Error("Ошибка загрузки архива");
      }

      const data = await res.json();
      setChallenges(data.challenges);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  async function restoreChallenge(challengeId: string) {
    try {
      const res = await fetch(`/api/admin/challenges/${challengeId}/archive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: false }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Ошибка восстановления");
      }

      const result = await res.json();
      setSuccess(result.message);
      await loadArchivedChallenges();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  }

  function clearFilters() {
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка архива...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📦 Архив челленджей</h1>
            <p className="text-gray-600 mt-2">
              Найдено: {challenges.length} челленджей
            </p>
          </div>
          <Link 
            href="/admin"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            ← Назад к админ-панели
          </Link>
        </div>

        {/* Уведомления */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        {/* Фильтры */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">🔍 Фильтры поиска</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дата начала
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дата окончания
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Поиск по названию
              </label>
              <input
                type="text"
                placeholder="Введите название..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
              >
                Очистить
              </button>
            </div>
          </div>
        </div>

        {/* Список архивированных челленджей */}
        <div className="space-y-4">
          {challenges.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600 text-lg">
                {startDate || endDate || searchTerm 
                  ? "По вашему запросу ничего не найдено" 
                  : "Архив пуст"
                }
              </p>
            </div>
          ) : (
            challenges.map((challenge) => (
              <div key={challenge.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          challenge.type === "daily" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                        }`}>
                          {challenge.type === "daily" ? "Ежедневный" : "Месячный"}
                        </span>
                        <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                          📦 Архив
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {challenge.title}
                      </h3>
                      <div className="text-sm text-gray-600">
                        Цель: {challenge.targetTrips} поездок
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {new Date(challenge.startDate).toLocaleDateString()} — {new Date(challenge.endDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => restoreChallenge(challenge.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors"
                        title="Восстановить из архива"
                      >
                        🔄 Восстановить
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
