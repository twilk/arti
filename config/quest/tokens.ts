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
