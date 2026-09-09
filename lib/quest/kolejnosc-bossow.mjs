// ══════════════════════════════════════════════════════════════════════
//  CO TO JEST: jedna zasada, w jakiej kolejności bierze się bossów.
//  CO MOŻESZ TU ZMIENIAĆ: kolejność trudności, jeśli wolisz inną.
//  CZEGO LEPIEJ NIE RUSZAĆ: tego, że plik jest zwykłym JavaScriptem -
//                           czyta go i strona, i komenda w terminalu.
//                           Gdyby zasada istniała w dwóch miejscach,
//                           prędzej czy później zaczęłyby mówić co innego.
//  JAK SPRAWDZIĆ, CZY DZIAŁA: npm test
// ══════════════════════════════════════════════════════════════════════

/** Im niżej, tym wcześniej. Łatwe najpierw, bo pierwsza sesja ma się skończyć wygraną. */
export const KOLEJNOSC_TRUDNOSCI = { łatwy: 0, średni: 1, trudny: 2 };

/**
 * Najłatwiejszy, a wśród równie łatwych ten, któremu zostało najmniej życia.
 * Chodzi o najlepszy stosunek efektu do wysiłku, nie o kolejność w pliku -
 * ta jest przypadkiem, nie decyzją.
 *
 * Ostatnie kryterium jest arbitralne, ale musi być stałe: losowanie zadania
 * na dziś oznaczałoby, że dwa uruchomienia tej samej komendy mówią co innego.
 */
export function porownajBossow(a, b, kolejnoscWKatalogu) {
  const trudnosc =
    (KOLEJNOSC_TRUDNOSCI[a.difficulty] ?? 9) - (KOLEJNOSC_TRUDNOSCI[b.difficulty] ?? 9);
  if (trudnosc !== 0) return trudnosc;
  const zycie = a.hp - b.hp;
  if (zycie !== 0) return zycie;
  return (kolejnoscWKatalogu.get(a.id) ?? 0) - (kolejnoscWKatalogu.get(b.id) ?? 0);
}

/**
 * Wybiera bossa na dziś spośród żywych. `bossowie` to katalog opisów,
 * `stan` to lista { id, hp, maxHp } policzona przez testy.
 */
export function wybierzBossaNaDzis(bossowie, stan) {
  const wgId = new Map(bossowie.map((boss) => [boss.id, boss]));
  const kolejnosc = new Map(bossowie.map((boss, i) => [boss.id, i]));

  const zywe = stan
    .filter((s) => s.hp > 0)
    .map((s) => {
      const boss = wgId.get(s.id);
      return boss ? { id: s.id, hp: s.hp, difficulty: boss.difficulty, boss } : null;
    })
    .filter(Boolean);

  if (zywe.length === 0) return null;
  zywe.sort((a, b) => porownajBossow(a, b, kolejnosc));
  return zywe[0].boss;
}
