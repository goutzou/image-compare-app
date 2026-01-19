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
function loadScores() {
  if (!fs.existsSync(FILE_PATH)) {
    return { imageScores: {}, pairScores: {} };
  }

  try {
    const raw = fs.readFileSync(FILE_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading scores.json:", err);
    return { imageScores: {}, pairScores: {} };
  }
}

// Global in-memory cache (synced with JSON file)
let { imageScores, pairScores } = loadScores();

// ------------------------------------------------------------
// SAVE SCORES TO DISK
// ------------------------------------------------------------
function saveScores() {
  const data = JSON.stringify({ imageScores, pairScores }, null, 2);

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
function updatePairScore(imgA: string, imgB: string, rating: number) {
  const key = [imgA, imgB].sort().join("__");

  if (!pairScores[key]) {
    pairScores[key] = { total: 0, votes: 0 };
  }
  pairScores[key].total += rating;
  pairScores[key].votes += 1;
}

// ------------------------------------------------------------
// POST HANDLER
// ------------------------------------------------------------
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imgA, imgB, rating, timestamp } = body;

    if (!imgA || !imgB || typeof rating !== "number") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    updateImageScore(imgA, rating);
    updateImageScore(imgB, rating);
    updatePairScore(imgA, imgB, rating);

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
    });
  } catch (err) {
    console.error("Error processing rating:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
