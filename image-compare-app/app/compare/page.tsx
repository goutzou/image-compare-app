"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Role = "admin" | "user";
type Pair = { imgA: string; imgB: string };
type PairsResponse = { similarPairs?: Pair[]; differentPairs?: Pair[] };

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
  const [username, setUsername] = useState<string | null>(null);
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [pairIndex, setPairIndex] = useState(0);

  function shufflePairs(list: Pair[]) {
    const shuffled = [...list];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Fetch all possible pairs and start a new test
  async function loadTest() {
    setLoading(true);
    const res = await fetch("/api/pairs");
    const data = (await res.json()) as PairsResponse;
    const similarPairs = Array.isArray(data.similarPairs)
      ? data.similarPairs
      : [];
    const differentPairs = Array.isArray(data.differentPairs)
      ? data.differentPairs
      : [];
    const targetCount = 20;
    const shuffledDifferent = shufflePairs(differentPairs);
    let selected = [...similarPairs];
    if (selected.length < targetCount) {
      selected = selected.concat(
        shuffledDifferent.slice(0, targetCount - selected.length),
      );
    } else if (selected.length > targetCount) {
      selected = selected.slice(0, targetCount);
    }
    setPairs(selected);
    setPairIndex(0);
    if (selected.length > 0) {
      setImgA(selected[0].imgA);
      setImgB(selected[0].imgB);
      pairStartRef.current = performance.now();
    } else {
      setImgA(null);
      setImgB(null);
    }
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
        username,
      }),
    });

    setAnswersCount((prev) => {
      const next = prev + 1;
      if (next >= 20 || next >= pairs.length) {
        setFinished(true);
        return next;
      }
      const nextPair = pairs[next];
      if (nextPair) {
        setPairIndex(next);
        setImgA(nextPair.imgA);
        setImgB(nextPair.imgB);
        pairStartRef.current = performance.now();
      }
      return next;
    });
  }

  useEffect(() => {
    if (started && !finished && pairs.length === 0) {
      loadTest();
    }
  }, [started, finished, pairs.length]);

  useEffect(() => {
    const storedRole = window.localStorage.getItem("role");
    if (storedRole !== "admin" && storedRole !== "user") {
      window.localStorage.removeItem("role");
      router.replace("/login");
      return;
    }
    setRole(storedRole);
    setUsername(window.localStorage.getItem("username"));
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
        className="min-h-screen bg-gradient-to-br from-sky-100 via-slate-100 to-blue-200 
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
                     bg-gradient-to-r from-blue-500 to-sky-600 text-white 
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
        className="min-h-screen bg-gradient-to-br from-sky-100 via-slate-100 to-blue-200 
                      flex flex-col items-center justify-center text-stone-800 px-6 text-center animate-fadeIn"
      >
        <h1 className="text-5xl font-bold mb-6 tracking-wide text-stone-900 drop-shadow-sm">
          Thank you for your answer
        </h1>
        <button
          onClick={() => {
            setAnswersCount(0);
            setFinished(false);
            if (role === "admin") {
              router.push("/admin");
              return;
            }
            setPairs([]);
            setPairIndex(0);
            setStarted(true);
          }}
          className="px-10 py-4 text-lg font-semibold rounded-2xl shadow-lg 
                     bg-gradient-to-r from-blue-500 to-sky-600 text-white 
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
      className="min-h-screen bg-gradient-to-br from-sky-100 via-slate-100 to-blue-200 
                    flex flex-col items-center justify-center text-stone-900 px-4 animate-fadeIn"
    >
      <h1 className="text-3xl sm:text-4xl font-semibold mb-8 sm:mb-10 tracking-wide text-stone-900 drop-shadow-sm">
        Image Comparison
      </h1>

      <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-center">
        {[imgA, imgB].map((src, idx) => (
          <div
            key={idx}
            className="w-64 h-64 sm:w-80 sm:h-80 bg-white/80 backdrop-blur-sm border border-stone-300 
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-8 sm:mt-10 w-full max-w-xl">
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
