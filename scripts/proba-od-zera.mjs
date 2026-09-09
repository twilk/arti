// ══════════════════════════════════════════════════════════════════════
//  CO TO JEST: `npm run proba`. Przechodzi drogę nowej osoby: świeży klon,
//              instalacja, pierwsza komenda, pokonanie bossa, sprzątanie.
//  CO MOŻESZ TU ZMIENIAĆ: nic nie musisz.
//  CZEGO LEPIEJ NIE RUSZAĆ: tego, że klonuje do katalogu tymczasowego.
//                           Próba na katalogu roboczym nie sprawdza niczego.
//  JAK SPRAWDZIĆ, CZY DZIAŁA: npm run proba
// ══════════════════════════════════════════════════════════════════════

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pc from 'picocolors';

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const ZDALNE = process.argv.includes('--zdalne');
const KATALOG = path.join(os.tmpdir(), `arti-proba-${Date.now()}`);
const WINDOWS = process.platform === 'win32';

const kroki = [];
let zawiodl = null;

function krok(nazwa, dzialanie) {
  if (zawiodl) return null;
  const start = Date.now();
  try {
    const wynik = dzialanie();
    kroki.push({ nazwa, sekund: ((Date.now() - start) / 1000).toFixed(1), ok: true });
    return wynik;
  } catch (blad) {
    kroki.push({ nazwa, sekund: ((Date.now() - start) / 1000).toFixed(1), ok: false });
    zawiodl = { nazwa, powod: blad.message };
    return null;
  }
}

/** Odpala komendę w katalogu próby i oddaje jej wyjście. */
function uruchom(komenda, argumenty, opcje = {}) {
  const wynik = spawnSync(komenda, argumenty, {
    cwd: opcje.gdzie ?? KATALOG,
    encoding: 'utf8',
    shell: WINDOWS,
    maxBuffer: 32 * 1024 * 1024,
  });
  const wyjscie = `${wynik.stdout ?? ''}${wynik.stderr ?? ''}`;
  if (opcje.musiSieUdac !== false && wynik.status !== 0) {
    throw new Error(`${komenda} zakończyło się kodem ${wynik.status}.\n${wyjscie.slice(-600)}`);
  }
  return wyjscie;
}

function sprzatnij() {
  try {
    fs.rmSync(KATALOG, { recursive: true, force: true });
  } catch {
    // Windows potrafi trzymac pliki chwile dluzej. Katalog jest tymczasowy,
    // wiec zostawienie go nie jest awaria.
  }
}

console.log();
console.log('  ' + pc.bold('PRÓBA OD ZERA'));
console.log('  ' + pc.dim(ZDALNE ? 'klonuję z GitHuba' : 'klonuję to, co jest zacommitowane lokalnie'));
console.log();

krok('klonuję repozytorium', () => {
  const skad = ZDALNE ? 'https://github.com/twilk/arti' : ROOT;
  uruchom('git', ['clone', '--quiet', skad, KATALOG], { gdzie: os.tmpdir() });
});

krok('instaluję zależności', () => uruchom('npm', ['install', '--no-audit', '--no-fund']));

const pierwsze = krok('uruchamiam npm run quest', () => uruchom('npm', ['run', 'quest']));

krok('gra widzi bossów', () => {
  // To jest ten warunek, ktory pekl po sklonowaniu na Windowsie: lista bossow
  // wychodzila pusta, a ekran mowil, ze gra dopiero powstaje.
  if (/Nie ma jeszcze żadnego bossa/.test(pierwsze ?? '')) {
    throw new Error('Świeży klon twierdzi, że nie ma żadnego bossa.');
  }
  if (!/Pokonaj bossa/.test(pierwsze ?? '')) {
    throw new Error('Ekran nie podaje zadania na dziś.');
  }
});

krok('zamieniam komentarz (A) na (B), tak jak mówi instrukcja', () => {
  const plik = path.join(KATALOG, 'config', 'quest', 'tokens.ts');
  let tresc = fs.readFileSync(plik, 'utf8');
  const przed = tresc;
  tresc = tresc
    .replace("export const caption = '#b8b6b0'; // (A) ZEPSUTE", "// export const caption = '#b8b6b0'; // (A) ZEPSUTE")
    .replace("// export const caption = '#66645c'; // (B) DOBRE", "export const caption = '#66645c'; // (B) DOBRE");
  if (tresc === przed) throw new Error('Nie znalazłem linii (A) i (B) w tokens.ts.');
  fs.writeFileSync(plik, tresc);
});

const drugie = krok('uruchamiam npm run quest ponownie', () => uruchom('npm', ['run', 'quest']));

krok('boss trafił na cmentarzysko', () => {
  if (!/Kontrast .* na podpisach prac/.test((drugie ?? '').split('CMENTARZYSKO')[1] ?? '')) {
    throw new Error('Po zamianie komentarza boss nie trafił na cmentarzysko.');
  }
});

krok('testy przechodzą', () => uruchom('npm', ['test']));
krok('strona się buduje', () => uruchom('npm', ['run', 'build']));

sprzatnij();

// ── Wynik ─────────────────────────────────────────────────────────────
console.log();
for (const k of kroki) {
  const znak = k.ok ? pc.green('✓') : pc.red('✕');
  console.log(`  ${znak} ${k.nazwa.padEnd(52)} ${pc.dim(`${k.sekund}s`)}`);
}
console.log();

if (zawiodl) {
  console.log('  ' + pc.red(`Próba zatrzymała się na kroku: ${zawiodl.nazwa}`));
  console.log();
  console.log(
    zawiodl.powod
      .split('\n')
      .map((l) => `    ${l}`)
      .join('\n'),
  );
  console.log();
  console.log('  ' + pc.dim('To znaczy, że u kogoś, kto dopiero pobiera projekt, coś nie zadziała.'));
  console.log();
  process.exit(1);
}

console.log('  ' + pc.green('Droga nowej osoby przechodzi w całości.'));
console.log();
