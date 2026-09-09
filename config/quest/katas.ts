// ══════════════════════════════════════════════════════════════════════
//  CO TO JEST: talia kat, czyli krótkich ćwiczeń z jednym zadaniem.
//  CO MOŻESZ TU ZMIENIAĆ: teksty, wartości startowe i wzorcowe, pytania
//                         z listy do samosprawdzenia.
//  CZEGO LEPIEJ NIE RUSZAĆ: pola `id` - po nim gra rozpoznaje katę.
//  JAK SPRAWDZIĆ, CZY DZIAŁA: npm run quest:dev, potem /dev/kata/hierarchia
// ══════════════════════════════════════════════════════════════════════

export type Pokretlo = {
  klucz: string;
  etykieta: string;
  /** Suwak z zakresem albo przełącznik między dwiema możliwościami. */
  rodzaj: 'liczba' | 'wybor';
  min?: number;
  max?: number;
  jednostka?: string;
  mozliwosci?: { wartosc: string; etykieta: string }[];
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
  /** Wersja wzorcowa, odsłaniana dopiero po „skończone”. */
  wzorzec: Record<string, string | number>;
  /** Dlaczego wzorzec wygląda tak, jak wygląda. Z nazwaniem zasady. */
  komentarz: string[];
  /** Pytania zamknięte. Zaznacza sama, nikt tego nie punktuje. */
  lista: string[];
};

export const katy: Kata[] = [
  {
    id: 'hierarchia',
    brief: 'Ułóż tytuł, technikę, rok i wymiary tak, żeby oko szło w tej kolejności.',
    umiejetnosc: 'hierarchia wizualna',
    trudnosc: 'łatwa',
    minut: 15,
    pokretla: [
      { klucz: 'rozmiarTytulu', etykieta: 'Wielkość tytułu', rodzaj: 'liczba', min: 11, max: 40, jednostka: 'px' },
      { klucz: 'rozmiarMetadanych', etykieta: 'Wielkość metadanych', rodzaj: 'liczba', min: 9, max: 40, jednostka: 'px' },
      { klucz: 'odstep', etykieta: 'Odstęp pod tytułem', rodzaj: 'liczba', min: 0, max: 32, jednostka: 'px' },
      { klucz: 'szarosc', etykieta: 'Przygaszenie metadanych', rodzaj: 'liczba', min: 0, max: 70, jednostka: '%' },
      {
        klucz: 'kolejnosc',
        etykieta: 'Co stoi wyżej',
        rodzaj: 'wybor',
        mozliwosci: [
          { wartosc: 'tytul', etykieta: 'Tytuł' },
          { wartosc: 'metadane', etykieta: 'Metadane' },
        ],
      },
    ],
    // Wszystko tej samej wielkosci i tak samo ciemne - oko nie ma sie czego zlapac.
    start: { rozmiarTytulu: 15, rozmiarMetadanych: 15, odstep: 2, szarosc: 0, kolejnosc: 'metadane' },
    wzorzec: { rozmiarTytulu: 19, rozmiarMetadanych: 12, odstep: 8, szarosc: 45, kolejnosc: 'tytul' },
    komentarz: [
      'Hierarchia to nie jest to samo co wielkość. Tytuł jest tu większy tylko o jeden krok skali, ' +
        'a i tak wygrywa — bo reszta została przygaszona i odsunięta. Kontrast robi więcej niż rozmiar.',
      'Metadane zeszły do dwunastu pikseli i do połowy przygaszenia. Nadal je widać, gdy się ich szuka, ' +
        'a przestają zaczepiać oko, gdy się ich nie szuka. O to chodzi w słowie „ciche”.',
      'Odstęp pod tytułem robi z dwóch linijek dwie grupy. Bez niego to jedna plama tekstu, ' +
        'niezależnie od tego, jak dobrane są wielkości.',
      'Kolejność jest tu jedyną rzeczą, której nie da się nadrobić niczym innym. Metadane nad tytułem ' +
        'czyta się jako podpis do czegoś, co dopiero nadejdzie.',
    ],
    lista: [
      'Czy oko trafia najpierw na tytuł, zanim zdążysz go poszukać?',
      'Czy metadane da się przeczytać, gdy ich świadomie szukasz?',
      'Czy tytuł i metadane wyglądają jak dwie grupy, a nie jedna plama?',
      'Czy udało się to bez powiększania tytułu do rozmiaru nagłówka?',
      'Czy zmieniłabyś coś jeszcze, gdyby wolno było zmienić tylko jedną rzecz?',
    ],
  },
];

export const kataPoId = new Map(katy.map((kata) => [kata.id, kata]));
