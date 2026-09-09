// ══════════════════════════════════════════════════════════════════════
//  CO TO JEST: `npm run gracze:lokalnie`. Buduje stronę od zera, stawia
//              ją, puszcza graczy po wszystkich ekranach i sprząta po sobie.
//  CO MOŻESZ TU ZMIENIAĆ: port, jeśli 4010 jest u Ciebie zajęty.
//  CZEGO LEPIEJ NIE RUSZAĆ: kolejności - budowanie musi być przed startem.
//  JAK SPRAWDZIĆ, CZY DZIAŁA: npm run gracze:lokalnie
// ══════════════════════════════════════════════════════════════════════

import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pc from 'picocolors';

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const PORT = Number(process.env.PORT_GRACZE ?? 4010);
// Wlasny katalog budowania, zeby uruchomiony gdzies obok `next dev` nie nadpisywal
// nam builda w trakcie obchodu.
const KATALOG = '.next-gracze';
const WINDOWS = process.platform === 'win32';
const NPX = WINDOWS ? 'npx.cmd' : 'npx';

const krok = (tekst) => console.log(pc.dim('  · ') + tekst);

/**
 * Serwer trzymajacy stary build to najczestsze zrodlo falszywych wynikow: strona
 * odwoluje sie wtedy do plikow, ktorych juz nie ma, a gracze zglaszaja to jako
 * usterki strony. Dlatego port jest zwalniany przed kazdym uruchomieniem.
 */
function zwolnijPort(port) {
  if (!WINDOWS) {
    spawnSync('bash', ['-lc', `lsof -ti tcp:${port} | xargs -r kill -9`], { stdio: 'ignore' });
    return;
  }
  const wynik = spawnSync('netstat', ['-ano'], { encoding: 'utf8' });
  for (const linia of (wynik.stdout ?? '').split('\n')) {
    if (new RegExp(`:${port}\\s`).test(linia) && linia.includes('LISTENING')) {
      const pid = linia.trim().split(/\s+/).pop();
      if (pid && pid !== '0') spawnSync('taskkill', ['/PID', pid, '/F'], { stdio: 'ignore' });
    }
  }
}

async function czekajNaStrone(url, sekund = 60) {
  const koniec = Date.now() + sekund * 1000;
  while (Date.now() < koniec) {
    try {
      const odp = await fetch(url);
      if (odp.ok) return true;
    } catch {
      // Serwer jeszcze nie wstal - probujemy dalej.
    }
    await new Promise((r) => setTimeout(r, 700));
  }
  return false;
}

console.log();
console.log('  ' + pc.bold('OBCHÓD NA ŚWIEŻO ZBUDOWANEJ STRONIE'));
console.log();

krok(`zwalniam port ${PORT}`);
zwolnijPort(PORT);

krok('buduję stronę od zera (to trwa kilkadziesiąt sekund)');
const budowanie = spawnSync(NPX, ['next', 'build'], {
  cwd: ROOT,
  shell: WINDOWS,
  stdio: 'ignore',
  env: { ...process.env, NEXT_PUBLIC_QUEST: '1', NEXT_DIST_DIR: KATALOG },
});
if (budowanie.status !== 0) {
  console.log();
  console.log('  ' + pc.red('Budowanie się nie udało, więc nie ma czego sprawdzać.'));
  console.log('  Co zrobić: uruchom „npm run build” i przeczytaj, na czym się wywraca.');
  console.log();
  process.exit(1);
}

krok(`stawiam stronę na porcie ${PORT}`);
const serwer = spawn(NPX, ['next', 'start', '-p', String(PORT)], {
  cwd: ROOT,
  shell: WINDOWS,
  stdio: 'ignore',
  env: { ...process.env, NEXT_PUBLIC_QUEST: '1', NEXT_DIST_DIR: KATALOG },
});

const posprzataj = () => {
  serwer.kill();
  zwolnijPort(PORT);
};
process.on('exit', posprzataj);
process.on('SIGINT', () => {
  posprzataj();
  process.exit(130);
});

const podniesiona = await czekajNaStrone(`http://localhost:${PORT}/dev/mission`);
if (!podniesiona) {
  console.log();
  console.log('  ' + pc.red('Strona nie wstała w ciągu minuty.'));
  console.log(`  Co zrobić: sprawdź, czy port ${PORT} nie jest zajęty przez coś innego.`);
  console.log();
  posprzataj();
  process.exit(1);
}

krok('puszczam graczy');
console.log();

const adresy = [
  `http://localhost:${PORT}`,
  `http://localhost:${PORT}/dev/quest`,
  `http://localhost:${PORT}/dev/mission`,
].join(',');

const obchod = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'gracze.mjs'), '--adres', adresy, ...process.argv.slice(2)], {
  cwd: ROOT,
  stdio: 'inherit',
});

posprzataj();
process.exit(obchod.status ?? 0);
