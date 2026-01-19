"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    window.localStorage.removeItem("role");
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        setError("Invalid username or password.");
        return;
      }

      const data = await res.json();
      if (data?.role !== "admin" && data?.role !== "user") {
        setError("Account role is not configured.");
        return;
      }

      window.localStorage.setItem("role", data.role);
      window.localStorage.setItem("username", username);
      router.push("/compare");
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-stone-100 to-amber-200 flex items-center justify-center px-6">
      <div className="bg-white/80 border border-stone-300 rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center animate-fadeIn">
        <h1 className="text-4xl font-bold mb-4 text-stone-900 drop-shadow-sm">
          Sign in
        </h1>
        <p className="text-stone-700 mb-8">
          Use your approved username and password to continue.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="text-left">
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Username
            </label>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-2xl border border-stone-300 bg-white/90 px-4 py-3 text-stone-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Enter username"
              autoComplete="username"
              required
            />
          </div>

          <div className="text-left">
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Password
            </label>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-stone-300 bg-white/90 px-4 py-3 text-stone-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Enter password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          {error ? (
            <div className="text-sm text-red-600 font-medium">{error}</div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 text-lg font-semibold rounded-2xl shadow-lg 
                       bg-gradient-to-r from-amber-400 to-orange-500 text-white 
                       hover:scale-105 hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:hover:scale-100"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
