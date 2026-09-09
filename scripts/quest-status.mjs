// ══════════════════════════════════════════════════════════════════════
//  CO TO JEST: `npm run quest`. Uruchamia testy i pokazuje stan gry.
//  CO MOŻESZ TU ZMIENIAĆ: nic nie musisz. To narzędzie, nie zadanie.
//  CZEGO LEPIEJ NIE RUSZAĆ: sposobu czytania wyników testów.
//  JAK SPRAWDZIĆ, CZY DZIAŁA: npm run quest
// ══════════════════════════════════════════════════════════════════════

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pc from 'picocolors';
import { wybierzBossaNaDzis } from '../lib/quest/kolejnosc-bossow.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const QUEST_DIR = path.join(ROOT, '.quest');
const STATE_FILE = path.join(QUEST_DIR, 'boss-state.json');
const RESULT_FILE = path.join(QUEST_DIR, '.vitest-result.json');

const WIDTH = 74;
const rule = () => console.log(pc.dim('  ' + '─'.repeat(WIDTH)));
const blank = () => console.log();

/** Dlugosc widoczna na ekranie: kody koloru zajmuja bajty, ale nie kolumny. */
const ANSI = new RegExp(String.fromCharCode(27) + String.raw`\[[0-9;]*m`, 'g');
const visibleLength = (s) => s.replace(ANSI, '').length;

/** Zawija tekst na podana szerokosc, z wcieciem. */
function wrap(text, indent = 4, width = WIDTH - 4) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    if (visibleLength((line + ' ' + word).trim()) > width) {
      lines.push(line.trim());
      line = word;
    } else {
      line += ' ' + word;
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines.map((l) => ' '.repeat(indent) + l).join('\n');
}

function die(message, howToFix) {
  blank();
  console.log('  ' + pc.red('Nie udało się.'));
  blank();
  console.log(wrap(message, 2));
  blank();
  console.log(wrap('Co zrobić: ' + howToFix, 2));
  blank();
  process.exit(1);
}

// ── 1. Uruchom testy ──────────────────────────────────────────────────
fs.mkdirSync(QUEST_DIR, { recursive: true });

const run = spawnSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['vitest', 'run', 'tests/bosses', '--reporter=json', `--outputFile=${RESULT_FILE}`],
  { cwd: ROOT, encoding: 'utf8', shell: process.platform === 'win32' },
);

if (!fs.existsSync(RESULT_FILE)) {
  die(
    'Testy w ogóle się nie uruchomiły, więc nie wiem, którzy bossowie żyją.',
    'sprawdź, czy w katalogu projektu zrobiłaś „npm install”, a potem uruchom „npm run quest” jeszcze raz.',
  );
}

let report;
try {
  report = JSON.parse(fs.readFileSync(RESULT_FILE, 'utf8'));
} catch {
  die('Wynik testów jest nieczytelny.', 'usuń plik .quest/.vitest-result.json i uruchom „npm run quest” ponownie.');
}

