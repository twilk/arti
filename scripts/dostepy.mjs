// ══════════════════════════════════════════════════════════════════════
//  CO TO JEST: `npm run dostepy`. Jednorazowe ustawienie tego, co potrzebne,
//              żeby Twoja praca trafiała do wspólnego repozytorium.
//  CO MOŻESZ TU ZMIENIAĆ: nic nie musisz. To narzędzie, nie zadanie.
//  CZEGO LEPIEJ NIE RUSZAĆ: niczego. Skrypt nigdzie nie zapisuje haseł ani
//                           tokenów - logujesz się sama, w swojej przeglądarce.
//  JAK SPRAWDZIĆ, CZY DZIAŁA: npm run dostepy. Można puszczać wiele razy.
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';

import {
  blank,
  cicho,
  die as zatrzymaj,
  krok as krokEkranu,
  naglowek,
  naWierzchu,
  pc,
  powiedz,
  ROOT,
  rule,
  wrap,
  zrobione,
  zWynikiem,
} from './ekran.mjs';

const REPO = 'twilk/arti';
const GALAZ = 'arti';
const NAJSTARSZY_NODE = 20;

let numerKroku = 0;
const krok = (nazwa) => krokEkranu((numerKroku += 1), 6, nazwa);
const uwaga = (tekst) => console.log('    ' + pc.yellow('•') + ' ' + tekst);

/** Ten sam blad co wszedzie: co sie stalo i co z tym zrobic. */
const die = (coSieStalo, coZrobic) =>
  zatrzymaj(coSieStalo, coZrobic, 'Potem uruchom „npm run dostepy” jeszcze raz. Skrypt pamięta, co już zrobił, i wraca w to samo miejsce.');

const gitConfig = (klucz) => cicho('git', ['config', '--get', klucz]);

// ── Nagłówek ──────────────────────────────────────────────────────────
naglowek('ARTI · DOSTĘPY');
blank();
console.log(wrap('Ustawiam to, czego brakuje, żeby Twoja praca trafiała do wspólnego repozytorium. Idzie to sześcioma krokami i można ten skrypt puszczać ile razy chcesz — nie zepsuje tego, co już zrobione.', 2));
blank();
console.log(wrap(pc.dim('Nigdzie tu nie wpisujesz hasła do mnie ani nie podajesz mi żadnego tokenu. Logujesz się do GitHuba sama, w swojej przeglądarce.'), 2));
blank();
rule();

// ── 1. Narzędzia ──────────────────────────────────────────────────────
krok('Narzędzia');

const wersjaNode = Number(process.versions.node.split('.')[0]);
if (wersjaNode < NAJSTARSZY_NODE) {
  die(
    `Masz Node.js w wersji ${process.versions.node}, a potrzebna jest ${NAJSTARSZY_NODE} albo nowsza.`,
    'pobierz nowszy Node z nodejs.org (wersja oznaczona LTS), zamknij to okno terminala i otwórz je na nowo.',
  );
}
zrobione(`Node.js ${process.versions.node}`);

if (!cicho('git', ['--version'])) {
  die(
    'Nie widzę gita. To on wysyła zmiany do repozytorium, więc bez niego dalej nie pójdzie.',
    'zainstaluj go z git-scm.com, zamknij terminal i otwórz na nowo.',
  );
}
zrobione(cicho('git', ['--version']));

if (!cicho('gh', ['--version'])) {
  blank();
  powiedz('Brakuje jednego narzędzia: „gh”, czyli GitHub CLI. Służy do zalogowania się do GitHuba z terminala.');
  blank();
  const jak =
    process.platform === 'win32'
      ? 'winget install --id GitHub.cli'
      : process.platform === 'darwin'
        ? 'brew install gh'
        : 'zobacz cli.github.com dla swojej dystrybucji';
  die(
    'Nie ma GitHub CLI.',
    `wklej w terminalu: ${pc.bold(jak)} — a potem zamknij to okno i otwórz na nowo, żeby system zobaczył nową komendę.`,
  );
}
zrobione((cicho('gh', ['--version']) ?? '').split('\n')[0]);

// ── 2. Konto GitHub ───────────────────────────────────────────────────
krok('Twoje konto na GitHubie');

if (!cicho('gh', ['auth', 'status'])) {
  // Gdy w srodowisku siedzi token, `gh auth login` odmawia i tlumaczy to po
  // angielsku, w jednym zdaniu, ktore nie mowi co zrobic. Wylapane, bo test
  // tego skryptu wpadl dokladnie w to miejsce.
  const zmiennaZTokenem = ['GH_TOKEN', 'GITHUB_TOKEN'].find((n) => process.env[n]);
  if (zmiennaZTokenem) {
    die(
      `W tym oknie terminala siedzi zmienna ${zmiennaZTokenem}, a GitHub CLI nie chce się logować, dopóki ona tam jest.`,
      process.platform === 'win32'
        ? `wklej: ${pc.bold(`set ${zmiennaZTokenem}=`)} (w PowerShellu: ${pc.bold(`Remove-Item Env:\\${zmiennaZTokenem}`)})`
        : `wklej: ${pc.bold(`unset ${zmiennaZTokenem}`)}`,
    );
  }

  powiedz('Nie jesteś jeszcze zalogowana. Otworzy się teraz okno logowania GitHuba.');
  blank();
  powiedz(pc.dim('Wybierz: GitHub.com → HTTPS → Login with a web browser. Skopiujesz kod z terminala i wkleisz go w przeglądarce.'));
  blank();
  const udalo = naWierzchu('gh', ['auth', 'login', '--hostname', 'github.com', '--git-protocol', 'https', '--web']);
  blank();
  if (!udalo || !cicho('gh', ['auth', 'status'])) {
    die(
      'Logowanie nie doszło do skutku.',
      'spróbuj jeszcze raz — jeśli okno przeglądarki się nie otworzyło, skopiuj adres, który wypisał terminal, i wklej go ręcznie.',
    );
  }
}

