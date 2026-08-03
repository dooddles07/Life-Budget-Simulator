// Fetches lucide icons from the Iconify API (https://api.iconify.design) and
// writes them as standalone .svg files under assets/icons/lucide/, which
// react-native-svg-transformer turns into components at bundle time. Run
// this again after adding a new icon name to ICONS below.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "assets", "icons", "lucide");

// kebab-case lucide icon names currently used across the app. Use current
// canonical names, not deprecated aliases (e.g. "triangle-alert" not
// "alert-triangle", "circle-check" not "check-circle-2", "house" not
// "home", "wand-sparkles" not "wand-2") -- resolving aliases here means one
// fewer indirection to keep track of later.
const ICONS = [
  "accessibility", "arrow-down-left", "arrow-down-right", "arrow-right",
  "arrow-up-right", "bell", "bus", "calendar-clock", "chart-pie", "check",
  "chevron-left", "chevron-right", "circle-check", "clapperboard", "coffee",
  "coins", "credit-card", "delete", "dumbbell", "flame", "graduation-cap",
  "heart-pulse", "house", "log-out", "lock", "moon", "piggy-bank", "plus",
  "repeat", "rotate-ccw", "search-x", "shopping-bag", "sparkles", "sun",
  "sun-moon", "target", "trending-down", "trending-up", "triangle-alert",
  "trophy", "user", "utensils", "vibrate", "wallet", "wand-sparkles", "x",
  "zap",
];

async function main() {
  const res = await fetch(
    `https://api.iconify.design/lucide.json?icons=${ICONS.join(",")}`,
  );
  if (!res.ok) throw new Error(`Iconify API request failed: ${res.status}`);
  const data = await res.json();

  if (data.not_found?.length) {
    throw new Error(`Icons not found on Iconify: ${data.not_found.join(", ")}`);
  }

  await mkdir(OUT_DIR, { recursive: true });

  for (const name of ICONS) {
    const icon = data.icons[name];
    const width = icon.width ?? data.width;
    const height = icon.height ?? data.height;
    // Every lucide icon hard-codes stroke-width="2" on its child paths, which
    // wins over any strokeWidth passed to the root <Svg> (explicit beats
    // inherited). Swap in a placeholder unique enough not to collide with
    // unrelated attributes (some icons have r="2"/rx="2"/x="2") so .svgrrc's
    // replaceAttrValues can safely turn it into a real prop.
    const body = icon.body.replaceAll('stroke-width="2"', 'stroke-width="__ICON_STROKE_WIDTH__"');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${body}</svg>\n`;
    await writeFile(path.join(OUT_DIR, `${name}.svg`), svg, "utf8");
  }

  console.log(`Wrote ${ICONS.length} icons to ${path.relative(process.cwd(), OUT_DIR)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
