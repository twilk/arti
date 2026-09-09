// ══════════════════════════════════════════════════════════════════════
//  CO TO JEST: spis rysunków. Każda kata ma swój, bo każda ćwiczy co innego.
//  CO MOŻESZ TU ZMIENIAĆ: dopisz parę „id katy → rysunek”, gdy dodajesz katę.
//  CZEGO LEPIEJ NIE RUSZAĆ: nazw kluczy - muszą zgadzać się z id w katas.ts.
//  JAK SPRAWDZIĆ, CZY DZIAŁA: npm test
// ══════════════════════════════════════════════════════════════════════
import type { ComponentType } from 'react';
import KartaPracy from './KartaPracy';
import OpisObrazu from './OpisObrazu';
import PierscienFocusu from './PierscienFocusu';
import PrzyciskWStanach from './PrzyciskWStanach';
import type { Wartosci } from './rodzaje';

export type Rysunek = ComponentType<{ w: Wartosci }>;

/**
 * Pierwsza kata miala rysunek wpisany na sztywno w silnik. Druga chciala pokazac
 * piec stanow przycisku naraz i okazalo sie, ze nie ma jak - stad ten spis.
 * Lepiej bylo sie o tym przekonac przy drugiej katcie niz przy dwudziestej.
 */
export const rysunki: Record<string, Rysunek> = {
  hierarchia: KartaPracy,
  stany: PrzyciskWStanach,
  pierscien: PierscienFocusu,
  opis: OpisObrazu,
};
