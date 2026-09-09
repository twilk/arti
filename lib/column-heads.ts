/**
 * Which artworks sit at the top of a masonry column.
 *
 * The gallery is a CSS multi-column masonry, and the browser balances those columns
 * by height. That means visual order is not DOM order: with two columns the fourth
 * artwork in the markup can be the first thing you see on the right-hand side, above
 * the fold. Priming only the first few DOM items therefore leaves the largest visible
 * image lazy-loaded, which is exactly what happened here - the measured LCP element
 * was artwork index 3 with loading="lazy".
 *
 * CSS multicol fills greedily up to the balanced column height, so the split is
 * predictable from the aspect ratios we already have in the manifest.
 */

type Sized = { width: number; height: number };

/** Caption plus bottom margin under each artwork, in units of column width. */
const CHROME_RATIO = 0.18;

/**
 * Indices that begin a column when `items` are laid out in `columns` balanced columns.
 * Index 0 always begins the first column, so the result is never empty.
 */
export function columnHeadIndices(items: Sized[], columns: number): number[] {
  if (items.length === 0) return [];
  if (columns <= 1) return [0];

  // Heights are relative to column width, so the unit cancels out of the comparison.
  const heights = items.map((item) => item.height / item.width + CHROME_RATIO);
  const target = heights.reduce((sum, h) => sum + h, 0) / columns;

  const heads = [0];
  let running = 0;
  for (let i = 0; i < heights.length; i += 1) {
    // Break before an item only once the column already carries at least half its
    // share, mirroring how multicol avoids leaving a column nearly empty.
    if (running >= target - heights[i] / 2 && heads.length < columns && i > 0) {
      heads.push(i);
      running = heights[i];
    } else {
      running += heights[i];
    }
  }
  return heads;
}

/**
 * Artwork indices worth loading eagerly: the head of every column at each layout the
 * gallery can adopt. One column on mobile, two from the `md` breakpoint up.
 */
export function eagerIndices(items: Sized[], columnCounts: number[] = [1, 2]): Set<number> {
  const eager = new Set<number>();
  for (const columns of columnCounts) {
    for (const index of columnHeadIndices(items, columns)) eager.add(index);
  }
  return eager;
}
