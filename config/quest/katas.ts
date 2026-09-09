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
  {
    id: 'stany',
    brief: 'Zaprojektuj pięć stanów jednego przycisku tak, żeby każdy dało się rozpoznać bez podpisu.',
    umiejetnosc: 'stany interfejsu',
    trudnosc: 'łatwa',
    minut: 15,
    pokretla: [
      { klucz: 'rozjasnienieHover', etykieta: 'Rozjaśnienie pod kursorem', rodzaj: 'liczba', min: 0, max: 60, jednostka: '%' },
      { klucz: 'gruboscObrysu', etykieta: 'Grubość obrysu zaznaczenia', rodzaj: 'liczba', min: 0, max: 6, jednostka: 'px' },
      { klucz: 'odsuniecieObrysu', etykieta: 'Odsunięcie obrysu', rodzaj: 'liczba', min: 0, max: 8, jednostka: 'px' },
      { klucz: 'wcisniecie', etykieta: 'Wciśnięcie', rodzaj: 'liczba', min: 0, max: 6, jednostka: 'px' },
      { klucz: 'przygaszenieWylaczonego', etykieta: 'Przygaszenie wyłączonego', rodzaj: 'liczba', min: 0, max: 95, jednostka: '%' },
    ],
    // Wszystko na zero: piec stanow wyglada identycznie, czyli nie ma zadnych stanow.
    start: { rozjasnienieHover: 0, gruboscObrysu: 0, odsuniecieObrysu: 0, wcisniecie: 0, przygaszenieWylaczonego: 0 },
    wzorzec: { rozjasnienieHover: 18, gruboscObrysu: 2, odsuniecieObrysu: 3, wcisniecie: 1, przygaszenieWylaczonego: 55 },
    komentarz: [
      'Pięć stanów to nie pięć wyglądów do wymyślenia. To pięć odpowiedzi na pytanie „co się teraz dzieje” — ' +
        'i dlatego każdy musi się różnić od pozostałych na tyle, żeby dało się go rozpoznać bez podpisu.',
      'Obrys zaznaczenia jest jedynym stanem, którego nie wolno pominąć. Pozostałe cztery to wygoda; ten jeden ' +
        'decyduje o tym, czy ktoś poruszający się klawiaturą w ogóle wie, gdzie stoi. Odsunięcie o kilka pikseli ' +
        'robi różnicę między obrysem a obwódką wtopioną w przycisk.',
      'Rozjaśnienie pod kursorem jest jedynym stanem, który nie musi być duży. Myszka już tam jest, więc ' +
        'wystarczy potwierdzić, że trafiła — kilkanaście procent robi to lepiej niż połowa, bo nie wygląda ' +
        'jak drugi, inny przycisk.',
      'Wciśnięcie o jeden piksel wystarcza. Większe wygląda jak usterka, a nie jak reakcja — ruch ma potwierdzić ' +
        'naciśnięcie, nie zwrócić na siebie uwagi.',
      'Wyłączony przygaszony do połowy wciąż da się przeczytać. Przygaszony do dziesięciu procent znika, ' +
        'a wtedy zamiast „nie da się tego teraz użyć” komunikuje „strona się zepsuła”.',
    ],
    lista: [
      'Czy każdy z pięciu stanów rozpoznasz, zasłaniając podpisy?',
      'Czy obrys zaznaczenia widać, nie mrużąc oczu?',
      'Czy wyłączony da się jeszcze przeczytać?',
      'Czy wciśnięty wygląda na reakcję, a nie na przesunięty przez pomyłkę?',
      'Czy któryś stan da się usunąć bez straty?',
    ],
  },
  {
    id: 'pierscien',
    brief: 'Zrób obrys zaznaczenia, który widać i na białej stronie, i na ciemnym tle powiększenia.',
    umiejetnosc: 'dostępność',
    trudnosc: 'średnia',
    minut: 15,
    pokretla: [
      { klucz: 'gruboscObrysu', etykieta: 'Grubość obrysu', rodzaj: 'liczba', min: 0, max: 6, jednostka: 'px' },
      { klucz: 'odsuniecieObrysu', etykieta: 'Odsunięcie od krawędzi', rodzaj: 'liczba', min: 0, max: 8, jednostka: 'px' },
      {
        klucz: 'kolorObrysu',
        etykieta: 'Kolor obrysu',
        rodzaj: 'wybor',
        mozliwosci: [
          { wartosc: 'atrament', etykieta: 'Zawsze atramentowy' },
          { wartosc: 'papier', etykieta: 'Zawsze papierowy' },
          { wartosc: 'dopasowany', etykieta: 'Dopasowany do tła' },
        ],
      },
    ],
    // Atramentowy obrys na obu tlach: na jasnym widac, na ciemnym znika calkowicie.
    start: { gruboscObrysu: 2, odsuniecieObrysu: 0, kolorObrysu: 'atrament' },
    wzorzec: { gruboscObrysu: 2, odsuniecieObrysu: 3, kolorObrysu: 'dopasowany' },
    komentarz: [
      'Ta kata nie jest wymyślona. Dokładnie ten błąd siedział na prawdziwej stronie i znaleźli go ' +
        'gracze chodzący po niej w tle: obrys zaznaczenia miał kolor atramentu, a w powiększeniu pracy ' +
        'tło jest prawie czarne. Obrys odcinał się od niego 1,08 do 1, czyli był, ale nikt by go nie zobaczył.',
      'Nie wykryły tego ani axe, ani Lighthouse. Oba sprawdzają, czy obrys istnieje, a nie czy widać go ' +
        'na tym, co pod nim leży. To jest różnica między spełnieniem wymogu a rozwiązaniem problemu.',
      'Jeden kolor obrysu nie wystarczy, jeśli tła są dwa. Odpowiedź brzmi: obrys ma odcinać się od swojej ' +
        'własnej powierzchni, a nie mieć jeden ustalony kolor. Na jasnym ciemny, na ciemnym jasny.',
      'Odsunięcie od krawędzi robi różnicę między obrysem a obwódką wtopioną w przycisk. Bez niego dwie linie ' +
        'stykają się i czyta się je jako jedną grubszą ramkę, czyli jako brak zaznaczenia.',
    ],
    lista: [
      'Czy obrys widać na obu tłach, nie mrużąc oczu?',
      'Czy da się odróżnić obrys zaznaczenia od zwykłej ramki przycisku?',
      'Czy udało się to bez pogrubiania obrysu do czterech pikseli?',
      'Czy któryś z trzech wyborów koloru działa tylko przez przypadek?',
      'Czy zauważyłabyś ten błąd, oglądając wyłącznie jasną stronę?',
    ],
  },
  {
    id: 'opis',
    brief: 'Napisz opis pracy dla kogoś, kto jej nie zobaczy, patrząc wyłącznie na swój tekst.',
    umiejetnosc: 'dostępność i mikrocopy',
    trudnosc: 'średnia',
    minut: 15,
    jednaZMozliwych: true,
    pokretla: [
      {
        klucz: 'opis',
        etykieta: 'Opis obrazu',
        rodzaj: 'tekst',
        podpowiedz: 'Jedno zdanie. Co ta osoba ma zobaczyć w głowie?',
      },
    ],
    start: { opis: '' },
    wzorzec: {
      opis: 'Rozległa łąka w pełnym słońcu, żółć trawy zajmuje niemal cały kadr, u góry wąski pas nieba.',
    },
    komentarz: [
      'Nie ma jednego dobrego opisu i to jest pierwsza rzecz do zapamiętania. Ta wersja obok jest jedną ' +
        'z możliwych, nie wzorcową - dwa dobrze napisane teksty alternatywne potrafią nie mieć ze sobą ' +
        'nic wspólnego, bo autor zdecydował, co jest w tej pracy najważniejsze.',
      'Opis nie zaczyna się od słowa „obraz”, bo czytnik ekranu i tak zapowiada, że to obraz. Napisanie ' +
        'tego jeszcze raz brzmi jak „obraz obraz”, a marnuje sekundę uwagi na samym początku.',
      'Sam tytuł to za mało. „Żółta łąka” jest już przeczytana obok, więc powtórzenie jej w opisie nie ' +
        'dodaje nic - a to jedyne miejsce, w którym można powiedzieć coś, czego nie widać z podpisu.',
      'Długość ma znaczenie inne, niż się wydaje. Sto czterdzieści znaków to nie limit techniczny, tylko ' +
        'granica, za którą słuchający przestaje trzymać zdanie w głowie. Krótkie i konkretne wygrywa ' +
        'z długim i dokładnym.',
    ],
    lista: [
      'Czy ktoś, kto nie widzi tej pracy, wie po Twoim opisie, na co patrzy?',
      'Czy opis mówi coś, czego nie ma już w tytule i podpisie?',
      'Czy da się go wysłuchać do końca bez gubienia początku?',
      'Czy opisujesz to, co widać, a nie to, co ta praca znaczy?',
      'Czy Twój opis i ten obok mogłyby oba być dobre?',
    ],
  },
];

export const kataPoId = new Map(katy.map((kata) => [kata.id, kata]));
