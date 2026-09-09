// ══════════════════════════════════════════════════════════════════════
//  CO TO JEST: zasada, co jest zadaniem na dziś - kata czy boss.
//  CO MOŻESZ TU ZMIENIAĆ: ile kat ma wypaść na tydzień (KAT_NA_TYDZIEN).
//  CZEGO LEPIEJ NIE RUSZAĆ: liczenia tygodnia. Seria liczona dziennie
//                           karałaby za życie, a nie za brak pracy.
//  JAK SPRAWDZIĆ, CZY DZIAŁA: npm test
// ══════════════════════════════════════════════════════════════════════

import { wybierzBossaNaDzis } from './kolejnosc-bossow.mjs';

/** Cztery katy w tygodniu wystarczą, żeby tydzień się liczył. */
export const KAT_NA_TYDZIEN = 4;

/**
 * Klucz tygodnia wedlug ISO 8601: rok i numer tygodnia, np. "2026-W37".
 * Tydzien, nie dzien - zerowanie serii po jednym pominietym dniu to mechanika,
 * ktora karze za zycie.
 */
export function kluczTygodnia(data = new Date()) {
  const d = new Date(Date.UTC(data.getFullYear(), data.getMonth(), data.getDate()));
  // ISO liczy tygodnie od poniedzialku, a niedziela ma numer 0 - stad ta zamiana.
  const dzien = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dzien);
  const poczatekRoku = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const numer = Math.ceil(((d - poczatekRoku) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(numer).padStart(2, '0')}`;
}

/** Ile kat zrobiono w danym tygodniu. */
export function katWTygodniu(postep, tydzien = kluczTygodnia()) {
  return Object.values(postep?.katy ?? {}).filter((k) => k.tydzien === tydzien).length;
}

/**
 * Co jest zadaniem na dziś.
 *
 * Kata przed bossem, gdy w tym tygodniu nie było jeszcze ani jednej. Powód jest
 * prosty: boss to naprawa czegoś zepsutego, a kata to ćwiczenie - i to ćwiczenie
 * buduje rytm. Bez tego pierwszeństwa katy zostałyby na potem, czyli nigdy.
 *
 * Gdy tydzień jest już zaliczony, wraca boss. Gdy nie ma ani jednego żywego bossa,
 * a katy na ten tydzień zrobione - nie ma zadania i to też jest odpowiedź.
 */
export function zadanieNaDzis({ bossowie, stanBossow, katy, postep, teraz = new Date() }) {
  const tydzien = kluczTygodnia(teraz);
  const zrobione = new Set(
    Object.entries(postep?.katy ?? {})
      .filter(([, k]) => k.skonczona)
      .map(([id]) => id),
  );
  const nastepnaKata = (katy ?? []).find((k) => !zrobione.has(k.id)) ?? null;
  const wTymTygodniu = katWTygodniu(postep, tydzien);

  if (nastepnaKata && wTymTygodniu < 1) {
    return {
      rodzaj: 'kata',
      kata: nastepnaKata,
      tydzien,
      wTymTygodniu,
      powod: 'W tym tygodniu nie było jeszcze żadnej katy.',
    };
  }

  const boss = wybierzBossaNaDzis(bossowie, stanBossow ?? []);
  if (boss) {
    return {
      rodzaj: 'boss',
      boss,
      tydzien,
      wTymTygodniu,
      powod:
        wTymTygodniu >= KAT_NA_TYDZIEN
          ? `Tydzień zaliczony — ${wTymTygodniu} katy.`
          : 'Kata w tym tygodniu odhaczona.',
    };
  }

  if (nastepnaKata) {
    return {
      rodzaj: 'kata',
      kata: nastepnaKata,
      tydzien,
      wTymTygodniu,
      powod: 'Bossowie pokonani, została talia kat.',
    };
  }

  return { rodzaj: 'nic', tydzien, wTymTygodniu, powod: 'Wszystko na teraz zrobione.' };
}
