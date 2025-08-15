"use client";
import { useState } from "react";
import { z } from "zod";

const schema = z.object({ phone: z.string().min(5), password: z.string().min(6) });

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    console.log("handleSubmit called!"); // Отладочный лог
    setError(null);
    setLoading(true);
    
    const form = document.querySelector('form') as HTMLFormElement;
    const formData = new FormData(form);
    try {
      const obj = Object.fromEntries(formData.entries());
      const parsed = schema.parse(obj);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      if (!res.ok) throw new Error("Неверные данные");
      const next = new URLSearchParams(window.location.search).get("next") ?? "/challenges";
      window.location.href = next;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md p-4">
      <h1 className="text-2xl font-semibold mb-4">Вход</h1>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form className="space-y-3">
        <input 
          name="phone" 
          type="tel"
          autoComplete="tel"
          placeholder="Телефон" 
          className="w-full border p-2 rounded" 
        />
        <input 
          name="password" 
          type="password" 
          autoComplete="current-password"
          placeholder="Пароль" 
          className="w-full border p-2 rounded" 
        />
        <button 
          type="button" 
          onClick={handleSubmit} 
          disabled={loading} 
          className="w-full bg-black text-white p-2 rounded"
        >
          {loading ? "Входим..." : "Войти"}
        </button>
      </form>
    </div>
  );
}


