"use client";

import { Lock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/admin/products";

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Не удалось войти");
      return;
    }

    router.replace(nextPath);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-6 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-neutral-900 text-white">
          <Lock className="size-5" aria-hidden />
        </span>
        <div>
          <h1 className="text-lg font-semibold">Вход в админ-панель</h1>
          <p className="text-sm text-neutral-500">SAMBUSA.TJ — управление витриной</p>
        </div>
      </div>

      <label className="mb-1.5 block text-sm font-medium text-neutral-700" htmlFor="password">
        Пароль администратора
      </label>
      <input
        id="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="h-11 w-full rounded-xl border border-neutral-200 px-3 text-base outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200"
        placeholder="Введите пароль"
      />

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !password}
        className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-neutral-900 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
      >
        {loading ? "Вход…" : "Войти"}
      </button>

      <p className="mt-5 text-xs leading-relaxed text-neutral-500">
        Пароль задаётся в файле{" "}
        <code className="rounded bg-neutral-100 px-1 py-0.5">sambusa-next/.env.local</code>{" "}
        (строка <code className="rounded bg-neutral-100 px-1 py-0.5">ADMIN_PASSWORD=...</code>
        ). После смены пароля перезапустите{" "}
        <code className="rounded bg-neutral-100 px-1 py-0.5">npm run dev</code>. Сброс через сайт
        недоступен — только правка этого файла.
      </p>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#F7F7F5] px-4">
      <Suspense fallback={<div className="text-sm text-neutral-500">Загрузка…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
