export const runtime = "nodejs";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

type ScoreEntry = {
  total: number;
  votes: number;
  totalTimeMs?: number;
  timeVotes?: number;
  avgTimeMs?: number;
};

type ScoresFile = {
  imageScores: Record<string, ScoreEntry>;
  pairScores: Record<string, ScoreEntry>;
};

function loadScores(): ScoresFile {
  const filePath = path.resolve("./data/scores.json");
  if (!fs.existsSync(filePath)) {
    return { imageScores: {}, pairScores: {} };
  }

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw) as ScoresFile;
  } catch {
    return { imageScores: {}, pairScores: {} };
  }
}

function toCsv(scores: ScoresFile) {
  const header = "imgA,imgB,total,votes,avg,totalTimeMs,timeVotes,avgTimeMs";
  const rows = Object.entries(scores.pairScores).map(([key, score]) => {
    const [imgA, imgB] = key.split("__");
    const avg = score.votes > 0 ? score.total / score.votes : 0;
    const timeVotes = score.timeVotes || 0;
    const avgTimeMs =
      typeof score.avgTimeMs === "number"
        ? score.avgTimeMs
        : timeVotes > 0 && typeof score.totalTimeMs === "number"
          ? score.totalTimeMs / timeVotes
          : 0;
    return [
      imgA || "",
      imgB || "",
      String(score.total),
      String(score.votes),
      avg.toFixed(4),
      String(score.totalTimeMs ?? 0),
      String(timeVotes),
      avgTimeMs.toFixed(2),
    ]
      .map((val) => `"${val.replaceAll(`"`, `""`)}"`)
      .join(",");
  });

  return [header, ...rows].join("\n");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const format = (searchParams.get("format") || "json").toLowerCase();
  const scores = loadScores();

  if (format === "csv") {
    const csv = toCsv(scores);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="pair-scores.csv"',
      },
    });
  }

  return NextResponse.json(scores, {
    headers: {
      "Content-Disposition": 'attachment; filename="scores.json"',
    },
  });
}
