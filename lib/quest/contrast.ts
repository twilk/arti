// ══════════════════════════════════════════════════════════════════════
//  CO TO JEST: liczenie kontrastu dwoch kolorow wedlug WCAG 2.1.
//  CO MOŻESZ TU ZMIENIAĆ: nic - to jest wzor z normy, nie kwestia gustu.
//  CZEGO LEPIEJ NIE RUSZAĆ: całości.
//  JAK SPRAWDZIĆ, CZY DZIAŁA: npx vitest run tests/quest/contrast.test.ts
// ══════════════════════════════════════════════════════════════════════

/** Prog WCAG AA dla zwyklego tekstu. */
export const AA_NORMAL = 4.5;
/** Prog WCAG AA dla tekstu duzego (>=24px, lub >=18.66px pogrubionego). */
export const AA_LARGE = 3;

function toRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) throw new Error(`Nieprawidłowy kolor: ${hex}`);
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

/** Luminancja wzgledna wedlug WCAG: kanaly sRGB linearyzowane, potem wazona suma. */
function luminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Stosunek kontrastu, od 1 (brak roznicy) do 21 (czarny na bialym). */
export function contrastRatio(foreground: string, background: string): number {
  const a = luminance(foreground);
  const b = luminance(background);
  const [lighter, darker] = a > b ? [a, b] : [b, a];
  return (lighter + 0.05) / (darker + 0.05);
}

/** Zaokraglony do dwoch miejsc, do wyswietlania w interfejsie. */
export function contrastLabel(foreground: string, background: string): string {
  return `${contrastRatio(foreground, background).toFixed(2)}:1`;
}
