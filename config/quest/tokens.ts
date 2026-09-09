// ══════════════════════════════════════════════════════════════════════
//  CO TO JEST: wartości, których używa questowa kopia galerii.
//             Prawdziwa strona ich NIE czyta - to jest plac ćwiczeń.
//  CO MOŻESZ TU ZMIENIAĆ: wszystko poniżej. Po to tu jest.
//  CZEGO LEPIEJ NIE RUSZAĆ: nazw pól (np. `caption`) - trzymają się ich testy.
//  JAK SPRAWDZIĆ, CZY DZIAŁA: npm run quest
// ══════════════════════════════════════════════════════════════════════

/** Tło strony. Ten sam papier co na prawdziwej stronie. */
export const paper = '#f6f5f2';

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  BOSS 01 · kontrast-podpisow                                         ║
// ║                                                                      ║
// ║  PROBLEM                                                             ║
// ║  Podpisy pod pracami mają kolor #b8b6b0 na papierze #f6f5f2.          ║
// ║  To kontrast 1,86:1. Norma WCAG AA wymaga 4,5:1 dla zwykłego tekstu.  ║
// ║                                                                      ║
// ║  CO TO ZNACZY DLA CZŁOWIEKA                                          ║
// ║  Ktoś ogląda Twoje obrazy na telefonie, na przystanku, w słońcu.      ║
// ║  Tytuł pracy jest wtedy dla niego jasną plamą na jasnym tle.          ║
// ║  To nie jest kwestia gustu. Poniżej pewnej granicy tekst przestaje    ║
// ║  być tekstem i staje się dekoracją.                                   ║
// ║                                                                      ║
// ║  JAK POKONAĆ                                                          ║
// ║  Zakomentuj linię (A). Odkomentuj linię (B). Zapisz plik.             ║
// ║  Potem uruchom: npm run quest                                         ║
// ║                                                                      ║
// ║  WSKAZÓWKA, NIE ROZWIĄZANIE                                          ║
// ║  Nie chodzi o to, żeby było jak najciemniej. Chodzi o najjaśniejszy   ║
// ║  szary, który jeszcze przechodzi próg. Podpis ma informować,          ║
// ║  nie konkurować z obrazem.                                            ║
// ╚══════════════════════════════════════════════════════════════════════╝
export const caption = '#b8b6b0'; // (A) ZEPSUTE
// export const caption = '#66645c'; // (B) DOBRE

/** Kolor tytułu pracy. Na razie bez bossa. */
export const title = '#171715';

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  BOSS 02 · cel-dotkniecia                                            ║
// ║                                                                      ║
// ║  PROBLEM                                                             ║
// ║  Przycisk powiększenia ma 28 pikseli wysokości.                      ║
// ║                                                                      ║
// ║  CO TO ZNACZY DLA CZŁOWIEKA                                          ║
// ║  Opuszka kciuka ma około 44 pikseli. Przy 28 trafia się za drugim    ║
// ║  albo trzecim razem, a przy chodzeniu — losowo. Norma WCAG 2.5.8     ║
// ║  mówi o minimum 24 pikselach, ale minimum to nie to samo co wygoda.  ║
// ║                                                                      ║
// ║  JAK POKONAĆ                                                          ║
// ║  Zakomentuj linię (A), odkomentuj (B). Zapisz. Potem: npm run quest  ║
// ║                                                                      ║
// ║  WSKAZÓWKA, NIE ROZWIĄZANIE                                          ║
// ║  Cel można powiększyć, nie powiększając tego, co widać. Przycisk     ║
// ║  może zostać mały, a jego pole dotknięcia urosnąć dookoła.           ║
// ╚══════════════════════════════════════════════════════════════════════╝
export const wysokoscPrzycisku = 28; // (A) ZEPSUTE
// export const wysokoscPrzycisku = 44; // (B) DOBRE

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  BOSS 03 · miara-wiersza                                             ║
// ║                                                                      ║
// ║  PROBLEM                                                             ║
// ║  Akapit biografii ma 110 znaków w linii.                             ║
// ║                                                                      ║
// ║  CO TO ZNACZY DLA CZŁOWIEKA                                          ║
// ║  Oko wraca na początek następnej linii ruchem, którego się nie       ║
// ║  zauważa — dopóki linia nie jest za długa. Wtedy wraca w złe miejsce ║
// ║  i czyta się tę samą linijkę dwa razy. Typografowie od stuleci       ║
// ║  trzymają się przedziału 45–75 znaków i nie jest to przesąd.         ║
// ║                                                                      ║
// ║  JAK POKONAĆ                                                          ║
// ║  Zakomentuj linię (A), odkomentuj (B). Zapisz. Potem: npm run quest  ║
// ║                                                                      ║
// ║  WSKAZÓWKA, NIE ROZWIĄZANIE                                          ║
// ║  Krócej nie zawsze znaczy lepiej. Poniżej 45 znaków oko skacze do    ║
// ║  nowej linii tak często, że też męczy. Szukaj środka przedziału.     ║
// ╚══════════════════════════════════════════════════════════════════════╝
export const miaraWiersza = 110; // (A) ZEPSUTE
// export const miaraWiersza = 62; // (B) DOBRE
