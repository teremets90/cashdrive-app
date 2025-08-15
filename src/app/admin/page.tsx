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
};

type User = {
  id: string;
  name: string;
  phone: string;
  isAdmin: boolean;
  registeredAt: string;
};

export default function AdminPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Состояния для поиска и фильтрации пользователей
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "user">("all");

  // Состояния для редактирования пользователя
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    isAdmin: false,
  });

  // Форма для создания/редактирования челленджа
  const [formData, setFormData] = useState({
    title: "",
    type: "daily" as "daily" | "monthly",
    targetTrips: 10,
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    loadData();
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

  async function loadData() {
    try {
      console.log("Loading admin data...");
      setLoading(true);
      
      const [challengesRes, usersRes] = await Promise.all([
        fetch("/api/admin/challenges", { cache: 'no-store' }),
        fetch("/api/admin/users", { cache: 'no-store' }),
      ]);

      console.log("Challenges response status:", challengesRes.status);
      console.log("Users response status:", usersRes.status);

      if (!challengesRes.ok || !usersRes.ok) {
        const challengesError = challengesRes.ok ? null : await challengesRes.text();
        const usersError = usersRes.ok ? null : await usersRes.text();
        console.error("API errors:", { challengesError, usersError });
        throw new Error("Ошибка загрузки данных");
      }

      const [challengesData, usersData] = await Promise.all([
        challengesRes.json(),
        usersRes.json(),
      ]);

      console.log("Loaded challenges:", challengesData.challenges?.length || 0);
      console.log("Loaded users:", usersData.users?.length || 0);

      setChallenges(challengesData.challenges || []);
      setUsers(usersData.users || []);
    } catch (e) {
      console.error("Error loading data:", e);
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  // Фильтрация пользователей
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    
    const matchesRole = 
      filterRole === "all" || 
      (filterRole === "admin" && user.isAdmin) ||
      (filterRole === "user" && !user.isAdmin);
    
    return matchesSearch && matchesRole;
  });

  async function createChallenge() {
    try {
      const res = await fetch("/api/admin/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Ошибка создания челленджа");

      await loadData();
      setFormData({
        title: "",
        type: "daily",
        targetTrips: 10,
        startDate: "",
        endDate: "",
      });
      setSuccess("Челлендж создан успешно!");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  }

  async function toggleChallenge(id: string, isActive: boolean) {
    try {
      console.log(`Toggling challenge ${id} from ${isActive} to ${!isActive}`);
      
      const res = await fetch(`/api/admin/challenges/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Ошибка обновления");
      }

      const result = await res.json();
      console.log("Challenge update result:", result);

      // Небольшая задержка для уверенности, что данные сохранились
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Принудительно обновляем данные
      await loadData();
      
      setSuccess(`Челлендж ${!isActive ? "включен" : "отключен"} успешно!`);
    } catch (e) {
      console.error("Error toggling challenge:", e);
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  }

  async function archiveChallenge(challengeId: string) {
    if (!confirm("Вы уверены, что хотите отправить этот челлендж в архив?")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/challenges/${challengeId}/archive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: true }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Ошибка архивирования");
      }

      const result = await res.json();
      setSuccess(result.message);
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  }

  async function autoArchiveChallenges() {
    if (!confirm("Автоматически архивировать все завершенные челленджи?")) {
      return;
    }

    try {
      const res = await fetch("/api/admin/challenges/auto-archive", {
        method: "POST",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Ошибка автоматического архивирования");
      }

      const result = await res.json();
      setSuccess(result.message);
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  }

  // Функции управления пользователями
  function startEditUser(user: User) {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      phone: user.phone,
      isAdmin: user.isAdmin,
    });
  }

  function cancelEdit() {
    setEditingUser(null);
    setEditForm({
      name: "",
      phone: "",
      isAdmin: false,
    });
  }

  async function saveUser() {
    if (!editingUser) return;

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) throw new Error("Ошибка обновления пользователя");

      await loadData();
      setEditingUser(null);
      setSuccess("Пользователь обновлен успешно!");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  }

  async function deleteUser(user: User) {
    if (!confirm(`Вы уверены, что хотите удалить пользователя "${user.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Ошибка удаления");

      await loadData();
      setSuccess("Пользователь удален успешно!");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  }

  if (loading) return <div className="p-4">Загрузка...</div>;

  return (
    <div className="mx-auto max-w-6xl p-4 space-y-6">
      <h1 className="text-3xl font-bold">Админ-панель</h1>
      
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

      {/* Создание нового челленджа */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Создать новый челлендж</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Название"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as "daily" | "monthly" })}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="daily">Ежедневный</option>
            <option value="monthly">Месячный</option>
          </select>
          <input
            type="number"
            placeholder="Цель поездок"
            value={formData.targetTrips}
            onChange={(e) => setFormData({ ...formData, targetTrips: Number(e.target.value) })}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={createChallenge}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Создать челлендж
        </button>
      </div>

      {/* Список челленджей */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Управление челленджами</h2>
          <div className="flex gap-2">
            <button
              onClick={autoArchiveChallenges}
              className="bg-yellow-600 text-white px-4 py-2 rounded text-sm hover:bg-yellow-700 transition-colors"
              title="Автоматически архивировать завершенные челленджи"
            >
              🤖 Авто-архив
            </button>
            <Link 
              href="/admin/archive"
              className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors"
            >
              📦 Архив
            </Link>
          </div>
        </div>
        
        {/* Статистика */}
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <div className="text-sm text-gray-600">
            Всего челленджей: {challenges.length} | 
            Активных: {challenges.filter(c => c.isActive).length} | 
            Неактивных: {challenges.filter(c => !c.isActive).length}
          </div>
        </div>
        
        <div className="space-y-3">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-medium">{challenge.title}</div>
                <div className="text-sm text-gray-600">
                  {challenge.type === "daily" ? "Ежедневный" : "Месячный"} • 
                  Цель: {challenge.targetTrips} поездок • 
                  {new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-sm ${challenge.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {challenge.isActive ? 'Активен' : 'Неактивен'}
                </span>
                <button
                  onClick={() => toggleChallenge(challenge.id, challenge.isActive)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    challenge.isActive 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {challenge.isActive ? 'Отключить' : 'Включить'}
                </button>
                <button
                  onClick={() => archiveChallenge(challenge.id)}
                  className="px-3 py-1 rounded text-sm bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                  title="Архивировать"
                >
                  📦
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Список пользователей */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Управление пользователями</h2>
        
        {/* Фильтры и поиск */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Поиск по имени или телефону..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as "all" | "admin" | "user")}
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все роли</option>
              <option value="admin">Администраторы</option>
              <option value="user">Пользователи</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Найдено: {filteredUsers.length} из {users.length} пользователей
          </div>
        </div>

        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <div key={user.id} className="border rounded-lg p-4">
              {editingUser?.id === user.id ? (
                // Режим редактирования
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Имя"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Телефон"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editForm.isAdmin}
                        onChange={(e) => setEditForm({ ...editForm, isAdmin: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Администратор</span>
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={saveUser}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      Сохранить
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                // Обычный режим просмотра
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-600">{user.phone}</div>
                    <div className="text-xs text-gray-500">
                      Зарегистрирован: {new Date(user.registeredAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                      user.isAdmin 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.isAdmin ? 'Админ' : 'Пользователь'}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEditUser(user)}
                        className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                        title="Редактировать"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteUser(user)}
                        className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                        title="Удалить"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

