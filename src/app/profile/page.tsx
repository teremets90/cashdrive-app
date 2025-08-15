"use client";
import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  phone: string;
  birthDate: string;
  photoUrl: string | null;
  registeredAt: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) {
        setError("Не удалось загрузить профиль");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setUser(data.user);
      setName(data.user?.name ?? "");
      setBirthDate(data.user?.birthDate?.slice(0, 10) ?? "");
      setPhotoUrl(data.user?.photoUrl ?? null);
      setLoading(false);
    })();
  }, []);

  // Очищаем уведомления через 3 секунды
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

  async function onSave() {
    setError(null);
    setSuccess(null);
    setSaving(true);
    
    try {
      // Подготавливаем данные для отправки
      const updateData: {
        name?: string;
        birthDate?: string;
        photoUrl?: string;
      } = {};
      if (name.trim()) updateData.name = name.trim();
      if (birthDate) updateData.birthDate = birthDate;
      if (photoUrl) updateData.photoUrl = photoUrl;
      
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Profile update error:", errorData);
        setError("Ошибка сохранения");
        return;
      }
      
      const data = await res.json();
      setUser(data.user);
      setSuccess("Информация сохранена успешно!");
    } catch (error) {
      setError("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setError(null);
    setSuccess(null);
    setUploading(true);
    
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      
      if (!res.ok) {
        setError("Ошибка загрузки фото");
        return;
      }
      
      const { url } = await res.json();
      setPhotoUrl(url);
      setSuccess("Фото загружено успешно!");
    } catch (error) {
      setError("Ошибка загрузки фото");
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <div className="p-4">Загрузка...</div>;

  return (
    <div className="mx-auto max-w-md p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Профиль</h1>
      
      {/* Уведомления */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}
      
      {/* Фото профиля */}
      <div className="flex items-center gap-4">
        {photoUrl ? (
          <img src={photoUrl} alt="Фото" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center">
            <span className="text-gray-500 text-sm">Нет фото</span>
          </div>
        )}
        
        <div className="flex-1">
          <input
            type="file"
            accept="image/*"
            onChange={onUpload}
            className="hidden"
            id="photo-upload"
            disabled={uploading}
          />
          <label
            htmlFor="photo-upload"
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md cursor-pointer transition-colors ${
              uploading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            }`}
          >
            {uploading ? "Загрузка..." : "Загрузить фото"}
          </label>
        </div>
      </div>
      
      {/* Поля формы */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ФИО
          </label>
          <input
            className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Введите ваше полное имя"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Дата рождения
          </label>
          <input
            className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            type="date"
          />
        </div>
      </div>
      
      {/* Информация */}
      <div className="bg-gray-50 p-4 rounded-md space-y-2">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Телефон:</span> {user?.phone}
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">Дата регистрации:</span> {new Date(user!.registeredAt).toLocaleDateString()}
        </div>
      </div>
      
      {/* Кнопка сохранения */}
      <button
        onClick={onSave}
        disabled={saving}
        className={`w-full py-3 px-4 border border-transparent text-sm font-medium rounded-md transition-colors ${
          saving
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        }`}
      >
        {saving ? "Сохранение..." : "Сохранить изменения"}
      </button>
    </div>
  );
}



