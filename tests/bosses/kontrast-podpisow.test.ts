import { describe, expect, it } from 'vitest';
import { caption, paper, title } from '@/config/quest/tokens';
import { AA_NORMAL, contrastRatio } from '@/lib/quest/contrast';

// Nazwa zestawu jest kontraktem: `npm run quest` czyta z niej id bossa.
describe('boss:kontrast-podpisow', () => {
  it('podpis pod pracą przechodzi próg WCAG AA na papierze', () => {
    expect(contrastRatio(caption, paper)).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it('tytuł pracy przechodzi próg WCAG AA na papierze', () => {
    expect(contrastRatio(title, paper)).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it('podpis jest jaśniejszy od tytułu - metadane mają być ciche', () => {
    // Gdyby "naprawa" polegala na wpisaniu czerni, podpis krzyczalby glosniej
    // niz tytul. Ten test pilnuje, ze rozwiazaniem jest wybor, nie sila.
    expect(contrastRatio(caption, paper)).toBeLessThan(contrastRatio(title, paper));
  });
});
