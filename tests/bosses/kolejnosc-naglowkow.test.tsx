// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import GaleriaQuest from '@/components/quest/GaleriaQuest';
import type { Artwork } from '@/data/artworks';

afterEach(cleanup);

// Jednopikselowy obrazek. next/image odmawia dzialania z pustym blurDataURL,
// a atrapa danych ma zawiesc test tylko z tego powodu, ktorego test pilnuje.
const PIKSEL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const PRACE: Artwork[] = [
  { id: 'a', src: '/artworks/a.webp', title: 'Pierwsza', width: 100, height: 80, blurDataURL: PIKSEL },
  { id: 'b', src: '/artworks/b.webp', title: 'Druga', width: 80, height: 100, blurDataURL: PIKSEL },
];

/** Poziomy naglowkow w kolejnosci, w jakiej stoja w dokumencie. */
function poziomyNaglowkow(): number[] {
  return screen
    .getAllByRole('heading')
    .map((el) => Number(el.tagName.slice(1)))
    .filter((n) => Number.isFinite(n));
}

describe('boss:kolejnosc-naglowkow', () => {
  it('pierwszy nagłówek galerii schodzi tylko o jeden poziom pod tytuł strony', () => {
    render(<GaleriaQuest artworks={PRACE} />);
    // Strona ma nad galeria swoj tytul, czyli poziom pierwszy.
    const POZIOM_TYTULU_STRONY = 1;
    expect(poziomyNaglowkow()[0]).toBe(POZIOM_TYTULU_STRONY + 1);
  });

  it('żaden nagłówek nie przeskakuje poziomu', () => {
    render(<GaleriaQuest artworks={PRACE} />);
    const poziomy = [1, ...poziomyNaglowkow()];
    const przeskoki = poziomy
      .map((p, i) => (i === 0 ? null : p - poziomy[i - 1] > 1 ? `${poziomy[i - 1]} → ${p}` : null))
      .filter(Boolean);
    expect(przeskoki).toEqual([]);
  });

  it('tytuł pracy stoi o jeden poziom niżej niż nagłówek sekcji', () => {
    render(<GaleriaQuest artworks={PRACE} />);
    const poziomy = poziomyNaglowkow();
    // Ta czesc ma byc poprawna niezaleznie od tego, co ustawi grajaca -
    // pilnuje jej sam komponent, nie wartosc w pliku.
    expect(poziomy[1]).toBe(poziomy[0] + 1);
  });
});