const login = cicho('gh', ['api', 'user', '--jq', '.login']);
if (!login) {
  die('Jesteś zalogowana, ale GitHub nie chce powiedzieć, kim.', 'sprawdź połączenie z internetem i uruchom skrypt ponownie.');
}
zrobione(`Zalogowana jako ${pc.bold(login)}`);

// Publiczne repozytorium widzi adres spod kazdego commita. Ten od GitHuba
// dziala jak skrzynka kontaktowa i nie wystawia prywatnego adresu.
const identyfikator = cicho('gh', ['api', 'user', '--jq', '.id']);
const nazwaOsoby = cicho('gh', ['api', 'user', '--jq', '.name // .login']);
const adresBezWyciekania = identyfikator ? `${identyfikator}+${login}@users.noreply.github.com` : null;

// ── 3. Dostęp do repozytorium ─────────────────────────────────────────
krok('Dostęp do repozytorium');

const maPush = () => cicho('gh', ['api', `repos/${REPO}`, '--jq', '.permissions.push']) === 'true';

if (!maPush()) {
  // Zaproszenie czeka na przyjecie - przyjmij je, zamiast kazac jej szukac maila.
  const zaproszenia = cicho('gh', ['api', 'user/repository_invitations', '--jq', `.[] | select(.repository.full_name == "${REPO}") | .id`]);
  const idZaproszenia = (zaproszenia ?? '').split('\n').filter(Boolean)[0];

  if (idZaproszenia) {
    powiedz('Czeka na Ciebie zaproszenie do repozytorium. Przyjmuję je.');
    if (!cicho('gh', ['api', '--method', 'PATCH', `/user/repository_invitations/${idZaproszenia}`])) {
      die('Zaproszenie jest, ale nie dało się go przyjąć.', 'wejdź na github.com/notifications i kliknij „Accept” ręcznie, a potem uruchom skrypt ponownie.');
    }
  }

  if (!maPush()) {
    blank();
    console.log(wrap(pc.bold('Brakuje jednej rzeczy, której nie zrobię za Ciebie z tego miejsca.'), 4));
    blank();
    powiedz(`Nie masz jeszcze prawa zapisu w ${REPO}. Musi Cię dopisać osoba, która prowadzi to repozytorium.`);
    blank();
    console.log(wrap('Wyślij jej dokładnie to zdanie:', 4));
    blank();
    console.log('      ' + pc.bold(`Mój login na GitHubie to ${login} — dopisz mnie do ${REPO.split('/')[1]}, proszę.`));
    blank();
    die('Czekam na dopisanie do repozytorium.', 'wyślij zdanie powyżej i poczekaj na odpowiedź, że już.');
  }
}
zrobione(`Masz prawo zapisu w ${REPO}`);

// ── 4. Podpis pod commitami ───────────────────────────────────────────
krok('Twój podpis pod zmianami');

if (!gitConfig('user.name')) {
  cicho('git', ['config', 'user.name', nazwaOsoby ?? login]);
}
if (!gitConfig('user.email')) {
  if (!adresBezWyciekania) {
    die(
      'Nie umiem ustalić adresu, którym masz się podpisywać.',
      `ustaw go sama, wklejając: ${pc.bold('git config user.email TWÓJ@ADRES')}`,
    );
  }
  cicho('git', ['config', 'user.email', adresBezWyciekania]);
}

zrobione(`Podpis: ${pc.bold(gitConfig('user.name'))} <${gitConfig('user.email')}>`);
if ((gitConfig('user.email') ?? '').endsWith('users.noreply.github.com')) {
  console.log(wrap(pc.dim('To adres od GitHuba, nie Twój prywatny. Repozytorium jest publiczne, a adres spod commita widzi każdy — ten działa jak skrzynka kontaktowa i nie wystawia niczego więcej.'), 6));
}

// ── 5. Zabezpieczenie gałęzi main ─────────────────────────────────────
krok('Zabezpieczenie przed wysyłką na żywą stronę');

// `main` jedzie prosto na produkcje. Pracujesz obok, a na strone trafia to
// dopiero po scaleniu - czyli po czyims kliknieciu, nie po Twoim zapisaniu pliku.
const KATALOG_HOOKOW = cicho('git', ['rev-parse', '--git-path', 'hooks']) ?? '.git/hooks';
const sciezkaHooka = path.resolve(ROOT, KATALOG_HOOKOW, 'pre-push');

