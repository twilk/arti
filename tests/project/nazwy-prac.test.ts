import { describe, expect, it } from 'vitest';
import { parseFilename, slugify } from '../../scripts/prepare-artworks.mjs';

/**
 * To z nazwy pliku bierze sie tytul pracy widoczny na stronie i w opisie dla
 * czytnika ekranu. Pomylka tutaj nie wysypuje niczego - po prostu praca nazywa
 * sie inaczej, niz malarka chciala, i nikt tego nie zauwaza.
 */
describe('slugify', () => {
  it('robi z nazwy adres bez polskich znaków', () => {
    expect(slugify('Żółta łąka')).toBe('zolta-laka');
    expect(slugify('Ćma nad źródłem')).toBe('cma-nad-zrodlem');
  });

  it('skleja odstępy i znaki specjalne w pojedyncze myślniki', () => {
    expect(slugify('Blue   Monday!!!')).toBe('blue-monday');
    expect(slugify('  akt   III  ')).toBe('akt-iii');
  });

  it('nie zostawia myślnika na początku ani na końcu', () => {
    expect(slugify('---nokturn---')).toBe('nokturn');
  });
});

describe('parseFilename', () => {
  it('sama nazwa daje sam tytuł, bez zmyślania reszty', () => {
    expect(parseFilename('blue_monday')).toEqual({
      title: 'Blue Monday',
      year: undefined,
      dimensions: undefined,
    });
  });

  it('czyta rok, gdy stoi na końcu', () => {
    const wynik = parseFilename('blue_monday_2024');
    expect(wynik.title).toBe('Blue Monday');
    expect(wynik.year).toBe(2024);
  });

  it('czyta wymiary i podaje je z jednostką', () => {
    const wynik = parseFilename('blue_monday_2024_100x80');
    expect(wynik.title).toBe('Blue Monday');
    expect(wynik.year).toBe(2024);
    expect(wynik.dimensions).toBe('100 × 80 cm');
  });

  it('nie obcina liczby, która jest częścią tytułu', () => {
    // "studio 1993 notes" - rok w srodku nazwy nie jest metadanymi, tylko tytulem.
    const wynik = parseFilename('studio_1993_notes');
    expect(wynik.title).toBe('Studio 1993 Notes');
    expect(wynik.year).toBeUndefined();
  });

  it('nie zjada całej nazwy, gdy składa się z samego roku', () => {
    const wynik = parseFilename('2024');
    expect(wynik.title).toBe('2024');
  });

  it('zostawia własne pisanie wielkimi literami', () => {
    expect(parseFilename('AKT').title).toBe('AKT');
    expect(parseFilename('McDonald_portret').title).toBe('McDonald Portret');
  });

  it('radzi sobie z myślnikami zamiast podkreśleń', () => {
    const wynik = parseFilename('zolta-laka-2019-70x50');
    expect(wynik.title).toBe('Zolta Laka');
    expect(wynik.year).toBe(2019);
    expect(wynik.dimensions).toBe('70 × 50 cm');
  });
});
