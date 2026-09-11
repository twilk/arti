// ══════════════════════════════════════════════════════════════════════
//  CO TO JEST: `npm run wyslij`. Zapisuje Twoją pracę i wysyła ją do
//              wspólnego repozytorium, jedną komendą zamiast trzech.
//  CO MOŻESZ TU ZMIENIAĆ: nic nie musisz. To narzędzie, nie zadanie.
//  CZEGO LEPIEJ NIE RUSZAĆ: zakazu wysyłki na main. Main to żywa strona.
//  JAK SPRAWDZIĆ, CZY DZIAŁA: npm run wyslij
// ══════════════════════════════════════════════════════════════════════

import {
  cicho,
  die,
  krok,
  naglowek,
  pc,
  powiedz,
  pytaj,
  rule,
  sekcja,
  zrobione,
  zWynikiem,
  blank,
} from './ekran.mjs';

const GALAZ_DOMYSLNA = 'arti';
const ZAKAZANE = new Set(['main', 'master']);

naglowek('ARTI · WYSYŁKA');
blank();
powiedz('Zapisuję to, co zmieniłaś, i wysyłam do wspólnego repozytorium. Na żywą stronę nic z tego nie trafi — dopóki ktoś tego nie scali, leży to obok.', 2);

// ── 1. Gdzie jesteś ───────────────────────────────────────────────────
krok(1, 4, 'Gdzie jesteś');

if (!cicho('git', ['rev-parse', '--git-dir'])) {
  die(
    'To okno terminala nie stoi w katalogu z projektem.',
    `wejdź do katalogu ${pc.bold('arti')} komendą ${pc.bold('cd arti')} i spróbuj jeszcze raz.`,
  );
}

let galaz = cicho('git', ['rev-parse', '--abbrev-ref', 'HEAD']);

