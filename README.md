# arti

Two things share this repository.

**The site** — a one-page painter's portfolio. Static Next.js, no CMS and no database:
the gallery is generated from the image files in `sources/`. Live at
[arti-gallery.vercel.app](https://arti-gallery.vercel.app).

**The quest** — a training harness wrapped around that site, for someone learning UI/UX
design. It lives behind an environment flag and is absent from the production build.
Its interface and documentation are in Polish, because its single user is; see
[`QUEST.md`](QUEST.md).

## Where everything lives

| | |
| --- | --- |
| **Site** | **https://arti-gallery.vercel.app** — the canonical address; this is the one to share |
| Repository | https://github.com/twilk/arti — public, deploys from `main` |
| Vercel project | https://vercel.com/wilczyy-2955s-projects/arti — dashboard, logs, deployments |

The site answers on more than one address, and it is worth knowing which is which:

| address | responds | what it is |
| --- | --- | --- |
| `arti-gallery.vercel.app` | 200 | canonical: named in `<link rel="canonical">`, Open Graph and the sitemap |
| `arti-olive-iota.vercel.app` | 200 | assigned automatically by Vercel; serves the same site, points nowhere in the metadata |
| `arti-wilczyy-2955s-projects.vercel.app` | 302 → Vercel SSO | team-scoped; regenerated on every production deploy and cannot be removed for good. Anonymous visitors get a login page, not the site |
| `arti-git-main-wilczyy-2955s-projects.vercel.app` | 302 → Vercel SSO | the same, for the `main` branch |
| `arti.vercel.app` | 451 | **not ours.** Held by a disabled project on an unrelated Vercel account; `vercel alias set` refuses it as already in use |

Endpoints worth checking after a deploy — all 200:

```
/            /robots.txt    /sitemap.xml    /og.jpg    /icon.svg
```

`/dev/mission` returns **404** in production, and that is the point: the quest is not
in the production build at all.

---

# The site

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
A year in the middle of a name stays part of the title: `studio_1993_notes` is titled
"Studio 1993 Notes", not "Studio Notes" from 1993.

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

## How the gallery behaves

A CSS multi-column masonry, so portrait, square and landscape works sit together at their
own natural proportions — nothing is cropped or stretched to a common box. The lightbox
is a native `<dialog>`, which supplies the focus trap and inert background; Escape, arrow
keys, backdrop click and the close button all dismiss it.

Guarded at 0, 1, 2 and 20 artworks: with one work the arrows are hidden, with twenty all
render and all but the first few stay lazy, and with none the empty state says what to do.

---

# The quest

Five **bosses** — defects seeded into a practice copy of the gallery, each wrapped in a
comment block with the problem, what it means for a person, and the fix commented out
underneath. Their health is counted by tests, so a boss dies when its test goes green.

Four **katas** — short exercises with a sandbox, a fifteen-minute timer, a design
commentary and a place to write down one sentence of your own. Everything is adjusted
with sliders and text fields; no file needs to be opened.

Two **players** — agents that walk the site on a phone and on a desktop, doing seventeen
kinds of deliberately unplanned things, and run ten kinds of check after every move.
Findings are graded in four levels and every run is reproducible from its seed, so a
finding can become a test and a test can become a boss.

## Commands

```bash
npm run quest            # what to do today; runs the boss tests and draws the screen
npm run quest:dev        # dev server with the quest enabled
npm run gracze           # send the two players round the site
npm run gracze:lokalnie  # build, serve, patrol every screen, tear down
```

With the quest running: `/dev/mission` is the base, `/dev/quest` the practice copy,
`/dev/kata/<id>` a single exercise.

## Why it cannot reach production

Quest routes are named `page.quest.tsx` and `route.quest.ts`. Next only treats those as
routes when `NEXT_PUBLIC_QUEST=1` adds `quest.tsx` to `pageExtensions`, so without the
flag they are not routes, not in the bundle and not in the sitemap. This is not a
component checking a variable at runtime — the code is not there at all.

`tests/project/produkcja-bez-harnessu.test.ts` keeps it that way: it fails if any route
under `app/dev` loses its quest extension, and if anything outside the quest imports
from it.

---

## Commands (all)

```bash
npm run dev              # http://localhost:3000 (regenerates artworks first)
npm run build            # production build (regenerates artworks first)
npm run artworks         # regenerate artworks only
npm run typecheck        # tsc --noEmit
npm test                 # every test
npm run test:szybko      # skips component-rendering tests, which cost ~7s of jsdom startup
npm run proba            # clones into a temp dir and walks the newcomer path end to end (~4 min)
npm run sprawdz          # every check below, cheapest first, stops at the first failure
npm run sprawdz -- --szybko   # only the fast four, for the working loop
```

`npm run sprawdz` runs types, fast tests, all tests, the production build, a player
patrol and the from-scratch trial — in that order, because waiting four minutes to learn
that TypeScript does not compile is four minutes wasted.

## Layout

```
sources/                     original files, never modified
public/artworks/             generated WebP derivatives
public/og.jpg                generated social card
data/artworks.json           generated manifest
data/artworks.ts             typed accessor
config/site.ts               artist details
components/                  Header, Gallery, Artwork, Lightbox, About, Contact
app/                         layout, page, globals.css, robots, sitemap, icon

app/dev/                     quest routes — page.quest.tsx only
components/quest/            quest components, including rysunki/ (one drawing per kata)
config/quest/                bosses, katas, the values she toggles
lib/quest/                   contrast, the daily-task rule, boss ordering
scripts/gracze/              the two players: moves and checks
.quest/                      game data: baseline, boss state, progress, findings
QUEST.md                     her instructions, in Polish, one screen

tests/project/               82 checks that must stay green
tests/bosses/                boss tests — red on purpose, that is what keeps them alive
```

## A note on language

The site is in English; the quest is in Polish. That split is deliberate, not an
oversight: the portfolio is meant for anyone, the harness has one user. Code identifiers
follow the language of the thing they belong to — English on the site, Polish in the quest,
where a file she opens should read as prose to her.
