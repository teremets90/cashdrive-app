"use client";
import { useEffect, useState } from "react";

type Challenge = {
  id: string;
  type: "daily" | "monthly";
  title: string;
  targetTrips: number;
  startDate: string;
  endDate: string;
  currentTrips: number;
  isCompleted: boolean;
  ratio: number;
  isParticipating: boolean;
  betAmount: number;
};

export default function ChallengesPage() {
  const [items, setItems] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Состояние для модального окна ставки
  const [showBetModal, setShowBetModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [betAmount, setBetAmount] = useState(50);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadChallenges();
  }, []);

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

  async function loadChallenges() {
    try {
      setLoading(true);
      const res = await fetch("/api/challenges");
      if (!res.ok) {
        setError("Не удалось загрузить челленджи");
        return;
      }
      const data = await res.json();
      setItems(data.challenges);
    } catch (e) {
      setError("Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }

  function openBetModal(challenge: Challenge) {
    setSelectedChallenge(challenge);
    setBetAmount(50); // Сброс к минимальной ставке
    setShowBetModal(true);
  }

  function closeBetModal() {
    setShowBetModal(false);
    setSelectedChallenge(null);
    setBetAmount(50);
  }

  async function participateInChallenge() {
    if (!selectedChallenge) return;

    try {
      console.log("Starting participation in challenge:", selectedChallenge.id);
      console.log("Bet amount:", betAmount);
      
      setSubmitting(true);
      const res = await fetch(`/api/challenges/${selectedChallenge.id}/participate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ betAmount }), // Send betAmount
      });

      console.log("Response status:", res.status);
      console.log("Response ok:", res.ok);

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.error || "Ошибка участия в челлендже");
      }

      const result = await res.json();
      console.log("Success response:", result);
      setSuccess(result.message);
      closeBetModal(); // Close modal on success

      await loadChallenges(); // Reload data
    } catch (e) {
      console.error("Error in participateInChallenge:", e);
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateProgress(challengeId: string) {
    // Перенаправляем на страницу обновления прогресса
    window.location.href = `/challenges/update?challengeId=${challengeId}`;
  }

  function increaseBet() {
    setBetAmount(prev => prev + 25);
  }

  function decreaseBet() {
    if (betAmount > 50) {
      setBetAmount(prev => prev - 25);
    }
  }

  if (loading) return <div className="p-4">Загрузка...</div>;

  return (
    <div className="mx-auto max-w-md p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Челленджи</h1>
      {error && <div className="text-red-600 bg-red-50 p-3 rounded">{error}</div>}
      {success && <div className="text-green-600 bg-green-50 p-3 rounded">{success}</div>}
      
      {items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Пока нет доступных челленджей</p>
        </div>
      ) : (
        items.map((c) => (
          <div key={c.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  c.type === "daily" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                }`}>
                  {c.type === "daily" ? "Ежедневный" : "Месячный"}
                </span>
                {c.isParticipating && (
                  <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                    ✅ Участвую
                  </span>
                )}
              </div>
              <span>
                {new Date(c.startDate).toLocaleDateString()} — {new Date(c.endDate).toLocaleDateString()}
              </span>
            </div>
            
            <div className="font-medium text-lg">{c.title}</div>
            <div className="text-sm text-gray-600">Цель: {c.targetTrips} поездок</div>
            
            {c.isParticipating ? (
              // Пользователь участвует в челлендже
              <div className="space-y-3">
                {c.betAmount > 0 && (
                  <div className="text-sm text-purple-600 font-medium">
                    💰 Ваша ставка: {c.betAmount} ₽
                  </div>
                )}
                <div className="text-sm">Прогресс: {c.currentTrips} / {c.targetTrips}</div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      c.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                    }`} 
                    style={{ width: `${Math.round(c.ratio * 100)}%` }} 
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${
                    c.isCompleted ? "text-green-600" : "text-gray-600"
                  }`}>
                    {c.isCompleted ? "✅ Выполнено" : "В процессе"}
                  </span>
                  <button
                    onClick={() => updateProgress(c.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Обновить
                  </button>
                </div>
              </div>
            ) : (
              // Пользователь не участвует в челлендже
              <div className="space-y-3">
                <div className="text-sm text-gray-500">
                  Вы еще не участвуете в этом челлендже
                </div>
                <button
                  onClick={() => openBetModal(c)}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
                >
                  🚀 Участвовать
                </button>
              </div>
            )}
          </div>
        ))
      )}

      {/* Модальное окно для ввода ставки */}
      {showBetModal && selectedChallenge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">💰 Введите вашу ставку</h3>
            <p className="text-sm text-gray-600 mb-4">
              {selectedChallenge.title}
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Сумма ставки (₽)
              </label>
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={decreaseBet}
                  disabled={betAmount <= 50}
                  className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  -
                </button>
                <div className="text-2xl font-bold text-center min-w-[80px]">
                  {betAmount} ₽
                </div>
                <button
                  onClick={increaseBet}
                  className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                >
                  +
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                Минимум 50 ₽, шаг 25 ₽
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={closeBetModal}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors"
                disabled={submitting}
              >
                Отмена
              </button>
              <button
                onClick={participateInChallenge}
                disabled={submitting}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {submitting ? "Участвую..." : "Участвовать"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



