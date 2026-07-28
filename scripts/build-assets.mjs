/* One-time asset pipeline: raster sources → WebP into public/assets/.
   Logos get an alpha channel (near-white → transparent) because the marquee renders them
   through `brightness(0) invert(1)` — an opaque white background would become a solid block.
   Outputs are committed; re-run only when a source logo/photo changes. */
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DL = join(homedir(), 'Downloads');

const LOGOS = [
  { src: 'Logo_Aqmos.png', out: 'public/assets/clients/aqmos.webp' },
  { src: 'Hagleitner.png', out: 'public/assets/clients/hagleitner.webp' },
  { src: 'GCS-LOGO-SHOP.png', out: 'public/assets/clients/gamechangersocks.webp' },
  { src: 'BWT.png', out: 'public/assets/clients/bwt.webp' },
  { src: 'Ecosoft.png', out: 'public/assets/clients/ecosoft.webp' },
  { src: 'BAM LOGO.png', out: 'public/assets/network/bam-creative.webp' },
  { src: 'Black_Huber_Logo.png', out: 'public/assets/network/huber.webp' }
];
/* Wipplinger ships as SVG: public/assets/network/wipplinger.svg is the source
   wipplinger-logo.svg with the viewBox cropped to the W mark (0 0 78 80). */

const PHOTOS = [
  { src: 'David-Edtmayer-Profilbild.png', out: 'public/assets/team/david-edtmayer.webp' },
  { src: 'Thomas-Jud-Profilbild.png', out: 'public/assets/team/thomas-jud.webp' }
];

/* Turn near-white pixels transparent when the image has no real alpha. */
async function whiteToAlpha(img) {
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let hasAlpha = false;
  for (let i = 3; i < data.length; i += 4) if (data[i] < 250) { hasAlpha = true; break; }
  if (!hasAlpha) {
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] > 243 && data[i + 1] > 243 && data[i + 2] > 243) data[i + 3] = 0;
    }
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } });
}

for (const { src, out } of LOGOS) {
  const p = join(DL, src);
  if (!existsSync(p)) { console.warn(`SKIP (missing): ${src}`); continue; }
  let img = await whiteToAlpha(sharp(p));
  img = img.trim({ threshold: 10 });
  await img
    .resize({ width: 600, withoutEnlargement: true })
    .webp({ nearLossless: true })
    .toFile(join(ROOT, out));
  console.log(`logo  ${src} → ${out}`);
}

for (const { src, out } of PHOTOS) {
  const p = join(DL, src);
  if (!existsSync(p)) { console.warn(`SKIP (missing): ${src}`); continue; }
  await sharp(p)
    .resize({ width: 900, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(join(ROOT, out));
  console.log(`photo ${src} → ${out}`);
}

console.log('done');
