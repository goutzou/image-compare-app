import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function listImages(folderName: string) {
  const folder = path.join(
    process.cwd(),
    "public/images",
    folderName,
  );
  const entries = fs.readdirSync(folder);
  const images = entries
    .filter((file) => /\.(png|jpe?g)$/i.test(file))
    .sort((a, b) => a.localeCompare(b));

  return images.map((file) => ({
    file,
    url: `/images/${folderName}/${encodeURIComponent(file)}`,
  }));
}

export async function GET() {
  const differentImages = listImages("Different_Pictographs");
  const similarImages = listImages("Similar_Pictographs");

  if (differentImages.length + similarImages.length < 2) {
    return NextResponse.json(
      { error: "Need at least 2 images" },
      { status: 500 },
    );
  }

  const differentPairs: Array<{ imgA: string; imgB: string }> = [];
  for (let i = 0; i < differentImages.length; i += 1) {
    for (let j = i + 1; j < differentImages.length; j += 1) {
      differentPairs.push({
        imgA: differentImages[i].url,
        imgB: differentImages[j].url,
      });
    }
  }

  const similarPairs: Array<{ imgA: string; imgB: string }> = [];
  for (let i = 0; i + 1 < similarImages.length; i += 2) {
    similarPairs.push({
      imgA: similarImages[i].url,
      imgB: similarImages[i + 1].url,
    });
  }

  return NextResponse.json({
    similarPairs,
    differentPairs,
    count: similarPairs.length + differentPairs.length,
  });
}
