import { describe, expect, it } from 'vitest';
import { wysokoscPrzycisku } from '@/config/quest/tokens';

// Norma WCAG 2.5.8 mowi o 24 pikselach. 44 to szerokosc opuszki kciuka,
// czyli granica miedzy "da sie trafic" a "trafia sie za pierwszym razem".
const NORMA = 24;
const KCIUK = 44;

describe('boss:cel-dotkniecia', () => {
  it('przycisk spełnia minimum normy WCAG 2.5.8', () => {
    expect(wysokoscPrzycisku).toBeGreaterThanOrEqual(NORMA);
  });

  it('przycisk da się trafić kciukiem za pierwszym razem', () => {
    expect(wysokoscPrzycisku).toBeGreaterThanOrEqual(KCIUK);
  });

  it('przycisk nie jest absurdalnie wielki', () => {
    // Rozwiazaniem jest trafialnosc, nie rozmiar. Wielki przycisk na cichej
    // stronie z obrazami krzyczy glosniej niz prace.
    expect(wysokoscPrzycisku).toBeLessThanOrEqual(72);
  });
});
