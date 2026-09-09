# arti

A one-page painter's portfolio. Static Next.js, no CMS and no database: the gallery is
generated from the image files in `sources/`.

## Adding an artwork

1. Drop the image into `sources/` (`.jpg` `.jpeg` `.png` `.webp` `.avif` `.tif`).
2. Commit and push.

That is the whole process. `prepare-artworks` runs automatically before `dev` and `build`,
so Vercel regenerates the gallery on every deploy. No component is ever edited to add,
remove or reorder a work.

**Order** follows a natural sort of the filenames, so prefixing them (`01_`, `02_`, …)
sets the sequence in the gallery.

**Titles and metadata** are read from the filename, and only when they are actually there:

| filename | title | year | dimensions |
| --- | --- | --- | --- |
| `blue_monday.jpg` | Blue Monday | — | — |
| `blue_monday_2024.jpg` | Blue Monday | 2024 | — |
| `blue_monday_2024_100x80.jpg` | Blue Monday | 2024 | 100 × 80 cm |

Nothing is inferred beyond this. A file with no year in its name simply shows no year.

**Resolution.** Sources are delivered at up to 2400px on the long edge and are never
upscaled, so a small source keeps its proportions but looks soft. The script warns about
any file under 1200px wide.

`sources/` is treated as immutable: the script only reads from it and writes derivatives
to `public/artworks/`, which is generated output — do not edit it by hand.

## Artist details

Everything identifying the artist lives in [`config/site.ts`](config/site.ts): name,
location, discipline, bio, email, Instagram. Values marked `PLACEHOLDER` there are not
real data and should be replaced. `instagram` is `null`, which hides the link entirely
rather than pointing at an invented handle.

## Commands

```bash
npm run dev         # http://localhost:3000 (regenerates artworks first)
npm run build       # production build (regenerates artworks first)
npm run artworks    # regenerate artworks only
npm run typecheck   # tsc --noEmit
npm test            # every test
npm run test:szybko # skips the component-rendering tests, which cost ~7s of jsdom startup
npm run proba       # clones into a temp dir and walks the newcomer path end to end (~4 min)
```

## Layout

```
sources/                    original files, never modified
scripts/prepare-artworks.mjs
public/artworks/            generated WebP derivatives
public/og.jpg               generated social card
data/artworks.json          generated manifest
data/artworks.ts            typed accessor
config/site.ts              artist details
components/                 Header, Gallery, Artwork, Lightbox, About, Contact
app/                        layout, page, globals.css, robots, sitemap, icon
```

The gallery is a CSS multi-column masonry, so portrait, square and landscape works sit
together at their own natural proportions — nothing is cropped or stretched to a common
box. The lightbox is a native `<dialog>`, which supplies the focus trap and inert
background; Escape, arrow keys, backdrop click and the close button all dismiss it.
