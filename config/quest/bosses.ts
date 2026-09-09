// ══════════════════════════════════════════════════════════════════════
//  CO TO JEST: opisy bossów. Życie bossa liczą testy, nie ten plik.
//  CO MOŻESZ TU ZMIENIAĆ: teksty. Zmiana opisu niczego nie psuje.
//  CZEGO LEPIEJ NIE RUSZAĆ: pola `id` - po nim testy trafiają do bossa.
//  JAK SPRAWDZIĆ, CZY DZIAŁA: npm run quest
// ══════════════════════════════════════════════════════════════════════

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

export const bosses: Boss[] = [
  {
    id: 'kontrast-podpisow',
    name: 'Kontrast 1,86:1 na podpisach prac',
    difficulty: 'łatwy',
    where: 'config/quest/tokens.ts',
    meaning:
      'Podpisy pod obrazami są jasnoszare na jasnym papierze. Osoba oglądająca stronę ' +
      'na telefonie w słońcu ich nie zobaczy. Poniżej pewnej granicy tekst przestaje być ' +
      'tekstem i staje się dekoracją.',
    hint:
      'Nie szukaj najciemniejszego szarego, tylko najjaśniejszego, który jeszcze przechodzi ' +
      'próg 4,5:1. Podpis ma informować, nie konkurować z obrazem.',
    whose:
      'Projektanta. Kontrast jest decyzją o kolorze, a kolor wybiera projektant. Deweloper ' +
      'tylko wpisuje wartość, którą dostał.',
  },
];

export const bossById = new Map(bosses.map((boss) => [boss.id, boss]));
