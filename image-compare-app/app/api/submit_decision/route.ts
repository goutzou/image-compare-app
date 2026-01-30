export const runtime = "nodejs";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
const FILE_PATH = path.resolve("./data/scores.json");
// ------------------------------------------------------------
// PATH TO THE JSON FILE
// ------------------------------------------------------------

// ------------------------------------------------------------
// LOAD EXISTING SCORES ON SERVER START
// ------------------------------------------------------------
type ImageScore = { total: number; votes: number };
type PairScore = {
  total: number;
  votes: number;
  totalTimeMs: number;
  timeVotes: number;
  avgTimeMs: number;
};
type UserScore = {
  total: number;
  votes: number;
  totalTimeMs: number;
  timeVotes: number;
  avgTimeMs: number;
  lastAnsweredAt: string;
};

function loadScores(): {
  imageScores: Record<string, ImageScore>;
  pairScores: Record<string, PairScore>;
  userScores: Record<string, UserScore>;
} {
  if (!fs.existsSync(FILE_PATH)) {
    return { imageScores: {}, pairScores: {}, userScores: {} };
  }

  try {
    const raw = fs.readFileSync(FILE_PATH, "utf8");
    const parsed = JSON.parse(raw) as {
      imageScores?: Record<string, ImageScore>;
      pairScores?: Record<string, PairScore>;
      userScores?: Record<string, UserScore>;
    };
    return {
      imageScores: parsed.imageScores || {},
      pairScores: parsed.pairScores || {},
      userScores: parsed.userScores || {},
    };
  } catch (err) {
    console.error("Error reading scores.json:", err);
    return { imageScores: {}, pairScores: {}, userScores: {} };
  }
}

// Global in-memory cache (synced with JSON file)
let { imageScores, pairScores, userScores } = loadScores();

// ------------------------------------------------------------
// SAVE SCORES TO DISK
// ------------------------------------------------------------
function saveScores() {
  const data = JSON.stringify(
    { imageScores, pairScores, userScores },
    null,
    2,
  );

  try {
    fs.writeFileSync(FILE_PATH, data, "utf8");
  } catch (err) {
    console.error("Error writing scores.json:", err);
  }
}

// ------------------------------------------------------------
// Update cumulative image-level score
// ------------------------------------------------------------
function updateImageScore(image: string, rating: number) {
  if (!imageScores[image]) {
    imageScores[image] = { total: 0, votes: 0 };
  }
  imageScores[image].total += rating;
  imageScores[image].votes += 1;
}

// ------------------------------------------------------------
// Update cumulative pair-level score
// ------------------------------------------------------------
function updatePairScore(
  imgA: string,
  imgB: string,
  rating: number,
  durationMs: number | null,
) {
  const key = [imgA, imgB].sort().join("__");

  if (!pairScores[key]) {
    pairScores[key] = {
      total: 0,
      votes: 0,
      totalTimeMs: 0,
      timeVotes: 0,
      avgTimeMs: 0,
    };
  }
  if (typeof pairScores[key].totalTimeMs !== "number") {
    pairScores[key].totalTimeMs = 0;
  }
  if (typeof pairScores[key].timeVotes !== "number") {
    pairScores[key].timeVotes = 0;
  }
  if (typeof pairScores[key].avgTimeMs !== "number") {
    pairScores[key].avgTimeMs = 0;
  }
  pairScores[key].total += rating;
  pairScores[key].votes += 1;
  if (typeof durationMs === "number") {
    pairScores[key].totalTimeMs += durationMs;
    pairScores[key].timeVotes += 1;
    pairScores[key].avgTimeMs =
      pairScores[key].timeVotes > 0
        ? Math.round(pairScores[key].totalTimeMs / pairScores[key].timeVotes)
        : 0;
  }
}

// ------------------------------------------------------------
// Update cumulative user-level score
// ------------------------------------------------------------
function updateUserScore(
  username: string,
  rating: number,
  durationMs: number | null,
  timestamp: string,
) {
  if (!userScores[username]) {
    userScores[username] = {
      total: 0,
      votes: 0,
      totalTimeMs: 0,
      timeVotes: 0,
      avgTimeMs: 0,
      lastAnsweredAt: "",
    };
  }
  if (typeof userScores[username].totalTimeMs !== "number") {
    userScores[username].totalTimeMs = 0;
  }
  if (typeof userScores[username].timeVotes !== "number") {
    userScores[username].timeVotes = 0;
  }
  if (typeof userScores[username].avgTimeMs !== "number") {
    userScores[username].avgTimeMs = 0;
  }

  userScores[username].total += rating;
  userScores[username].votes += 1;
  if (typeof durationMs === "number") {
    userScores[username].totalTimeMs += durationMs;
    userScores[username].timeVotes += 1;
    userScores[username].avgTimeMs =
      userScores[username].timeVotes > 0
        ? Math.round(
            userScores[username].totalTimeMs /
              userScores[username].timeVotes,
          )
        : 0;
  }
  userScores[username].lastAnsweredAt = timestamp;
}

// ------------------------------------------------------------
// POST HANDLER
// ------------------------------------------------------------
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imgA, imgB, rating, timestamp, durationMs, username } = body;
    const normalizedDurationMs =
      typeof durationMs === "number" && Number.isFinite(durationMs)
        ? Math.max(0, Math.round(durationMs))
        : null;
    const normalizedTimestamp =
      typeof timestamp === "string" ? timestamp : new Date().toISOString();

    if (!imgA || !imgB || typeof rating !== "number") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    updateImageScore(imgA, rating);
    updateImageScore(imgB, rating);
    updatePairScore(imgA, imgB, rating, normalizedDurationMs);
    if (typeof username === "string" && username.trim()) {
      updateUserScore(
        username.trim(),
        rating,
        normalizedDurationMs,
        normalizedTimestamp,
      );
    }

    // Save persistent data to disk
    saveScores();

    console.log("NEW RATING:", body);
    console.log("IMAGE SCORES:", imageScores);
    console.log("PAIR SCORES:", pairScores);

    return NextResponse.json({
      status: "ok",
      received: body,
      imageScores,
      pairScores,
      userScores,
    });
  } catch (err) {
    console.error("Error processing rating:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
