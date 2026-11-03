"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Croissant } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    if (data.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/kasir");
    }
  }

  const input =
    "w-full border border-green-200 rounded-xl p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-300";

  return (
    <main className="min-h-screen flex items-center justify-center bg-green-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-3xl shadow-sm border border-green-100 w-full max-w-sm space-y-5"
      >
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <Croissant size={30} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-emerald-800 mt-3">Toko Roti</h1>
          <p className="text-sm text-gray-500">Silakan masuk untuk melanjutkan</p>
        </div>

        {error && (
          <p className="bg-rose-100 text-rose-800 text-sm p-3 rounded-xl">{error}</p>
        )}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={input}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={input}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-400 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>
    </main>
  );
}