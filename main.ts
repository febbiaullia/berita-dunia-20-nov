// The World Today — Friday 20 November 2026
// make.fun bounty: news-image-20261120
//
// The entry is one poster image, entry.png (1024x1024), stored in this
// repository alongside this program. All this program does is place an
// exact copy of that image at <output>/entry.png and prove the copy
// matches the original byte for byte. It needs no network and writes
// the same bytes on every run.

import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// The poster lives next to this file in the repository.
const repoDir = dirname(fileURLToPath(import.meta.url));
const posterPath = join(repoDir, "entry.png");

// The harness sets MAKEFUN_OUTPUT_DIR; fall back to /output.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const outputPath = join(outputDir, "entry.png");

if (!existsSync(posterPath)) {
  console.error(`cannot find the poster: ${posterPath}`);
  process.exit(1);
}

const poster = readFileSync(posterPath);

// A valid PNG always starts with the 8-byte signature
// 89 50 4E 47 0D 0A 1A 0A — refuse to copy a file that is not a PNG.
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!poster.subarray(0, 8).equals(pngSignature)) {
  console.error(`not a PNG file (bad signature): ${posterPath}`);
  process.exit(1);
}

console.log(`Loaded poster: ${poster.length} bytes from ${posterPath}`);
console.log(`Poster sha256: ${createHash("sha256").update(poster).digest("hex")}`);

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, poster);

// Read the copy back and compare it with the original, byte for byte.
const copy = readFileSync(outputPath);
if (copy.length !== poster.length || !copy.equals(poster)) {
  console.error(
    `copy check failed: ${outputPath} is ${copy.length} bytes, expected ${poster.length}`,
  );
  process.exit(1);
}

console.log(`Wrote ${copy.length} bytes to ${outputPath} (verified identical)`);
