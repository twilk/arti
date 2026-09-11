// ══════════════════════════════════════════════════════════════════════
//  CO TO JEST: wspólny wygląd wszystkich komend w terminalu - ramka,
//              zawijanie tekstu, komunikat błędu, pytanie do Ciebie.
//  CO MOŻESZ TU ZMIENIAĆ: nic nie musisz. To narzędzie, nie zadanie.
//  CZEGO LEPIEJ NIE RUSZAĆ: całości. Gdyby każda komenda miała własną
//                           kopię tego pliku, po miesiącu mówiłyby innym
//                           głosem i innym językiem o tych samych rzeczach.
//  JAK SPRAWDZIĆ, CZY DZIAŁA: npm run pomoc
// ══════════════════════════════════════════════════════════════════════

import { execFileSync, spawnSync } from 'node:child_process';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import pc from 'picocolors';

export const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
export const SZEROKOSC = 74;

export const blank = () => console.log();
export const rule = () => console.log(pc.dim('  ' + '─'.repeat(SZEROKOSC)));

/** Dlugosc widoczna na ekranie: kody koloru zajmuja bajty, ale nie kolumny. */
const ANSI = new RegExp(String.fromCharCode(27) + String.raw`\[[0-9;]*m`, 'g');
export const dlugoscWidoczna = (s) => String(s).replace(ANSI, '').length;

/** Zawija tekst na szerokość ramki, z wcięciem. */
export function wrap(tekst, wciecie = 4, szerokosc = SZEROKOSC - 4) {
  const slowa = String(tekst).split(/\s+/);
  const linie = [];
  let linia = '';
  for (const slowo of slowa) {
    if (dlugoscWidoczna((linia + ' ' + slowo).trim()) > szerokosc) {
      linie.push(linia.trim());
      linia = slowo;
    } else {
      linia += ' ' + slowo;
    }
  }
  if (linia.trim()) linie.push(linia.trim());
  return linie.map((l) => ' '.repeat(wciecie) + l).join('\n');
}

/** Nagłówek komendy. Po prawej można dopisać datę albo cokolwiek krótkiego. */
export function naglowek(tytul, poPrawej = '') {
  blank();
  const odstep = Math.max(1, SZEROKOSC - dlugoscWidoczna(tytul) - dlugoscWidoczna(poPrawej));
  console.log(('  ' + pc.bold(tytul) + (poPrawej ? ' '.repeat(odstep) + pc.dim(poPrawej) : '')).trimEnd());
  rule();
}

export const powiedz = (tekst, wciecie = 4) => console.log(wrap(tekst, wciecie));
export const zrobione = (tekst) => console.log('    ' + pc.green('✓') + ' ' + tekst);
export const uwaga = (tekst) => console.log('    ' + pc.yellow('•') + ' ' + tekst);

/** Ponumerowany krok. Numer idzie z licznika komendy, nie z globalnego stanu. */
export function krok(numer, zIlu, nazwa) {
  blank();
  console.log('  ' + pc.dim(`KROK ${numer} Z ${zIlu}`) + '  ' + pc.bold(nazwa));
  blank();
}

/** Podtytuł sekcji, pisany kapitalikami jak nagłówki na ekranie questa. */
export const sekcja = (tytul) => {
  blank();
  console.log('  ' + pc.dim(tytul));
  blank();
};

/**
 * Zatrzymuje komendę i mówi dwie rzeczy: co się stało i co z tym zrobić.
 * Bez tej drugiej części komunikat błędu jest tylko informacją, że jest źle.
 */
export function die(coSieStalo, coZrobic, jakWrocic) {
  blank();
  rule();
  blank();
  console.log('  ' + pc.red('Tu się zatrzymuje.'));
  blank();
  console.log(wrap(coSieStalo, 2));
  blank();
  console.log(wrap(pc.bold('Co zrobić: ') + coZrobic, 2));
  if (jakWrocic) {
    blank();
    console.log(wrap(pc.dim(jakWrocic), 2));
  }
  blank();
  process.exit(1);
}

/**
 * Czy komendę trzeba puścić przez powłokę.
 *
 * Na Windowsie npm i npx to pliki .cmd, więc bez powłoki się nie uruchomią.
 * git i gh to zwykłe .exe i powłoki nie potrzebują - a to nie jest drobiazg:
 * przy `shell: true` argument ze spacjami rozpada się na osobne argumenty,
 * więc `git commit -m "pokonany boss od kontrastu"` zapisywało wiadomość
 * „pokonany”, a reszta leciała jako nazwy plików. Wyszło przy pierwszej
 * prawdziwej próbie wysyłki i uderzyłoby w każdy opis dłuższy niż jedno słowo.
 */
const PRZEZ_POWLOKE = new Set(['npm', 'npx', 'yarn', 'pnpm']);
const czyPowloka = (komenda) => process.platform === 'win32' && PRZEZ_POWLOKE.has(komenda);

/** Odpala komendę po cichu. Null, gdy komendy nie ma albo zawiodła. */
export function cicho(komenda, argumenty, opcje = {}) {
  try {
    return execFileSync(komenda, argumenty, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      shell: czyPowloka(komenda),
      ...opcje,
    }).trim();
  } catch {
    return null;
  }
}

/** Odpala komendę i zwraca wszystko: kod wyjścia, wyjście i błędy. */
export function zWynikiem(komenda, argumenty) {
  const wynik = spawnSync(komenda, argumenty, {
    cwd: ROOT,
    encoding: 'utf8',
    shell: czyPowloka(komenda),
  });
  return {
    ok: wynik.status === 0,
    wyjscie: String(wynik.stdout ?? '').trim(),
    blad: String(wynik.stderr ?? '').trim(),
  };
}

/** Odpala komendę tak, żeby było ją widać i żeby dało się z nią rozmawiać. */
export function naWierzchu(komenda, argumenty) {
  const wynik = spawnSync(komenda, argumenty, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: czyPowloka(komenda),
  });
  return wynik.status === 0;
}

/** Pyta i czeka na odpowiedź. Pusta odpowiedź to też odpowiedź. */
export function pytaj(pytanie) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((gotowe) => {
    rl.question('    ' + pc.bold(pytanie) + ' ', (odpowiedz) => {
      rl.close();
      gotowe(odpowiedz.trim());
    });
  });
}

export { pc };
