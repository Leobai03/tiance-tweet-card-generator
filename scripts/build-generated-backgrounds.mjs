import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const themes = [
  ["aurora", "#071629", "#5b32d6", "#36e0c4"], ["sunset", "#2b1535", "#ff6b35", "#ffd166"],
  ["ocean", "#031b2f", "#075985", "#38bdf8"], ["paper", "#d6c7ad", "#f3eadb", "#9b7653"],
  ["grid", "#050505", "#25214f", "#7c3aed"], ["forest", "#071a14", "#185c45", "#8fbf8f"],
  ["dawn", "#30233f", "#c76b98", "#ffd6a5"], ["ink", "#d8d8d3", "#73777a", "#171717"],
  ["neon", "#0b0520", "#6d28d9", "#06b6d4"], ["desert", "#3c2415", "#b96b32", "#f2c078"],
  ["cloud", "#176b9f", "#73b9dc", "#e5f6ff"], ["matrix", "#020805", "#063f2d", "#21d07a"]
];

const outputDir = resolve("public/backgrounds");
await mkdir(outputDir, { recursive: true });
for (const [name, dark, mid, light] of themes) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1440" viewBox="0 0 1080 1440">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${dark}"/><stop offset=".55" stop-color="${mid}"/><stop offset="1" stop-color="${light}"/></linearGradient>
    <radialGradient id="r"><stop stop-color="${light}" stop-opacity=".62"/><stop offset="1" stop-color="${dark}" stop-opacity="0"/></radialGradient>
    <filter id="n"><feTurbulence baseFrequency=".75" numOctaves="3" stitchTiles="stitch"/><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 .11 0"/></filter>
  </defs>
  <rect width="1080" height="1440" fill="url(#g)"/><circle cx="180" cy="240" r="520" fill="url(#r)"/><circle cx="910" cy="1180" r="610" fill="url(#r)" opacity=".7"/>
  <path d="M-80 1020 Q260 800 560 1040 T1180 930 V1510 H-80Z" fill="${dark}" opacity=".32"/><path d="M-100 1180 Q310 940 610 1160 T1200 1060" fill="none" stroke="${light}" stroke-opacity=".22" stroke-width="5"/>
  <rect width="1080" height="1440" filter="url(#n)" opacity=".75"/></svg>`;
  await writeFile(resolve(outputDir, `generated-${name}.svg`), svg);
}
console.log(`Generated ${themes.length} local SVG backgrounds`);
