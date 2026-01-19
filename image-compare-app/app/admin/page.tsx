"use client";

import Link from "next/link";
import AdminAuthGate from "./AdminAuthGate";

export default function AdminMenuPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-stone-100 to-amber-200 flex items-center justify-center px-6">
      <AdminAuthGate />
      <div className="bg-white/80 border border-stone-300 rounded-3xl shadow-2xl p-10 max-w-xl w-full text-center animate-fadeIn">
        <h1 className="text-4xl font-bold mb-4 text-stone-900 drop-shadow-sm">
          Admin Menu
        </h1>
        <p className="text-stone-700 mb-8">
          Choose what you want to do next.
        </p>

        <div className="flex flex-col gap-4">
          <Link
            href="/scores"
            className="px-6 py-4 text-lg font-semibold rounded-2xl shadow-lg 
                       bg-gradient-to-r from-emerald-500 to-emerald-700 text-white 
                       hover:scale-105 hover:shadow-xl transition-all duration-300"
          >
            Look at scores
          </Link>
          <Link
            href="/compare"
            className="px-6 py-4 text-lg font-semibold rounded-2xl shadow-lg 
                       bg-gradient-to-r from-amber-400 to-orange-500 text-white 
                       hover:scale-105 hover:shadow-xl transition-all duration-300"
          >
            Take the test
          </Link>
          <Link
            href="/admin/history"
            className="px-6 py-4 text-lg font-semibold rounded-2xl shadow-lg 
                       bg-gradient-to-r from-stone-700 to-stone-900 text-white 
                       hover:scale-105 hover:shadow-xl transition-all duration-300"
          >
            See user history
          </Link>
        </div>
      </div>
    </div>
  );
}
