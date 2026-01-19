"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Role = "admin" | "user";

export default function Home() {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [imgA, setImgA] = useState<string | null>(null);
  const [imgB, setImgB] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [answersCount, setAnswersCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const pairStartRef = useRef<number | null>(null);

  // Fetch a new random image pair
  async function loadPair() {
    setLoading(true);
    const res = await fetch("/api/next_pair");
    const data = await res.json();
    setImgA(data.imgA);
    setImgB(data.imgB);
    pairStartRef.current = performance.now();
    setLoading(false);
  }

  // Submit rating 1–5
  async function submit(rating: number) {
    const now = performance.now();
    const durationMs =
      pairStartRef.current === null
        ? null
        : Math.max(0, Math.round(now - pairStartRef.current));
    await fetch("/api/submit_decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imgA,
        imgB,
        rating,
        timestamp: new Date().toISOString(),
        durationMs,
      }),
    });

    setAnswersCount((prev) => {
      const next = prev + 1;
      if (next >= 10) {
        setFinished(true);
        return next;
      }
      loadPair();
      return next;
    });
  }

  useEffect(() => {
    if (started && !finished) loadPair();
  }, [started, finished]);

  useEffect(() => {
    const storedRole = window.localStorage.getItem("role");
    if (storedRole !== "admin" && storedRole !== "user") {
      window.localStorage.removeItem("role");
      router.replace("/login");
      return;
    }
    setRole(storedRole);
    setAuthChecked(true);
  }, [router]);

  useEffect(() => {
    if (!started || finished) return;

    function handleKeydown(event: KeyboardEvent) {
      if (loading || !imgA || !imgB) return;
      const key = event.key.toLowerCase();
      if (key === "s") {
        submit(1);
      } else if (key === "d") {
        submit(0);
      }
    }

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [started, finished, loading, imgA, imgB]);

  if (!authChecked) {
    return null;
  }

  // -----------------------------------------------------------
  // INTRO PAGE
  // -----------------------------------------------------------
  if (!started) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-amber-100 via-stone-100 to-amber-200 
                      flex flex-col items-center justify-center text-stone-800 px-6 text-center animate-fadeIn"
      >
        <h1 className="text-5xl font-bold mb-6 tracking-wide text-stone-900 drop-shadow-sm">
          Welcome
        </h1>

        <p className="text-xl text-stone-700 max-w-xl mb-10 leading-relaxed">
          You will see two images at a time and decide whether they are similar
          or different.
        </p>

        <button
          onClick={() => setStarted(true)}
          className="px-10 py-4 text-lg font-semibold rounded-2xl shadow-lg 
                     bg-gradient-to-r from-amber-400 to-orange-500 text-white 
                     hover:scale-105 hover:shadow-xl transition-all duration-300"
        >
          Let’s Get Started
        </button>
      </div>
    );
  }

  if (finished) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-amber-100 via-stone-100 to-amber-200 
                      flex flex-col items-center justify-center text-stone-800 px-6 text-center animate-fadeIn"
      >
        <h1 className="text-5xl font-bold mb-6 tracking-wide text-stone-900 drop-shadow-sm">
          Thank you for your answer
        </h1>
        <button
          onClick={() => {
            setAnswersCount(0);
            setFinished(false);
            setStarted(true);
          }}
          className="px-10 py-4 text-lg font-semibold rounded-2xl shadow-lg 
                     bg-gradient-to-r from-amber-400 to-orange-500 text-white 
                     hover:scale-105 hover:shadow-xl transition-all duration-300"
        >
          Start again
        </button>
      </div>
    );
  }

  // -----------------------------------------------------------
  // MAIN IMAGE COMPARISON PAGE
  // -----------------------------------------------------------
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-amber-100 via-stone-100 to-amber-200 
                    flex flex-col items-center justify-center text-stone-900 px-4 animate-fadeIn"
    >
      {role === "admin" ? (
        <div className="absolute top-6 right-6">
          <Link
            href="/scores"
            className="px-4 py-2 text-sm font-semibold rounded-xl shadow-md 
                       bg-white/90 text-stone-900 border border-stone-300 
                       hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            Look at scores
          </Link>
        </div>
      ) : null}
      <h1 className="text-4xl font-semibold mb-10 tracking-wide text-stone-900 drop-shadow-sm">
        Image Comparison
      </h1>

      <div className="flex gap-10 items-center">
        {[imgA, imgB].map((src, idx) => (
          <div
            key={idx}
            className="w-80 h-80 bg-white/80 backdrop-blur-sm border border-stone-300 
                       rounded-2xl overflow-hidden shadow-xl flex items-center justify-center"
          >
            {!loading && src ? (
              <img
                src={src}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            ) : (
              <div className="animate-pulse w-full h-full bg-stone-200" />
            )}
          </div>
        ))}
      </div>

      {/* -------------------------------------------------------
          TWO-OPTION RATING BUTTONS
          ------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10 w-full max-w-xl">
        <button
          onClick={() => submit(1)}
          className="px-6 py-4 text-lg font-semibold rounded-2xl text-white
                     bg-gradient-to-r from-emerald-500 to-emerald-700
                     hover:scale-105 shadow-md hover:shadow-lg transition-all duration-300"
        >
          Similar
        </button>

        <button
          onClick={() => submit(0)}
          className="px-6 py-4 text-lg font-semibold rounded-2xl text-white
                     bg-gradient-to-r from-red-500 to-red-700
                     hover:scale-105 shadow-md hover:shadow-lg transition-all duration-300"
        >
          Different
        </button>
      </div>
    </div>
  );
}
