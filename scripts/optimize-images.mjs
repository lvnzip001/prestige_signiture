import { copyFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourceDir = path.join(root, "Resources");
const originalsDir = path.join(root, "assets", "images", "originals");
const optimizedDir = path.join(root, "assets", "images", "optimized");
const iconsDir = path.join(root, "assets", "icons");

const photos = [
  ["ceo_training_waiters_2.jpg", "hero-training"],
  ["CEO2.jpg", "founder-portrait"],
  ["CEO.jpg", "founder-standing"],
  ["Ceo_waiter_traing.jpg", "coaching"],
  ["Ceo_in_meeting.jpg", "founder-meeting"],
  ["PHOTO-2026-09-18-13-54-59.jpg", "fine-dining"],
  ["table_setting.jpg", "table-setting"],
  ["waiter_setting_table.jpg", "place-setting"],
  ["waiter_serving.jpg", "table-service"],
  ["male_waiter_serving.jpg", "plate-service"],
  ["waiter_outside.jpg", "club-service"],
  ["bartender.jpg", "beverage-service"],
  ["waiter_wine_bottle.jpg", "bottle-service"],
  ["waiter_award.jpg", "credential-moment"],
  ["waiter_training.jpg", "academy-training"],
  ["waiters.jpg", "service-team"],
  ["woman waiter.jpg", "hospitality-professional"],
  ["meeting_setting.jpg", "training-room"],
];

const widths = [640, 960, 1400];

await mkdir(originalsDir, { recursive: true });
await mkdir(optimizedDir, { recursive: true });
await mkdir(iconsDir, { recursive: true });

const manifest = {};

for (const [file, name] of photos) {
  const source = path.join(sourceDir, file);
  await copyFile(source, path.join(originalsDir, file));
  const image = sharp(source, { failOn: "none" }).rotate();
  const meta = await image.metadata();
  const made = [];
  for (const width of [...new Set([...widths, meta.width])].filter(Boolean).sort((a, b) => a - b)) {
    if (meta.width && width > meta.width) continue;
    const outfile = `${name}-${width}.webp`;
    await sharp(source, { failOn: "none" })
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 76, effort: 4 })
      .toFile(path.join(optimizedDir, outfile));
    made.push(width);
  }
  if (!made.length && meta.width) {
    const outfile = `${name}-${meta.width}.webp`;
    await sharp(source, { failOn: "none" })
      .rotate()
      .webp({ quality: 76, effort: 4 })
      .toFile(path.join(optimizedDir, outfile));
    made.push(meta.width);
  }
  manifest[name] = { width: meta.width, height: meta.height, widths: made, file };
}

await copyFile(path.join(sourceDir, "logo.png"), path.join(originalsDir, "logo.png"));
await copyFile(path.join(sourceDir, "logo_main.png"), path.join(originalsDir, "logo_main.png"));
const logoMain = sharp(path.join(sourceDir, "logo_main.png")).trim({ threshold: 12 });
await logoMain.clone().png().toFile(path.join(optimizedDir, "logo-main.png"));
await logoMain.clone().resize({ width: 480, withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(optimizedDir, "logo.webp"));
const logoMeta = await sharp(path.join(optimizedDir, "logo.webp")).metadata();
manifest.logo = { width: logoMeta.width, height: logoMeta.height };
await sharp(path.join(optimizedDir, "logo-main.png"))
  .extract({ left: 560, top: 0, width: 500, height: 500 })
  .resize(180, 180)
  .png()
  .toFile(path.join(iconsDir, "apple-touch-icon.png"));
await sharp(path.join(iconsDir, "apple-touch-icon.png"))
  .resize(32, 32)
  .png()
  .toFile(path.join(iconsDir, "favicon-32.png"));

await sharp(path.join(sourceDir, "ceo_training_waiters_2.jpg"))
  .rotate()
  .resize(1200, 630, { fit: "cover", position: "right" })
  .jpeg({ quality: 78, mozjpeg: true })
  .toFile(path.join(optimizedDir, "og.jpg"));

await writeFile(path.join(optimizedDir, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`Optimized ${photos.length} photographs.`);