// ── 2. Zamień wyniki testów na życie bossów ───────────────────────────
const { bosses } = await import('../config/quest/bosses.ts').catch(async () => {
  // Node nie czyta TypeScriptu bezposrednio, wiec czytamy plik i wyciagamy dane
  // przez lekki parser - taniej niz dokladac krok budowania dla jednego pliku.
  const source = fs.readFileSync(path.join(ROOT, 'config/quest/bosses.ts'), 'utf8');
  const list = [];
  for (const block of source.split(/\n  \{\n/).slice(1)) {
    const field = (name) => {
      const m = new RegExp(`${name}:\\s*((?:'[^']*'(?:\\s*\\+\\s*)?)+)`, 's').exec(block);
      if (!m) return '';
      return [...m[1].matchAll(/'([^']*)'/g)].map((x) => x[1]).join('');
    };
    if (field('id')) {
      list.push({
        id: field('id'),
        name: field('name'),
        difficulty: field('difficulty'),
        where: field('where'),
        meaning: field('meaning'),
        hint: field('hint'),
        whose: field('whose'),
      });
    }
  }
  return { bosses: list };
});

const perBoss = new Map();
for (const file of report.testResults ?? []) {
  for (const assertion of file.assertionResults ?? []) {
    const id = /boss:([a-z0-9-]+)/.exec((assertion.ancestorTitles ?? []).join(' '))?.[1];
    if (!id) continue;
    if (!perBoss.has(id)) perBoss.set(id, { total: 0, failed: 0, failing: [] });
    const entry = perBoss.get(id);
    entry.total += 1;
    if (assertion.status === 'failed') {
      entry.failed += 1;
      entry.failing.push(assertion.title);
    }
  }
}

const state = {
  version: 1,
  at: new Date().toISOString(),
  bosses: bosses.map((boss) => {
    const result = perBoss.get(boss.id) ?? { total: 0, failed: 0, failing: [] };
    return { id: boss.id, hp: result.failed, maxHp: result.total, failing: result.failing };
  }),
};
fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n');
fs.rmSync(RESULT_FILE, { force: true });

// ── 3. Narysuj ekran ──────────────────────────────────────────────────
const alive = state.bosses.filter((b) => b.hp > 0);
const dead = state.bosses.filter((b) => b.maxHp > 0 && b.hp === 0);
const byId = new Map(bosses.map((b) => [b.id, b]));

const today = new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' });

blank();
console.log('  ' + pc.bold('ARTI · QUEST') + pc.dim('  '.repeat(1)) + pc.dim(' '.repeat(Math.max(1, WIDTH - 12 - today.length)) + today));
rule();
blank();

console.log('  ' + pc.dim('DZIŚ'));
blank();
// Ta sama zasada, ktora rysuje ekran misji - zeby terminal i strona nie mowily
// czego innego o tym, co jest na dzis.
const next = wybierzBossaNaDzis(bosses, state.bosses);
if (next) {
  console.log(wrap(`Pokonaj bossa „${next.name}”.`, 2));
  console.log(wrap(`Otwórz ${pc.bold(next.where)} i zamień komentarz między linią (A) a (B).`, 2));
} else if (dead.length > 0) {
  console.log(wrap('Wszyscy bossowie pokonani. Kolejni czekają na następną fazę.', 2));
} else {
  console.log(wrap('Nie ma jeszcze żadnego bossa. To znaczy, że gra dopiero powstaje.', 2));
}
blank();
rule();
blank();

console.log('  ' + pc.dim('BOSSOWIE'));
blank();
if (alive.length === 0) {
  console.log(wrap(pc.dim('Żaden nie żyje.'), 2));
  blank();
}
for (const entry of alive) {
  const boss = byId.get(entry.id);
  const hp = `${entry.hp}/${entry.maxHp} życia`;
  const head = `  ${pc.red('●')} ${pc.bold(boss.name)}`;
  const pad = Math.max(2, WIDTH - boss.name.length - boss.difficulty.length - hp.length - 6);
  console.log(head + ' '.repeat(pad) + pc.dim(boss.difficulty) + '  ' + pc.red(hp));
  console.log('    ' + pc.dim(boss.where));
  blank();
  console.log(wrap(boss.meaning, 4));
  blank();
  console.log(wrap(pc.dim('Wskazówka: ') + boss.hint, 4));
  blank();
  console.log(wrap(pc.dim('Czyj to problem: ') + boss.whose, 4));
  blank();
}

rule();
blank();
console.log('  ' + pc.dim('CMENTARZYSKO'));
blank();
if (dead.length === 0) {
  console.log(wrap(pc.dim('Jeszcze pusto. Pierwszy boss czeka wyżej.'), 2));
} else {
  for (const entry of dead) {
    console.log('    ' + pc.green('✓') + ' ' + byId.get(entry.id).name);
  }
}
blank();
rule();
blank();
console.log('  ' + pc.dim('NASTĘPNY KROK'));
blank();
if (alive.length > 0) {
  console.log(wrap('Zmień plik, zapisz, a potem wklej tutaj:', 2));
  blank();
  console.log('    ' + pc.bold('npm run quest'));
} else {
  console.log(wrap('Zobacz swoją mapę misji. Wklej tutaj:', 2));
  blank();
  console.log('    ' + pc.bold('npm run quest:dev'));
  console.log(wrap(pc.dim('a potem otwórz http://localhost:3000/dev/mission'), 4));
}
blank();

if (run.status !== 0 && alive.length === 0) {
  // Testy padly z innego powodu niz zywy boss - nie udawaj, ze wszystko gra.
  console.log(wrap(pc.yellow('Uwaga: testy zakończyły się błędem, którego nie umiem przypisać do żadnego bossa.'), 2));
  blank();
}
