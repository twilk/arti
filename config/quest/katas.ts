// ══════════════════════════════════════════════════════════════════════
//  CO TO JEST: typy do kat. Same katy leżą w katas.mjs, bo czyta je
//              także komenda w terminalu, a ta nie umie w TypeScript.
//  CO MOŻESZ TU ZMIENIAĆ: nic. Teksty i wartości poprawia się w katas.mjs.
//  CZEGO LEPIEJ NIE RUSZAĆ: całości.
//  JAK SPRAWDZIĆ, CZY DZIAŁA: npm test
// ══════════════════════════════════════════════════════════════════════

import { kataPoId as wgId, katy as dane } from './katas.mjs';

export type Pokretlo = {
  klucz: string;
  etykieta: string;
  /** Suwak z zakresem, przełącznik między możliwościami albo pole na tekst. */
  rodzaj: 'liczba' | 'wybor' | 'tekst';
  min?: number;
  max?: number;
  jednostka?: string;
  mozliwosci?: { wartosc: string; etykieta: string }[];
  /** Podpowiedź w pustym polu tekstowym. */
  podpowiedz?: string;
};

export type Kata = {
  id: string;
  /** Jedno zdanie. Nie akapit. */
  brief: string;
  umiejetnosc: string;
  trudnosc: 'łatwa' | 'średnia' | 'trudna';
  minut: number;
  pokretla: Pokretlo[];
  /** Celowo niedobry punkt startowy - jest z czego ruszyć. */
  start: Record<string, string | number>;
  /**
   * Wersja odsłaniana po „skończone”.
   *
   * Przy katach liczbowych to jest odpowiedź. Przy katach na tekst to jest JEDNA
   * z możliwych odpowiedzi i tak też się ją podpisuje - dwa dobre teksty alternatywne
   * mogą być zupełnie różne, a pokazanie jednego jako „wzorcowego” uczyłoby, że
   * istnieje jedno właściwe zdanie.
   */
  wzorzec: Record<string, string | number>;
  /** Prawda, gdy odpowiedzią jest tekst, a nie liczba. Zmienia podpis przełącznika. */
  jednaZMozliwych?: boolean;
  /** Dlaczego wzorzec wygląda tak, jak wygląda. Z nazwaniem zasady. */
  komentarz: string[];
  /** Pytania zamknięte. Zaznacza sama, nikt tego nie punktuje. */
  lista: string[];
};

// Podwójne rzutowanie, bo każda kata ma inne pokrętła, więc TypeScript widzi w
// pliku .mjs sumę wszystkich kształtów naraz i uznaje ją za niezgodną z żadnym
// pojedynczym. To nie jest wiara na słowo: kształt kat sprawdza w locie
// tests/project/jakosc-kat.test.ts, który dla każdego pokrętła żąda wartości
// startowej i wzorcowej właściwego typu i w zakresie.
export const katy: Kata[] = dane as unknown as Kata[];
export const kataPoId: Map<string, Kata> = wgId as unknown as Map<string, Kata>;
