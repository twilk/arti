// ══════════════════════════════════════════════════════════════════════
//  CO TO JEST: typowana nakładka na zasadę wyboru dzisiejszego bossa.
//  CO MOŻESZ TU ZMIENIAĆ: zdania w `dlaczegoTen`.
//  CZEGO LEPIEJ NIE RUSZAĆ: sama zasada siedzi w kolejnosc-bossow.mjs,
//                           bo korzysta z niej też komenda w terminalu.
//  JAK SPRAWDZIĆ, CZY DZIAŁA: npm test
// ══════════════════════════════════════════════════════════════════════

import type { Boss } from '@/config/quest/bosses';
import { wybierzBossaNaDzis } from './kolejnosc-bossow.mjs';

export type StanBossa = { id: string; hp: number; maxHp: number };

/** Najłatwiejszy z żywych, a wśród równych ten najbliżej pokonania. */
export function bossNaDzis(bossowie: Boss[], stan: StanBossa[]): Boss | null {
  return (wybierzBossaNaDzis(bossowie, stan) as Boss | null) ?? null;
}

/** Jedno zdanie o tym, dlaczego akurat ten. Pokazywane obok zadania. */
export function dlaczegoTen(boss: Boss, ilu: number): string {
  if (ilu === 1) return 'To jedyny boss, który jeszcze żyje.';
  if (boss.difficulty === 'łatwy') return 'Najłatwiejszy z żywych — najszybsza wygrana.';
  return 'Najłatwiejszy z tych, które zostały.';
}
