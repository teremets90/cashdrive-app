"use client";
import { useEffect, useState } from "react";

type Challenge = {
  id: string;
  title: string;
  type: "daily" | "monthly";
  targetTrips: number;
  currentTrips: number;
  isCompleted: boolean;
  progress: number;
  betAmount: number;
};

type Rating = {
  id: string;
  name: string;
  phone: string;
  registeredAt: string;
  totalTrips: number;
  completedChallenges: number;
  activeChallenges: number;
  averageProgress: number;
  totalBetAmount: number;
  score: number;
  position: number;
  challenges: Challenge[];
};

type RatingsData = {
  ratings: Rating[];
  totalParticipants: number;
  activeChallenges: number;
  message?: string;
};

export default function RatingsPage() {
  const [data, setData] = useState<RatingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  useEffect(() => {
    loadRatings();
  }, []);

  async function loadRatings() {
    try {
      setLoading(true);
      const res = await fetch("/api/ratings");
      if (!res.ok) {
        throw new Error("Не удалось загрузить рейтинги");
      }
      const ratingsData = await res.json();
      setData(ratingsData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }

  function getPositionIcon(position: number) {
    switch (position) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `#${position}`;
    }
  }

  function getScoreColor(score: number) {
    if (score >= 500) return "text-green-600";
    if (score >= 300) return "text-blue-600";
    if (score >= 100) return "text-yellow-600";
    return "text-gray-600";
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка рейтингов...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.ratings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">🏆 Рейтинг участников</h1>
            <div className="bg-white rounded-lg shadow p-8">
              <p className="text-gray-600 text-lg">
                {data?.message || "Пока нет участников в рейтинге"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏆 Рейтинг участников</h1>
          <p className="text-gray-600">
            {data.totalParticipants} участников • {data.activeChallenges} активных челленджей
          </p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{data.totalParticipants}</div>
            <div className="text-gray-600">Участников</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{data.activeChallenges}</div>
            <div className="text-gray-600">Активных челленджей</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(data.ratings.reduce((sum, r) => sum + r.averageProgress, 0) / data.ratings.length)}%
            </div>
            <div className="text-gray-600">Средний прогресс</div>
          </div>
        </div>

        {/* Список рейтингов */}
        <div className="space-y-4">
          {data.ratings.map((rating) => (
            <div key={rating.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Основная информация */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl font-bold text-gray-400 w-12 text-center">
                      {getPositionIcon(rating.position)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{rating.name}</h3>
                      <p className="text-sm text-gray-500">Участник #{rating.id.slice(-4)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(rating.score)}`}>
                      {rating.score} очков
                    </div>
                    <div className="text-sm text-gray-500">
                      {rating.completedChallenges}/{rating.activeChallenges} выполнено
                    </div>
                  </div>
                </div>

                {/* Прогресс-бары */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Общий прогресс</span>
                    <span className="font-medium">{rating.averageProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${rating.averageProgress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Статистика */}
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-blue-600">{rating.totalTrips}</div>
                    <div className="text-xs text-gray-500">Всего поездок</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-green-600">{rating.completedChallenges}</div>
                    <div className="text-xs text-gray-500">Выполнено</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-purple-600">{rating.averageProgress}%</div>
                    <div className="text-xs text-gray-500">Прогресс</div>
                  </div>
                </div>
                
                {/* Информация о ставках */}
                {rating.totalBetAmount > 0 && (
                  <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                    <div className="text-sm text-yellow-800 font-medium text-center">
                      💰 Общая сумма ставок: {rating.totalBetAmount} ₽
                    </div>
                  </div>
                )}

                {/* Кнопка раскрытия деталей */}
                <button
                  onClick={() => setExpandedUser(expandedUser === rating.id ? null : rating.id)}
                  className="mt-4 w-full text-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {expandedUser === rating.id ? "Скрыть детали" : "Показать детали"}
                </button>
              </div>

              {/* Детальная информация */}
              {expandedUser === rating.id && (
                <div className="border-t bg-gray-50 p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Детали по челленджам:</h4>
                  <div className="space-y-3">
                    {rating.challenges.map((challenge) => (
                      <div key={challenge.id} className="bg-white rounded p-3">
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <div className="font-medium text-gray-900">{challenge.title}</div>
                            <div className="text-sm text-gray-500">
                              {challenge.type === "daily" ? "Ежедневный" : "Месячный"}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">
                              {challenge.currentTrips}/{challenge.targetTrips}
                            </div>
                            <div className="text-sm text-gray-500">
                              {challenge.isCompleted ? "✅ Выполнено" : `${challenge.progress}%`}
                            </div>
                            {challenge.betAmount > 0 && (
                              <div className="text-xs text-yellow-600 font-medium">
                                💰 {challenge.betAmount} ₽
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              challenge.isCompleted 
                                ? 'bg-green-500' 
                                : challenge.progress > 50 
                                ? 'bg-yellow-500' 
                                : 'bg-blue-500'
                            }`}
                            style={{ width: `${challenge.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Информация о системе очков */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 Система очков</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium text-green-600">Выполненный челлендж</div>
              <div className="text-gray-600">+100 очков</div>
            </div>
            <div>
              <div className="font-medium text-blue-600">Прогресс</div>
              <div className="text-gray-600">+50 очков за 100%</div>
            </div>
            <div>
              <div className="font-medium text-purple-600">Поездки</div>
              <div className="text-gray-600">+1 очко за поездку</div>
            </div>
            <div>
              <div className="font-medium text-yellow-600">Ставки</div>
              <div className="text-gray-600">+0.1 очка за 1 ₽</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
