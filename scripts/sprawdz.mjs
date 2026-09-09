// ══════════════════════════════════════════════════════════════════════
//  CO TO JEST: `npm run sprawdz`. Puszcza wszystkie sprawdzenia po kolei,
//              od najtańszego do najdroższego, i staje na pierwszym problemie.
//  CO MOŻESZ TU ZMIENIAĆ: kolejność i skład listy KROKI.
//  CZEGO LEPIEJ NIE RUSZAĆ: kolejności od najtańszego. Czekanie czterech
//                           minut na wiadomość, że nie kompiluje się
//                           TypeScript, to zmarnowane cztery minuty.
//  JAK SPRAWDZIĆ, CZY DZIAŁA: npm run sprawdz
// ══════════════════════════════════════════════════════════════════════

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pc from 'picocolors';

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const WINDOWS = process.platform === 'win32';
const NPM = WINDOWS ? 'npm.cmd' : 'npm';

const argumenty = process.argv.slice(2);
const tylkoSzybkie = argumenty.includes('--szybko');

/**
 * Kolejnosc jest cala trescia tego skryptu. Najpierw rzeczy, ktore odpowiadaja
 * w sekundy i wywalaja sie najczesciej; na koncu te, ktore trwaja minuty.
 */
// Czasy zmierzone tym skryptem, nie oszacowane. Kazde `npm run` doklada wlasny
// narzut startowy, wiec "okolo trzy sekundy" bylo w praktyce dziewiecioma.
const KROKI = [
  { nazwa: 'typy', komenda: [NPM, ['run', 'typecheck']], okolo: '9 s', szybki: true },
  { nazwa: 'testy logiki', komenda: [NPM, ['run', 'test:szybko']], okolo: '11 s', szybki: true },
  { nazwa: 'wszystkie testy', komenda: [NPM, ['test']], okolo: '18 s', szybki: true },
  { nazwa: 'build produkcyjny', komenda: [NPM, ['run', 'build']], okolo: '70 s', szybki: true },
  { nazwa: 'obchód graczy', komenda: [NPM, ['run', 'gracze:lokalnie', '--', '--ruchow', '12']], okolo: '3 min' },
  { nazwa: 'droga nowej osoby', komenda: [NPM, ['run', 'proba']], okolo: '4 min' },
];

const doZrobienia = tylkoSzybkie ? KROKI.filter((k) => k.szybki) : KROKI;

console.log();
console.log('  ' + pc.bold('SPRAWDZENIE PRZED WYSŁANIEM'));
console.log(
  '  ' +
    pc.dim(
      tylkoSzybkie
        ? 'tylko szybkie kroki — pełne przed pushem'
        : `${doZrobienia.length} kroków, od najtańszego; staję na pierwszym problemie`,
    ),
);
console.log();

const wyniki = [];

for (const krok of doZrobienia) {
  process.stdout.write(`  ${pc.dim('·')} ${krok.nazwa.padEnd(22)} ${pc.dim(`(~${krok.okolo})`)} `);
  const start = Date.now();
  const [komenda, args] = krok.komenda;
  const wynik = spawnSync(komenda, args, {
    cwd: ROOT,
    encoding: 'utf8',
    shell: WINDOWS,
    maxBuffer: 64 * 1024 * 1024,
  });
  const sekund = ((Date.now() - start) / 1000).toFixed(1);

  if (wynik.status === 0) {
    console.log(pc.green('✓') + pc.dim(` ${sekund}s`));
    wyniki.push({ ...krok, sekund, ok: true });
    continue;
  }

  console.log(pc.red('✕') + pc.dim(` ${sekund}s`));
  console.log();
  console.log('  ' + pc.red(`Zatrzymałem się na kroku: ${krok.nazwa}`));
  console.log('  ' + pc.dim(`Powtórzysz go komendą: ${komenda === NPM ? 'npm' : komenda} ${args.join(' ')}`));
  console.log();

  // Ostatnie linie wyjscia, bo tam zwykle jest powod. Cale wyjscie potrafi miec
  // tysiace linii i przewijanie go w terminalu niczego nie ulatwia.
  const wyjscie = `${wynik.stdout ?? ''}${wynik.stderr ?? ''}`.trimEnd().split('\n');
  for (const linia of wyjscie.slice(-24)) console.log('    ' + linia);
  console.log();
  process.exit(1);
}

console.log();
const razem = wyniki.reduce((n, w) => n + Number(w.sekund), 0).toFixed(0);
console.log('  ' + pc.green(`Wszystko przechodzi (${razem} s).`));
if (tylkoSzybkie) {
  console.log('  ' + pc.dim('To były same szybkie kroki. Przed pushem uruchom „npm run sprawdz” bez --szybko.'));
}
console.log();