const hook = [
  '#!/bin/sh',
  '# Postawione przez `npm run dostepy`. Odmawia wyslania prosto na main.',
  '# Nie jest to kara ani brak zaufania: main jedzie na zywa strone bez pytania,',
  '# a caly sens tej gry polega na tym, ze produkcji nie da sie przypadkiem zepsuc.',
  'while read -r _local_ref _local_sha remote_ref _remote_sha',
  'do',
  '  case "$remote_ref" in',
  '    refs/heads/main|refs/heads/master)',
  '      echo ""',
  '      echo "  Zatrzymane. To bylaby wysylka prosto na main, czyli na zywa strone."',
  '      echo ""',
  '      echo "  Przelacz sie na swoja galaz i wyslij ja:"',
  '      echo ""',
  '      echo "      git switch ' + GALAZ + '"',
  '      echo "      git push"',
  '      echo ""',
  '      exit 1',
  '      ;;',
  '  esac',
  'done',
  'exit 0',
  '',
].join('\n');

fs.mkdirSync(path.dirname(sciezkaHooka), { recursive: true });
fs.writeFileSync(sciezkaHooka, hook, { mode: 0o755 });
zrobione('Wysyłka prosto na main jest zablokowana na Twoim komputerze');

const teraz = cicho('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
if (teraz === 'main' || teraz === 'master') {
  const istnieje = cicho('git', ['rev-parse', '--verify', GALAZ]) !== null;
  // `switch` zabiera niezapisane zmiany ze soba, wiec nic po drodze nie ginie.
  const przelaczone = istnieje
    ? cicho('git', ['switch', GALAZ]) !== null
    : cicho('git', ['switch', '-c', GALAZ]) !== null;
  if (!przelaczone) {
    die(
      `Nie udało się przełączyć Cię na gałąź „${GALAZ}”.`,
      `wklej w terminalu: ${pc.bold(`git switch -c ${GALAZ}`)} — a potem uruchom skrypt ponownie.`,
    );
  }
  zrobione(`Pracujesz teraz na gałęzi ${pc.bold(GALAZ)}, nie na main`);
} else {
  zrobione(`Pracujesz na gałęzi ${pc.bold(teraz ?? '?')} — czyli już obok main`);
}

// ── 6. Próba ──────────────────────────────────────────────────────────
krok('Próba, czy wysyłka przejdzie');

const galazTeraz = cicho('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
// --dry-run pyta serwer o zgode, ale nic nie zapisuje. Jesli tu przejdzie,
// przejdzie i naprawde - czyli nie dowiesz sie o braku dostepu dopiero wtedy,
// gdy bedziesz miala cos gotowego do wyslania.
const proba = zWynikiem('git', ['push', '--dry-run', '--set-upstream', 'origin', `HEAD:refs/heads/${galazTeraz}`]);

if (!proba.ok) {
  const powod = proba.blad.split('\n').slice(-3).join(' ');
  die(
    `Próbna wysyłka nie przeszła. GitHub odpowiedział: ${powod}`,
    'jeśli mowa o logowaniu, wklej „gh auth setup-git” i uruchom skrypt ponownie. Jeśli o prawach — poproś jeszcze raz o dopisanie do repozytorium.',
  );
}
zrobione('Wysyłka przejdzie. Nic jeszcze nie wysłałam — to była próba na sucho');

// ── Co dalej ──────────────────────────────────────────────────────────
blank();
rule();
blank();
console.log('  ' + pc.bold('GOTOWE'));
blank();
console.log(wrap('Od teraz Twoja praca może trafiać do wspólnego repozytorium. Gra działa tak samo jak do tej pory — nic w niej się nie zmieniło.', 2));
blank();
console.log('  ' + pc.dim('GDY BĘDZIESZ MIAŁA COŚ GOTOWEGO'));
blank();
console.log(wrap('Trzy komendy, po kolei, w tym samym oknie terminala:', 2));
blank();
console.log('    ' + pc.bold('git add -A'));
console.log(wrap(pc.dim('zbierz wszystko, co zmieniłaś'), 6));
blank();
console.log('    ' + pc.bold('git commit -m "pokonany boss od kontrastu"'));
console.log(wrap(pc.dim('opisz w cudzysłowie, co zrobiłaś — własnymi słowami, jednym zdaniem'), 6));
blank();
console.log('    ' + pc.bold('git push'));
console.log(wrap(pc.dim('wyślij to na swoją gałąź'), 6));
blank();
console.log(wrap(`Po ${pc.bold('git push')} terminal wypisze adres zaczynający się od github.com — otwórz go i kliknij zielony przycisk. To jest zgłoszenie pracy do scalenia.`, 2));
blank();
console.log(wrap(pc.dim('Na żywą stronę nic nie trafi, dopóki ktoś tego zgłoszenia nie scali. Możesz wysyłać ile chcesz i niczego nie zepsujesz.'), 2));
blank();
rule();
blank();
console.log(wrap('A na dziś, jak zwykle: ' + pc.bold('npm run quest'), 2));
blank();
