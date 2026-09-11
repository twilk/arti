// ══════════════════════════════════════════════════════════════════════
//  CO TO JEST: `npm run pomoc`. Wszystkie komendy w jednym miejscu.
//  CO MOŻESZ TU ZMIENIAĆ: nic. Opisy poprawia się w config/komendy.mjs,
//                         bo bierze je stamtąd także tabela w README.
//  CZEGO LEPIEJ NIE RUSZAĆ: całości.
//  JAK SPRAWDZIĆ, CZY DZIAŁA: npm run pomoc
// ══════════════════════════════════════════════════════════════════════

import { grupy } from '../config/komendy.mjs';
import { blank, naglowek, pc, powiedz, rule, SZEROKOSC, wrap } from './ekran.mjs';

const SZUKANE = process.argv.slice(2).join(' ').trim().toLowerCase();

naglowek('ARTI · KOMENDY', SZUKANE ? `szukam: ${SZUKANE}` : '');

let cokolwiekZnalezione = false;

for (const grupa of grupy) {
  const pasujace = SZUKANE
    ? grupa.komendy.filter((k) => (k.komenda + ' ' + k.opis).toLowerCase().includes(SZUKANE))
    : grupa.komendy;

  if (pasujace.length === 0) continue;
  cokolwiekZnalezione = true;

  blank();
  console.log('  ' + pc.dim(grupa.tytul));
  if (grupa.wstep && !SZUKANE) console.log(wrap(pc.dim(grupa.wstep), 2));
  blank();

  for (const { komenda, opis } of pasujace) {
    // Zawsze dwie linie, nawet gdy opis zmiescilby sie obok. Mieszanie jednej
    // z dwiema robilo z tego schodki i nazwy komend przestawaly tworzyc kolumne,
    // po ktorej idzie oko - a po to jest ta lista.
    console.log('    ' + pc.bold(komenda));
    console.log(wrap(pc.dim(opis), 6, SZEROKOSC - 6));
  }
}

blank();
rule();
blank();

if (!cokolwiekZnalezione) {
  powiedz(`Nic nie pasuje do „${SZUKANE}”. Uruchom ${pc.bold('npm run pomoc')} bez dopisku, żeby zobaczyć wszystko.`, 2);
  blank();
  process.exit(0);
}

if (!SZUKANE) {
  powiedz('Nie musisz tego pamiętać. Wystarczy ' + pc.bold('npm run pomoc') + ', a jak szukasz czegoś konkretnego:', 2);
  blank();
  console.log('      ' + pc.bold('npm run pomoc zdjęcia'));
  blank();
  powiedz(pc.dim('Cały ten spis jest też w README, w rozdziale „Wszystkie komendy”.'), 2);
  blank();
}
