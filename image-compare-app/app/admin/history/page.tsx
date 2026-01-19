"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminAuthGate from "../AdminAuthGate";

type UserScore = {
  total: number;
  votes: number;
  totalTimeMs?: number;
  timeVotes?: number;
  avgTimeMs?: number;
  lastAnsweredAt?: string;
};

type ScoresResponse = {
  userScores?: Record<string, UserScore>;
};

export default function UserHistoryPage() {
  const [userScores, setUserScores] = useState<Record<string, UserScore>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadScores() {
      try {
        const res = await fetch("/api/scores?format=json");
        const data = (await res.json()) as ScoresResponse;
        setUserScores(data.userScores || {});
      } catch {
        setUserScores({});
      } finally {
        setLoading(false);
      }
    }

    loadScores();
  }, []);

  const entries = Object.entries(userScores);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-stone-100 to-amber-200 px-6 py-10 text-stone-900">
      <AdminAuthGate />
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-semibold tracking-wide text-stone-900 drop-shadow-sm">
              User History
            </h1>
            <p className="text-stone-700 mt-2">
              Per-user metrics based on submitted comparisons.
            </p>
          </div>
          <Link
            href="/admin"
            className="px-4 py-2 text-sm font-semibold rounded-xl shadow-md 
                       bg-white/90 text-stone-900 border border-stone-300 
                       hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            Back to menu
          </Link>
        </div>

        <div className="bg-white/80 border border-stone-300 rounded-2xl p-6 shadow-lg mb-8">
          <h2 className="text-lg font-semibold text-stone-900 mb-3">
            Metrics documentation
          </h2>
          <div className="text-sm text-stone-700 space-y-2">
            <p>
              <span className="font-semibold text-stone-900">Votes:</span> total
              number of answered pairs by the user.
            </p>
            <p>
              <span className="font-semibold text-stone-900">Total:</span> sum
              of ratings (Similar = 1, Different = 0).
            </p>
            <p>
              <span className="font-semibold text-stone-900">Avg rating:</span>{" "}
              total divided by votes.
            </p>
            <p>
              <span className="font-semibold text-stone-900">Avg time:</span>{" "}
              average response time in milliseconds between pair display and
              answer.
            </p>
            <p>
              <span className="font-semibold text-stone-900">Last answered:</span>{" "}
              timestamp of the latest submission from the user.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white/80 border border-stone-300 rounded-2xl p-6 shadow-lg">
            Loading user history...
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white/80 border border-stone-300 rounded-2xl p-6 shadow-lg">
            No user history yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {entries.map(([username, score]) => {
              const avgRating =
                score.votes > 0 ? (score.total / score.votes).toFixed(2) : "0";
              const avgTimeMs =
                typeof score.avgTimeMs === "number"
                  ? score.avgTimeMs
                  : score.timeVotes && typeof score.totalTimeMs === "number"
                    ? Math.round(score.totalTimeMs / score.timeVotes)
                    : 0;

              return (
                <div
                  key={username}
                  className="bg-white/80 border border-stone-300 rounded-2xl p-5 shadow-lg"
                >
                  <div className="text-sm text-stone-600 mb-2">User</div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="font-medium text-stone-900">{username}</div>
                    <div className="text-sm text-stone-700">
                      Avg rating: {avgRating} | Votes: {score.votes} | Avg time:{" "}
                      {avgTimeMs} ms
                    </div>
                  </div>
                  {score.lastAnsweredAt ? (
                    <div className="text-xs text-stone-500 mt-2">
                      Last answered: {score.lastAnsweredAt}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
