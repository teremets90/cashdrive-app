"use client";
import { useState } from "react";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  birthDate: z.string().min(4),
  phone: z.string().min(5),
  password: z.string().min(6),
});

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // Предотвращаем перезагрузку страницы
    setError(null);
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    try {
      const obj = Object.fromEntries(formData.entries());
      const parsed = schema.parse(obj);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      if (!res.ok) throw new Error("Ошибка регистрации");
      window.location.href = "/login";
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md p-4">
      <h1 className="text-2xl font-semibold mb-4">Регистрация</h1>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <input name="name" placeholder="ФИО" className="w-full border p-2 rounded" />
        <input name="birthDate" type="date" placeholder="Дата рождения" className="w-full border p-2 rounded" />
        <input name="phone" placeholder="Телефон" className="w-full border p-2 rounded" />
        <input name="password" type="password" placeholder="Пароль" className="w-full border p-2 rounded" />
        <button disabled={loading} className="w-full bg-black text-white p-2 rounded">{loading ? "Сохранение..." : "Зарегистрироваться"}</button>
      </form>
    </div>
  );
}