if (ZAKAZANE.has(galaz)) {
  // Nie odmawiam i nie zostawiam jej z problemem - przenosze na jej galaz.
  // `switch` zabiera niezapisane zmiany ze soba, wiec nic po drodze nie ginie.
  powiedz(`Stoisz na gałęzi ${pc.bold(galaz)}, czyli na tej, z której buduje się żywa strona. Przenoszę Cię na Twoją własną — razem ze wszystkim, co masz niezapisane.`);
  const istnieje = cicho('git', ['rev-parse', '--verify', GALAZ_DOMYSLNA]) !== null;
  const przeniesienie = istnieje
    ? zWynikiem('git', ['switch', GALAZ_DOMYSLNA])
    : zWynikiem('git', ['switch', '-c', GALAZ_DOMYSLNA]);
  if (!przeniesienie.ok) {
    die(
      `Nie udało się przenieść Cię na gałąź „${GALAZ_DOMYSLNA}”. Git powiedział: ${przeniesienie.blad.split('\n').slice(-2).join(' ')}`,
      `wklej w terminalu: ${pc.bold(`git switch -c ${GALAZ_DOMYSLNA}`)} — a potem uruchom „npm run wyslij” jeszcze raz.`,
    );
  }
  galaz = cicho('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  blank();
}
zrobione(`Gałąź ${pc.bold(galaz)} — to Twoje miejsce, nie żywa strona`);

// ── 2. Co się zmieniło ────────────────────────────────────────────────
krok(2, 4, 'Co się zmieniło');

const zmiany = (cicho('git', ['status', '--porcelain']) ?? '')
  .split('\n')
  .map((l) => l.trim())
  .filter(Boolean);

const niewyslane = Number(cicho('git', ['rev-list', '--count', `origin/${galaz}..HEAD`]) ?? '0') || 0;
const galazJestNaSerwerze = cicho('git', ['rev-parse', '--verify', `origin/${galaz}`]) !== null;
const doWyslania = galazJestNaSerwerze ? niewyslane : Number(cicho('git', ['rev-list', '--count', 'HEAD']) ?? '0');

if (zmiany.length === 0 && doWyslania === 0) {
  blank();
  powiedz('Nie ma czego wysyłać — wszystko, co zrobiłaś, już tam jest.', 2);
  blank();
  powiedz(pc.dim('Jeśli spodziewałaś się tu czegoś innego, sprawdź, czy plik na pewno został zapisany (Ctrl+S).'), 2);
  blank();
  process.exit(0);
}

if (zmiany.length > 0) {
  powiedz('Zmienione pliki:');
  blank();
  for (const wiersz of zmiany.slice(0, 12)) {
    console.log('      ' + pc.dim(wiersz.slice(0, 2).trim().padEnd(2)) + ' ' + wiersz.slice(2).trim());
  }
  if (zmiany.length > 12) console.log('      ' + pc.dim(`…i jeszcze ${zmiany.length - 12}`));
} else {
  powiedz(`Nic nowego w plikach, ale masz ${doWyslania} zapisanych zmian, które jeszcze nie pojechały. Wyślę je.`);
}

// ── 3. Opis ───────────────────────────────────────────────────────────
let numerKroku = 3;
if (zmiany.length > 0) {
  krok(numerKroku, 4, 'Powiedz jednym zdaniem, co zrobiłaś');

  powiedz(pc.dim('To zdanie zobaczy osoba, która będzie to scalać. Własnymi słowami — nie musi być fachowo.'));
  powiedz(pc.dim('Na przykład: „pokonany boss od kontrastu podpisów”.'));
  blank();

  const zArgumentu = process.argv.slice(2).join(' ').trim();
  let opis = zArgumentu;
  while (!opis) {
    // eslint-disable-next-line no-await-in-loop
    opis = await pytaj('Co zrobiłaś?');
    if (!opis) {
      blank();
      powiedz(pc.dim('Bez opisu nie wyślę — za tydzień nikt (Ty też nie) nie będzie pamiętał, co w tym było.'));
      blank();
    }
  }

  cicho('git', ['add', '-A']);
  const zapis = zWynikiem('git', ['commit', '-m', opis]);
  if (!zapis.ok && !/nothing to commit/i.test(zapis.wyjscie + zapis.blad)) {
    const skarga = (zapis.blad || zapis.wyjscie).split('\n').slice(-2).join(' ');
    // Nie zgaduj przyczyny. Pierwsza wersja tego komunikatu zawsze odsylala do
    // podpisu w gicie, takze wtedy, gdy chodzilo o cos zupelnie innego - a zla
    // podpowiedz jest gorsza niz zadna, bo wysyla w slepa uliczke.
    const oPodpisie = /user\.(name|email)|Please tell me who you are/i.test(skarga);
    die(
      `Nie udało się zapisać zmian. Git powiedział: ${skarga}`,
      oPodpisie
        ? `uruchom ${pc.bold('npm run dostepy')} — to on ustawia Twój podpis w gicie.`
        : 'przeczytaj zdanie powyżej i podeślij je osobie, która prowadzi repozytorium. Twoje pliki są nietknięte.',
    );
  }
  blank();
  zrobione(`Zapisane: „${opis}”`);
} else {
  numerKroku = 3;
  krok(numerKroku, 4, 'Zapisywanie');
  zrobione('Nie ma nowych zmian do zapisania — wysyłam to, co już zapisane');
}

// ── 4. Wysyłka ────────────────────────────────────────────────────────
krok(4, 4, 'Wysyłka');

const wysylka = zWynikiem('git', ['push', '--set-upstream', 'origin', galaz]);
if (!wysylka.ok) {
  const powod = (wysylka.blad || wysylka.wyjscie).split('\n').slice(-3).join(' ');
  if (/non-fast-forward|fetch first|rejected/i.test(powod)) {
    die(
      'Ktoś dopisał coś do Twojej gałęzi na serwerze, więc wysyłka się rozminęła. Twoja praca jest bezpieczna — leży zapisana u Ciebie.',
      `uruchom ${pc.bold('npm run pobierz')}, a potem ${pc.bold('npm run wyslij')} jeszcze raz.`,
    );
  }
  die(
    `Wysyłka nie przeszła. GitHub odpowiedział: ${powod}`,
    `jeśli mowa o logowaniu albo o prawach dostępu, uruchom ${pc.bold('npm run dostepy')} — sprawdzi po kolei, czego brakuje.`,
    'Twoja praca jest zapisana u Ciebie i nic jej nie grozi. Wysyłka to tylko ostatni krok.',
  );
}
zrobione('Wysłane');

// ── Zgłoszenie do scalenia ────────────────────────────────────────────
const repo = (cicho('git', ['remote', 'get-url', 'origin']) ?? '').replace(/^.*github\.com[:/]/, '').replace(/\.git$/, '');

let adresPR = cicho('gh', ['pr', 'list', '--head', galaz, '--state', 'open', '--json', 'url', '--jq', '.[0].url']);

if (!adresPR) {
  const ostatniOpis = cicho('git', ['log', '-1', '--pretty=%s']) ?? 'Zmiany z questa';
  const utworzone = zWynikiem('gh', [
    'pr',
    'create',
    '--base',
    'main',
    '--head',
    galaz,
    '--title',
    ostatniOpis,
    '--body',
    'Praca z questa. Zmiany leżą na gałęzi obok — na żywą stronę trafią dopiero po scaleniu tego zgłoszenia.',
  ]);
  if (utworzone.ok) adresPR = utworzone.wyjscie.split('\n').filter((l) => l.startsWith('http'))[0] ?? null;
}

blank();
rule();
sekcja('GOTOWE');

if (adresPR) {
  powiedz('Twoja praca czeka na scalenie tutaj:', 2);
  blank();
  console.log('      ' + pc.bold(adresPR));
} else {
  // gh moze nie byc albo moze odmowic - wtedy zwykly adres do klikniecia
  // zalatwia to samo, tylko recznie.
  powiedz('Wysłane. Zgłoszenie do scalenia otworzysz tutaj:', 2);
  blank();
  console.log('      ' + pc.bold(`https://github.com/${repo}/compare/main...${galaz}?expand=1`));
}

blank();
powiedz(pc.dim('Na żywą stronę nic nie trafi, dopóki ktoś tego nie scali. Możesz wysyłać ile chcesz — kolejne wysyłki dopisują się do tego samego zgłoszenia.'), 2);
blank();
powiedz('A na dziś, jak zwykle: ' + pc.bold('npm run quest'), 2);
blank();
