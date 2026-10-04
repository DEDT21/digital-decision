/* One-time asset pipeline: raster sources → WebP into public/assets/.
   Logos get an alpha channel (near-white → transparent) because the marquee renders them
   through `brightness(0) invert(1)` — an opaque white background would become a solid block.
   Outputs are committed; re-run only when a source logo/photo changes.

   Größen (Stand Oktober 2026):
   - Logos: 96 px Höhe. Angezeigt werden sie mit rund 30–48 px Höhe, 96 px deckt also
     2x-Displays ab. Mehr kostet nur Bytes.
   - Teamfotos: 900 px Basisdatei plus -160/-400/-800.webp für srcset.
   - public/logo-512.png: Logo fürs JSON-LD (Google will ein Rasterbild). Entsteht aus dem
     Marken-SVG im Repo und braucht keine Quelldatei aus ~/Downloads.

   Aufruf: npm run assets            → alles
           npm run assets -- logos   → nur Logos (bzw. photos, brand) */
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DL = join(homedir(), 'Downloads');
const ONLY = process.argv[2];
const run = (step) => !ONLY || ONLY === step;

const LOGO_HEIGHT = 96;
const PHOTO_WIDTH = 900;
const PHOTO_VARIANTS = [160, 400, 800];

const LOGOS = [
  { src: 'Logo_Aqmos.png', out: 'public/assets/clients/aqmos.webp' },
  { src: 'GCS-LOGO-SHOP.png', out: 'public/assets/clients/gamechangersocks.webp' },
  { src: 'BAM LOGO.png', out: 'public/assets/network/bam-creative.webp' },
  { src: 'Black_Huber_Logo.png', out: 'public/assets/network/huber.webp' }
];
/* hagi.webp, bwt.webp und ecosoft.webp (Stand 04.10.2026) kamen bereits weiß auf transparentem
   Grund und sind direkt als 96px-WebP eingecheckt. NICHT über diese Pipeline neu erzeugen:
   whiteToAlpha würde die weißen Logos komplett transparent machen. */
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

if (run('logos')) {
  for (const { src, out } of LOGOS) {
    const p = join(DL, src);
    if (!existsSync(p)) { console.warn(`SKIP (missing): ${src}`); continue; }
    let img = await whiteToAlpha(sharp(p));
    img = img.trim({ threshold: 10 }); /* sharp trimmt vor dem Skalieren */
    await img
      .resize({ height: LOGO_HEIGHT, withoutEnlargement: true })
      .webp({ nearLossless: true, effort: 6 })
      .toFile(join(ROOT, out));
    console.log(`logo  ${src} → ${out} (${LOGO_HEIGHT}px hoch)`);
  }
}

if (run('photos')) {
  for (const { src, out } of PHOTOS) {
    const p = join(DL, src);
    if (!existsSync(p)) { console.warn(`SKIP (missing): ${src}`); continue; }
    await sharp(p)
      .resize({ width: PHOTO_WIDTH, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(join(ROOT, out));
    console.log(`photo ${src} → ${out}`);
    for (const w of PHOTO_VARIANTS) {
      const variant = out.replace(/\.webp$/, `-${w}.webp`);
      await sharp(p)
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: 80, effort: 6 })
        .toFile(join(ROOT, variant));
      console.log(`photo ${src} → ${variant}`);
    }
  }
}

if (run('brand')) {
  /* Ink-Wellenmarke zentriert auf weißem Quadrat, ca. 64 % der Fläche. */
  const mark = readFileSync(join(ROOT, 'public/assets/dd-mark-ink.svg'), 'utf8')
    .replace(/<\?xml[^>]*\?>/, '').replace(/<svg[^>]*>/, '').replace('</svg>', '');
  const size = 512;
  const h = 330;
  const w = Math.round(h * 254 / 265); /* Seitenverhältnis der Marke: 254×265 */
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#FFFFFF"/>
  <svg x="${(size - w) / 2}" y="${(size - h) / 2}" width="${w}" height="${h}" viewBox="0 0 254 265">${mark}</svg>
</svg>`;
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: true }).toFile(join(ROOT, 'public/logo-512.png'));
  console.log('brand dd-mark-ink.svg → public/logo-512.png');
}

console.log('done');
