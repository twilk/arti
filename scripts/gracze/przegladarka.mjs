// ══════════════════════════════════════════════════════════════════════
//  CO TO JEST: znajduje przeglądarkę Chrome na tym komputerze.
//  CO MOŻESZ TU ZMIENIAĆ: listę miejsc, w których szukamy.
//  CZEGO LEPIEJ NIE RUSZAĆ: reszty.
//  JAK SPRAWDZIĆ, CZY DZIAŁA: npm run gracze
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';

const MIEJSCA = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  `${process.env.LOCALAPPDATA ?? ''}/Google/Chrome/Application/chrome.exe`,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

/** Zwraca ścieżkę do przeglądarki albo rzuca błędem po polsku. */
export function znajdzPrzegladarke() {
  for (const miejsce of MIEJSCA) {
    if (fs.existsSync(miejsce)) return miejsce;
  }
  throw new Error(
    'Nie znalazłem przeglądarki Chrome ani Edge na tym komputerze.\n' +
      'Co zrobić: zainstaluj Chrome, albo wskaż ścieżkę zmienną CHROME_PATH.',
  );
}
