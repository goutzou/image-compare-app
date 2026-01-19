import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const folder = path.join(process.cwd(), "public/images");
  const files = fs.readdirSync(folder).filter((f) => f.endsWith(".jpeg"));

  if (files.length < 2) {
    return NextResponse.json(
      { error: "Need at least 2 images" },
      { status: 500 }
    );
  }

  // random unique pair
  const idx1 = Math.floor(Math.random() * files.length);
  let idx2 = Math.floor(Math.random() * files.length);
  while (idx2 === idx1) {
    idx2 = Math.floor(Math.random() * files.length);
  }

  const imgA = `/images/${files[idx1]}`;
  const imgB = `/images/${files[idx2]}`;

  return NextResponse.json({ imgA, imgB });
}
