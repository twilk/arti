import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();

function wszystkieTesty(katalog: string): string[] {
  const znalezione: string[] = [];
  const chodz = (gdzie: string) => {
    if (!fs.existsSync(gdzie)) return;
    for (const wpis of fs.readdirSync(gdzie, { withFileTypes: true })) {
      const pelna = path.join(gdzie, wpis.name);
      if (wpis.isDirectory()) chodz(pelna);
      else if (/\.test\.tsx?$/.test(wpis.name)) znalezione.push(pelna);
    }
  };
  chodz(path.join(ROOT, katalog));
  return znalezione;
}

/**
 * Testy renderujace komponenty potrzebuja jsdomu, a jsdom kosztuje kilka sekund
 * na start. Dlatego siedza w plikach z koncowka .render.test.tsx i da sie je
 * pominac w szybkim przebiegu. Konwencja bez pilnowania rozjezdza sie po tygodniu:
 * ktos dopisze test z jsdomem pod zwykla nazwa, szybki przebieg znowu zwolni,
 * i nikt nie bedzie wiedzial dlaczego.
 */
describe('konwencje testów', () => {
  it('każdy test z jsdomem nazywa się .render.test.tsx', () => {
    // Tylko pierwsza linia, bo tylko tam ta dyrektywa cokolwiek znaczy dla vitesta.
    // Szukanie po calej tresci zglaszaloby ten plik, ktory o niej po prostu pisze.
    const uzywaJsdomu = (plik: string) =>
      /^\s*\/\/\s*@vitest-environment\s+jsdom/.test(fs.readFileSync(plik, 'utf8').split('\n')[0] ?? '');

    const zleNazwane = wszystkieTesty('tests/project')
      .filter(uzywaJsdomu)
      .filter((plik) => !plik.endsWith('.render.test.tsx'))
      .map((plik) => path.relative(ROOT, plik).split(path.sep).join('/'));

    expect(zleNazwane).toEqual([]);
  });

  it('szybki przebieg naprawdę pomija testy renderujące', () => {
    const paczka = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    expect(paczka.scripts['test:szybko']).toContain('--exclude');
    expect(paczka.scripts['test:szybko']).toContain('render.test.tsx');
    // Domyslna komenda ma sprawdzac wszystko. Odwrotnie byloby pulapka:
    // latwo zapomniec o pelnym przebiegu, trudno zapomniec o szybkim.
    expect(paczka.scripts.test).not.toContain('--exclude');
  });
});
