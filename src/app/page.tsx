export default function Home() {
  return (
    <div className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="text-2xl font-semibold">CashDrive</h1>
      <p className="text-gray-600">Платформа челленджей для водителей такси.</p>
      <div className="space-y-2">
        <a href="/register" className="block w-full text-center bg-black text-white p-3 rounded">Регистрация</a>
        <a href="/login" className="block w-full text-center border p-3 rounded">Вход</a>
        <a href="/challenges" className="block w-full text-center border p-3 rounded">Челленджи</a>
      </div>
    </div>
  );
}
