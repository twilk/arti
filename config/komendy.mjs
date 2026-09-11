// ══════════════════════════════════════════════════════════════════════
//  CO TO JEST: spis wszystkich komend, jaki jest w tym projekcie.
//              Jedno miejsce, z którego bierze je i `npm run pomoc`,
//              i tabela w README.
//  CO MOŻESZ TU ZMIENIAĆ: opisy. Pisz je tak, jakbyś tłumaczyła komuś,
//                         kto pyta „a to do czego?”.
//  CZEGO LEPIEJ NIE RUSZAĆ: pola `komenda` - po nim test sprawdza, czy
//                           spis zgadza się z package.json i z README.
//  JAK SPRAWDZIĆ, CZY DZIAŁA: npm run pomoc
// ══════════════════════════════════════════════════════════════════════

/**
 * Grupy idą w kolejności, w jakiej się ich potrzebuje, a nie alfabetycznie.
 * Pierwsza grupa to te trzy komendy, które wystarczą na co dzień.
 */
export const grupy = [
  {
    tytul: 'NA CO DZIEŃ',
    wstep: 'Tyle wystarczy, żeby grać i żeby Twoja praca do kogoś trafiała.',
    komendy: [
      { komenda: 'npm run quest', opis: 'Co dziś zrobić. Uruchamia testy i rysuje ekran gry.' },
      { komenda: 'npm run wyslij', opis: 'Zapisuje Twoją pracę i wysyła ją do wspólnego repozytorium.' },
      { komenda: 'npm run pobierz', opis: 'Dociąga nowe rzeczy, nie gubiąc po drodze Twojej pracy.' },
      { komenda: 'npm run pomoc', opis: 'Ten spis, w terminalu.' },
    ],
  },
  {
    tytul: 'RAZ, NA POCZĄTKU',
    wstep: 'Robi się to jeden raz. Można puszczać wiele razy, nic nie zepsuje.',
    komendy: [
      { komenda: 'npm install', opis: 'Dociąga to, z czego projekt jest zbudowany. Po każdym „npm run pobierz”, jeśli tak napisze.' },
      { komenda: 'npm run dostepy', opis: 'Ustawia wszystko, czego trzeba, żeby Twoja praca trafiała do wspólnego repozytorium.' },
    ],
  },
  {
    tytul: 'GRA W PRZEGLĄDARCE',
    wstep: 'Katy, mapa misji i ćwiczebna kopia galerii. Zatrzymuje się przez Ctrl+C.',
    komendy: [
      { komenda: 'npm run quest:dev', opis: 'Serwer z włączoną grą. Potem: /dev/mission, /dev/quest, /dev/kata/<nazwa>.' },
      { komenda: 'npm run gracze', opis: 'Dwoje graczy chodzi po stronie na telefonie i na komputerze, szukając usterek.' },
      { komenda: 'npm run gracze:cykl', opis: 'To samo, ale trzydzieści rund zamiast kilku.' },
      { komenda: 'npm run gracze:lokalnie', opis: 'Buduje stronę, serwuje ją, obchodzi każdy ekran i sprząta po sobie.' },
    ],
  },
  {
    tytul: 'STRONA',
    wstep: 'Do prawdziwego portfolio, bez gry.',
    komendy: [
      { komenda: 'npm run dev', opis: 'Strona pod http://localhost:3000. Przygotowuje zdjęcia przed startem.' },
      { komenda: 'npm run build', opis: 'Buduje wersję produkcyjną, taką jak w internecie.' },
      { komenda: 'npm start', opis: 'Serwuje to, co zbudowane przez „npm run build”.' },
      { komenda: 'npm run artworks', opis: 'Przerabia zdjęcia z katalogu sources/ na wersje dla strony.' },
    ],
  },
  {
    tytul: 'SPRAWDZANIE',
    wstep: 'Od najtańszego do najdroższego. Czasy są zmierzone, nie zgadnięte.',
    komendy: [
      { komenda: 'npm run typecheck', opis: 'Czy typy się zgadzają. Kilka sekund.' },
      { komenda: 'npm run test:szybko', opis: 'Testy bez tych, które rysują komponenty. Około 3 sekund.' },
      { komenda: 'npm test', opis: 'Wszystkie testy projektu. Około 10 sekund.' },
      { komenda: 'npm run lint', opis: 'Czy kod trzyma się konwencji Next.js.' },
      { komenda: 'npm run proba', opis: 'Klonuje projekt do pustego katalogu i przechodzi drogę nowej osoby. Kilka minut.' },
      { komenda: 'npm run sprawdz', opis: 'Wszystko powyżej po kolei, od najtańszego. Zatrzymuje się na pierwszym błędzie.' },
      { komenda: 'npm run sprawdz -- --szybko', opis: 'Tylko cztery szybkie sprawdzenia, do pracy w kółko.' },
    ],
  },
];

/** Płaski spis, do sprawdzania zgodności z package.json i README. */
export const wszystkieKomendy = grupy.flatMap((g) => g.komendy);

/**
 * Komendy, które npm odpala sam i których się nie wpisuje.
 * Są tu po to, żeby test nie uznał ich za brakujące w spisie.
 */
export const automatyczne = ['predev', 'prebuild'];
