import { describe, expect, it } from 'vitest';
import { contrastRatio } from '@/lib/quest/contrast';

// Narzedzie, na ktorym opieraja sie bossy, musi byc sprawdzone niezaleznie od nich.
// Wartosci referencyjne policzone recznie z normy WCAG 2.1.
describe('contrastRatio', () => {
  it('czarny na białym to 21:1', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
  });

  it('ten sam kolor to 1:1', () => {
    expect(contrastRatio('#66645c', '#66645c')).toBeCloseTo(1, 5);
  });

  it('jest symetryczny - kolejność argumentów nie zmienia wyniku', () => {
    expect(contrastRatio('#66645c', '#f6f5f2')).toBeCloseTo(contrastRatio('#f6f5f2', '#66645c'), 10);
  });

  it('zgadza się z wartością policzoną ręcznie dla pary z prawdziwej strony', () => {
    // #66645c na #f6f5f2 - ta para jest uzyta w produkcyjnym globals.css.
    expect(contrastRatio('#66645c', '#f6f5f2')).toBeCloseTo(5.44, 1);
  });

  it('rozumie zapis trzyznakowy', () => {
    expect(contrastRatio('#000', '#fff')).toBeCloseTo(21, 5);
  });

  it('odrzuca śmieci zamiast po cichu zwracać liczbę', () => {
    expect(() => contrastRatio('niebieski', '#fff')).toThrow();
  });
});
