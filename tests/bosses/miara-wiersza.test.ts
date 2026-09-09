import { describe, expect, it } from 'vitest';
import { miaraWiersza } from '@/config/quest/tokens';

// Przedzial, ktorego trzyma sie typografia od stuleci.
const NAJKROCEJ = 45;
const NAJDLUZEJ = 75;

describe('boss:miara-wiersza', () => {
  it('wiersz nie jest za długi', () => {
    expect(miaraWiersza).toBeLessThanOrEqual(NAJDLUZEJ);
  });

  it('wiersz nie jest za krótki', () => {
    expect(miaraWiersza).toBeGreaterThanOrEqual(NAJKROCEJ);
  });
});
