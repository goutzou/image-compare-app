"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    window.localStorage.removeItem("role");
  }, []);

  function pickRole(role: "admin" | "user") {
    window.localStorage.setItem("role", role);
    router.push("/compare");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-stone-100 to-amber-200 flex items-center justify-center px-6">
      <div className="bg-white/80 border border-stone-300 rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center animate-fadeIn">
        <h1 className="text-4xl font-bold mb-4 text-stone-900 drop-shadow-sm">
          Choose your role
        </h1>
        <p className="text-stone-700 mb-8">
          Admins can vote and view/export scores. Users can vote on 10 pairs.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => pickRole("user")}
            className="px-6 py-3 text-lg font-semibold rounded-2xl shadow-lg 
                       bg-gradient-to-r from-amber-400 to-orange-500 text-white 
                       hover:scale-105 hover:shadow-xl transition-all duration-300"
          >
            Continue as User
          </button>
          <button
            onClick={() => pickRole("admin")}
            className="px-6 py-3 text-lg font-semibold rounded-2xl shadow-lg 
                       bg-gradient-to-r from-emerald-500 to-emerald-700 text-white 
                       hover:scale-105 hover:shadow-xl transition-all duration-300"
          >
            Continue as Admin
          </button>
        </div>
      </div>
    </div>
  );
}
