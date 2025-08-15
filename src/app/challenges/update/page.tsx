"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function UpdateProgressPage() {
  const sp = useSearchParams();
  const challengeId = sp.get("challengeId") ?? "";
  const [addTrips, setAddTrips] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOk(false);
    setError(null);
    const value = Number(addTrips);
    if (!Number.isInteger(value) || value <= 0) {
      setError("Введите целое число больше 0");
      return;
    }
    const res = await fetch("/api/progress/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId, addTrips: value }),
    });
    if (!res.ok) {
      setError("Ошибка сохранения");
      return;
    }
    setOk(true);
  }

  return (
    <div className="mx-auto max-w-md p-4 space-y-3">
      <h1 className="text-2xl font-semibold">Обновить прогресс</h1>
      {challengeId ? (
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            value={addTrips}
            onChange={(e) => setAddTrips(e.target.value)}
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Сколько поездок добавить"
            className="w-full border p-2 rounded"
          />
          {error && <div className="text-red-600">{error}</div>}
          {ok && <div className="text-green-600">Сохранено</div>}
          <button className="w-full bg-black text-white p-2 rounded">Сохранить</button>
        </form>
      ) : (
        <div className="text-gray-600">Не указан челлендж</div>
      )}
    </div>
  );
}



