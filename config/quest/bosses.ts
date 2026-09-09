// ══════════════════════════════════════════════════════════════════════
//  CO TO JEST: typy do opisów bossów. Same opisy leżą w bosses.mjs,
//              bo czyta je także komenda w terminalu.
//  CO MOŻESZ TU ZMIENIAĆ: nic. Teksty poprawia się w bosses.mjs.
//  CZEGO LEPIEJ NIE RUSZAĆ: całości.
//  JAK SPRAWDZIĆ, CZY DZIAŁA: npm test
// ══════════════════════════════════════════════════════════════════════

import { bosses as dane, bossById as wgId } from './bosses.mjs';

export type Difficulty = 'łatwy' | 'średni' | 'trudny';

export type Boss = {
  /** Musi zgadzać się z `boss:<id>` w nazwie zestawu testów. */
  id: string;
  name: string;
  difficulty: Difficulty;
  /** Gdzie leży defekt - plik, który ona otwiera. */
  where: string;
  /** Bez żargonu. To jest lekcja, nie ozdoba. */
  meaning: string;
  /** Kierunek, nie łatka do wklejenia. */
  hint: string;
  /** Czy to jest problem projektanta, czy dewelopera - i dlaczego. */
  whose: string;
};

export const bosses: Boss[] = dane as Boss[];
export const bossById: Map<string, Boss> = wgId as Map<string, Boss>;
