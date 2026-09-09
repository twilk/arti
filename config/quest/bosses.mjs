// ══════════════════════════════════════════════════════════════════════
//  CO TO JEST: opisy bossów. Życie bossa liczą testy, nie ten plik.
//  CO MOŻESZ TU ZMIENIAĆ: teksty. Zmiana opisu niczego nie psuje.
//  CZEGO LEPIEJ NIE RUSZAĆ: pola id - po nim testy trafiają do bossa.
//                           Plik jest zwykłym JavaScriptem, bo czyta go i strona,
//                           i komenda w terminalu. Wcześniej terminal wyciągał te
//                           dane z TypeScriptu wyrażeniem regularnym i po klonowaniu
//                           repozytorium na Windowsie przestawał widzieć bossów -
//                           git zamienia wtedy końce linii, a wzorzec przestaje trafiać.
//  JAK SPRAWDZIĆ, CZY DZIAŁA: npm run quest
// ══════════════════════════════════════════════════════════════════════

/** @typedef {'łatwy'|'średni'|'trudny'} Trudnosc */

export const bosses = [
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
  {
    id: 'cel-dotkniecia',
    name: 'Przycisk wysoki na 28 pikseli',
    difficulty: 'łatwy',
    where: 'config/quest/tokens.ts',
    meaning:
      'Opuszka kciuka ma około 44 pikseli. Przy 28 trafia się za drugim albo trzecim razem, ' +
      'a w ruchu — losowo. Norma mówi o minimum 24 pikselach, ale minimum to nie to samo co wygoda.',
    hint:
      'Cel można powiększyć, nie powiększając tego, co widać. Przycisk może zostać mały, ' +
      'a jego pole dotknięcia urosnąć dookoła.',
    whose:
      'Obojga. Projektant decyduje, jak duże ma być pole dotknięcia, deweloper decyduje, ' +
      'czy urośnie ono przez powiększenie ikony, czy przez odstęp wokół niej.',
  },
  {
    id: 'miara-wiersza',
    name: 'Wiersz długi na 110 znaków',
    difficulty: 'średni',
    where: 'config/quest/tokens.ts',
    meaning:
      'Oko wraca na początek następnej linii ruchem, którego się nie zauważa — dopóki linia ' +
      'nie jest za długa. Wtedy wraca w złe miejsce i czyta się tę samą linijkę drugi raz.',
    hint:
      'Krócej nie zawsze znaczy lepiej. Poniżej 45 znaków oko skacze do nowej linii tak często, ' +
      'że też męczy. Szukaj środka przedziału 45–75.',
    whose:
      'Projektanta. To decyzja o szerokości kolumny tekstu, czyli o układzie strony. ' +
      'Typografia trzyma się tego przedziału od stuleci i nie jest to przesąd.',
  },
  {
    id: 'kolejnosc-naglowkow',
    name: 'Przeskok z nagłówka pierwszego na czwarty',
    difficulty: 'średni',
    where: 'config/quest/tokens.ts',
    meaning:
      'Nagłówki to spis treści dla kogoś, kto strony nie widzi. Czytnik ekranu pozwala skakać ' +
      'po nich jak po rozdziałach książki. Przeskok z pierwszego na czwarty brzmi tam jak ' +
      '„rozdział 1, podpodpunkt 1.1.1” — słuchający nie wie, czy coś przegapił.',
    hint:
      'Poziom nagłówka mówi o miejscu w hierarchii, nie o wielkości liter. Jeśli chcesz ' +
      'mniejszy napis, zmień rozmiar, a nie poziom.',
    whose:
      'Obojga, i to jest ta różnica warta zapamiętania. Projektant decyduje, co jest ważniejsze ' +
      'od czego — czyli o hierarchii. Deweloper zapisuje tę hierarchię w kodzie. Gdy ktoś ' +
      'wybiera poziom nagłówka dla wyglądu, myli te dwie rzeczy.',
  },
  {
    id: 'stan-pusty',
    name: 'Galeria bez prac pokazuje pustkę',
    difficulty: 'średni',
    where: 'config/quest/tokens.ts',
    meaning:
      'Pusty ekran zawsze wygląda jak awaria, nawet gdy wszystko działa. Ktoś, kto go zobaczy, ' +
      'nie wie, czy strona się zepsuła, czy jeszcze się ładuje, czy naprawdę nic tu nie ma.',
    hint:
      'Dobry stan pusty mówi trzy rzeczy: co się stało, dlaczego to normalne i co zrobić dalej. ' +
      'Samo „Brak prac” to dopiero pierwsza z nich, i najmniej przydatna.',
    whose:
      'Projektanta, i to jest stan, o którym zapomina się najczęściej. Na ekranie z pięcioma ' +
      'pracami nikt go nigdy nie zobaczy — trzeba go sobie wyobrazić, zanim się wydarzy.',
  },
];

export const bossById = new Map(bosses.map((boss) => [boss.id, boss]));
