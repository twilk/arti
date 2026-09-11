// ══════════════════════════════════════════════════════════════════════
//  CO TO JEST: `npm run pobierz`. Dociąga nowe rzeczy ze wspólnego
//              repozytorium, nie gubiąc po drodze Twojej pracy.
//  CO MOŻESZ TU ZMIENIAĆ: nic nie musisz. To narzędzie, nie zadanie.
//  CZEGO LEPIEJ NIE RUSZAĆ: kolejności. Najpierw zapisuje Twoje zmiany,
//                           dopiero potem cokolwiek dociąga. Odwrotnie
//                           znaczyłoby, że da się coś stracić.
//  JAK SPRAWDZIĆ, CZY DZIAŁA: npm run pobierz
// ══════════════════════════════════════════════════════════════════════

import {
  blank,
  cicho,
  die,
  krok,
  naglowek,
  pc,
  powiedz,
  rule,
  sekcja,
  uwaga,
  wrap,
  zrobione,
  zWynikiem,
} from './ekran.mjs';

naglowek('ARTI · POBIERANIE');
blank();
powiedz('Dociągam nowe rzeczy ze wspólnego repozytorium. Zanim cokolwiek ruszę, zapisuję to, co masz u siebie — żeby nie było czego stracić.', 2);

if (!cicho('git', ['rev-parse', '--git-dir'])) {
  die(
    'To okno terminala nie stoi w katalogu z projektem.',
    `wejdź do katalogu ${pc.bold('arti')} komendą ${pc.bold('cd arti')} i spróbuj jeszcze raz.`,
  );
}

// Punkt powrotu. Jesli cokolwiek pojdzie nie tak, tu wracamy - i to jest
// jedyna obietnica, ktora ta komenda musi dotrzymac.
const punktPowrotu = cicho('git', ['rev-parse', 'HEAD']);

// ── 1. Zabezpiecz swoje ───────────────────────────────────────────────
krok(1, 3, 'Zabezpieczam to, co masz');

const zmiany = (cicho('git', ['status', '--porcelain']) ?? '').split('\n').filter((l) => l.trim());

if (zmiany.length > 0) {
  powiedz(`Masz ${zmiany.length} ${zmiany.length === 1 ? 'zmieniony plik' : 'zmienionych plików'}. Zapisuję je u Ciebie, zanim cokolwiek dociągnę.`);
  cicho('git', ['add', '-A']);
  const zapis = zWynikiem('git', ['commit', '-m', 'moja praca, zapisana przed pobraniem nowych rzeczy']);
  if (!zapis.ok && !/nothing to commit/i.test(zapis.wyjscie + zapis.blad)) {
    die(
      `Nie udało się zapisać Twoich zmian, więc niczego nie dociągam — tak jest bezpieczniej. Git powiedział: ${(zapis.blad || zapis.wyjscie).split('\n').slice(-2).join(' ')}`,
      'jeśli mowa o „user.name” albo „user.email”, uruchom najpierw „npm run dostepy”.',
      'Nic się nie zmieniło. Twoje pliki są dokładnie takie, jak przed uruchomieniem tej komendy.',
    );
  }
  blank();
  zrobione('Zapisane. Od tej chwili nie da się tego zgubić');
} else {
  zrobione('Nie masz niezapisanych zmian — nie ma czego zabezpieczać');
}

// ── 2. Zajrzyj, co nowego ─────────────────────────────────────────────
krok(2, 3, 'Sprawdzam, co nowego');

const sciagniecie = zWynikiem('git', ['fetch', 'origin', 'main']);
if (!sciagniecie.ok) {
  die(
    `Nie udało się zajrzeć do wspólnego repozytorium. Git powiedział: ${sciagniecie.blad.split('\n').slice(-2).join(' ')}`,
    'sprawdź połączenie z internetem i spróbuj jeszcze raz.',
    'Twoja praca jest zapisana i nic jej nie grozi.',
  );
}

const nowe = Number(cicho('git', ['rev-list', '--count', 'HEAD..FETCH_HEAD']) ?? '0') || 0;

if (nowe === 0) {
  blank();
  zrobione('Nic nowego. Masz u siebie wszystko, co jest we wspólnym repozytorium');
  blank();
  rule();
  blank();
  powiedz('A na dziś, jak zwykle: ' + pc.bold('npm run quest'), 2);
  blank();
  process.exit(0);
}

zrobione(`Nowych rzeczy do dociągnięcia: ${nowe}`);
const spis = cicho('git', ['log', '--pretty=%s', '-5', 'HEAD..FETCH_HEAD']);
if (spis) {
  blank();
  for (const wiersz of spis.split('\n').filter(Boolean)) {
    console.log('      ' + pc.dim('·') + ' ' + wiersz);
  }
}

// ── 3. Połącz ─────────────────────────────────────────────────────────
krok(3, 3, 'Łączę to z Twoją pracą');

const polaczenie = zWynikiem('git', ['merge', '--no-edit', 'FETCH_HEAD']);

if (!polaczenie.ok) {
  // Polowicznie scalone repozytorium to najgorsze miejsce, w jakim mozna kogos
  // zostawic: pliki wygladaja dziwnie, a zadna znana komenda nie dziala normalnie.
  // Wiec cofam wszystko do punktu powrotu i mowie to wprost.
  zWynikiem('git', ['merge', '--abort']);
  const gdzieJestem = cicho('git', ['rev-parse', 'HEAD']);
  const wrocilo = gdzieJestem === punktPowrotu;

  const kolidujace = (cicho('git', ['diff', '--name-only', 'HEAD', 'FETCH_HEAD']) ?? '')
    .split('\n')
    .filter(Boolean)
    .slice(0, 5);

  blank();
  console.log(wrap('Nowe rzeczy dotykają tych samych miejsc co Twoja praca, więc nie połączę ich sama — zgadywanie, która wersja jest ważniejsza, to nie jest moja decyzja.'));
  blank();
  if (kolidujace.length > 0) {
    console.log('    ' + pc.dim('Chodzi o:'));
    for (const plik of kolidujace) console.log('      ' + pc.dim('·') + ' ' + plik);
    blank();
  }
  if (wrocilo) {
    zrobione('Cofnięte. Jesteś dokładnie tam, gdzie przed uruchomieniem tej komendy');
    uwaga('Twoja praca jest zapisana i nienaruszona. Nic nie zginęło');
  }
  die(
    'Nowe rzeczy kolidują z Twoimi zmianami.',
    'napisz do osoby, która prowadzi repozytorium, i podeślij jej listę plików powyżej. To jest jedna z tych sytuacji, w których dwie osoby pisały w tym samym miejscu — rozwiązuje się ją rozmową, nie komendą.',
    wrocilo
      ? 'Do tego czasu możesz spokojnie pracować dalej. Twoja wersja działa tak, jak działała.'
      : `Jeśli coś wygląda dziwnie, wklej: ${pc.bold(`git reset --hard ${punktPowrotu}`)} — to wraca dokładnie tu, gdzie byłaś.`,
  );
}

zrobione('Połączone');

blank();
rule();
sekcja('GOTOWE');
powiedz('Masz u siebie wszystko, co nowe, i nadal wszystko, co swoje.', 2);
blank();
powiedz(pc.dim('Jeśli doszły nowe zależności, uruchom raz ') + pc.bold('npm install') + pc.dim('.'), 2);
blank();
powiedz('A na dziś, jak zwykle: ' + pc.bold('npm run quest'), 2);
blank();
