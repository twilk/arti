/**
 * sources/  ->  public/artworks/  +  data/artworks.json
 *
 * Reads every supported image in /sources, produces one web-ready WebP derivative
 * per file and writes a manifest the site consumes. Originals are never modified.
 *
 * Adding a new artwork = drop a file into /sources and run `npm run artworks`
 * (also runs automatically before `dev` and `build`).
 *
 * Optional metadata can be encoded in the filename and is parsed only when present:
 *   blue_monday_2024_100x80.jpg  ->  "Blue Monday", 2024, 100 x 80 cm
 * Nothing is ever invented: a filename without extras yields a title and nothing more.
 */

import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const SOURCES_DIR = path.join(ROOT, 'sources');
const OUT_DIR = path.join(ROOT, 'public', 'artworks');
const MANIFEST = path.join(ROOT, 'data', 'artworks.json');
const CACHE = path.join(ROOT, '.artworks-cache.json');

const SUPPORTED = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tif', '.tiff']);
const MAX_EDGE = 2400; // long edge of the delivered image; never upscales past the original
const QUALITY = 82;
const PLACEHOLDER_WIDTH = 16;
const OG_BACKGROUND = { r: 246, g: 245, b: 242 }; // keep in sync with --color-paper
// Widest a gallery column gets (2 columns inside a 1400px shell), doubled for retina.
// Anything narrower than this is delivered upscaled by the browser and looks soft.
const CRISP_WIDTH = 1200;

/** Latin-ise Polish diacritics so slugs stay URL-safe and stable. */
const DIACRITICS = { ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z' };

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (ch) => DIACRITICS[ch])
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Splits a filename stem into a readable title plus whatever metadata is encoded
 * at the end of it. Only trailing tokens are consumed, so a title containing a
 * number (e.g. "studio_1993_notes") is not silently truncated mid-word.
 */
function parseFilename(stem) {
  const tokens = stem.split(/[_\-\s]+/).filter(Boolean);
  let year;
  let dimensions;

  while (tokens.length > 1) {
    const last = tokens[tokens.length - 1];
    const size = /^(\d{1,4})\s*[x×]\s*(\d{1,4})$/i.exec(last);
    const yr = /^(18|19|20)\d{2}$/.exec(last);

    if (size && !dimensions) {
      dimensions = `${Number(size[1])} × ${Number(size[2])} cm`;
      tokens.pop();
      continue;
    }
    if (yr && !year) {
      year = Number(last);
      tokens.pop();
      continue;
    }
    break;
  }

  const title = tokens
    .map((word) => (word === word.toLowerCase() ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ');

  return { title: title || stem, year, dimensions };
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

async function main() {
  let entries;
  try {
    entries = await fs.readdir(SOURCES_DIR, { withFileTypes: true });
  } catch {
    console.warn('[artworks] no /sources directory - writing an empty manifest.');
    await fs.mkdir(path.dirname(MANIFEST), { recursive: true });
    await fs.writeFile(MANIFEST, '[]\n');
    return;
  }

  const files = entries
    .filter((entry) => entry.isFile() && SUPPORTED.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    // Natural sort: prefixing files with 01_, 02_ is enough to control gallery order.
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' }));

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(path.dirname(MANIFEST), { recursive: true });

  const cache = await readJson(CACHE, {});
  const nextCache = {};
  const manifest = [];
  const usedIds = new Set();
  let processed = 0;
  let reused = 0;

  for (const name of files) {
    const sourcePath = path.join(SOURCES_DIR, name);
    const stem = path.basename(name, path.extname(name));
    const { title, year, dimensions } = parseFilename(stem);

    let id = slugify(stem) || 'artwork';
    if (usedIds.has(id)) {
      let suffix = 2;
      while (usedIds.has(`${id}-${suffix}`)) suffix += 1;
      id = `${id}-${suffix}`;
    }
    usedIds.add(id);

    const buffer = await fs.readFile(sourcePath);
    const hash = createHash('sha1').update(buffer).digest('hex');
    const outPath = path.join(OUT_DIR, `${id}.webp`);

    const cached = cache[id];
    const outExists = await fs.access(outPath).then(() => true, () => false);

    let width;
    let height;
    let blurDataURL;

    if (cached && cached.hash === hash && outExists) {
      ({ width, height, blurDataURL } = cached);
      reused += 1;
    } else {
      // .rotate() applies EXIF orientation, so portrait phone shots are not delivered sideways.
      // withoutEnlargement keeps low-resolution sources sharp instead of upscaling them to mush.
      const pipeline = sharp(buffer).rotate().resize({
        width: MAX_EDGE,
        height: MAX_EDGE,
        fit: 'inside',
        withoutEnlargement: true,
      });

      const { data, info } = await pipeline
        .clone()
        .webp({ quality: QUALITY, effort: 5 })
        .toBuffer({ resolveWithObject: true });

      await fs.writeFile(outPath, data);
      width = info.width;
      height = info.height;

      const placeholder = await pipeline
        .clone()
        .resize({ width: PLACEHOLDER_WIDTH })
        .webp({ quality: 40 })
        .toBuffer();
      blurDataURL = `data:image/webp;base64,${placeholder.toString('base64')}`;

      processed += 1;
      console.log(`[artworks] ${name} -> artworks/${id}.webp (${width}x${height})`);
    }

    if (width < CRISP_WIDTH) {
      console.warn(
        `[artworks] warning: ${name} is only ${width}px wide. It keeps its proportions, but will look ` +
          `soft at gallery size - a source of at least ${CRISP_WIDTH}px is recommended.`,
      );
    }

    nextCache[id] = { hash, width, height, blurDataURL };
    manifest.push({
      id,
      src: `/artworks/${id}.webp`,
      title,
      width,
      height,
      blurDataURL,
      ...(year ? { year } : {}),
      ...(dimensions ? { dimensions } : {}),
    });
  }

  // Social card: the first artwork laid on the same paper tone the site uses, letterboxed
  // rather than cropped, at the 1200x630 every platform expects.
  if (manifest.length > 0) {
    const first = path.join(OUT_DIR, `${manifest[0].id}.webp`);
    await sharp(first)
      .resize({ width: 1200, height: 630, fit: 'contain', background: OG_BACKGROUND })
      .flatten({ background: OG_BACKGROUND })
      .jpeg({ quality: 85 })
      .toFile(path.join(ROOT, 'public', 'og.jpg'));
    console.log('[artworks] og.jpg regenerated from', manifest[0].id);
  }

  // Drop derivatives whose source disappeared, so /public never accumulates orphans.
  const existing = await fs.readdir(OUT_DIR).catch(() => []);
  const keep = new Set(manifest.map((item) => `${item.id}.webp`));
  for (const file of existing) {
    if (!keep.has(file)) {
      await fs.unlink(path.join(OUT_DIR, file));
      console.log(`[artworks] removed orphan artworks/${file}`);
    }
  }

  await fs.writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  await fs.writeFile(CACHE, `${JSON.stringify(nextCache, null, 2)}\n`);

  console.log(
    `[artworks] ${manifest.length} artwork(s): ${processed} processed, ${reused} reused from cache.`,
  );
}

main().catch((error) => {
  console.error('[artworks] failed:', error);
  process.exit(1);
});
