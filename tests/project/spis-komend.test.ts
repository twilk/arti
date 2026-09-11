import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { automatyczne, grupy, wszystkieKomendy } from '@/config/komendy.mjs';

const ROOT = process.cwd();

// Spis komend zyje w trzech miejscach naraz: w package.json (tam, gdzie
// naprawde dzialaja), w config/komendy.mjs (tam, gdzie sa opisane) i w README
// (tam, gdzie sie ich szuka). Trzy miejsca to trzy okazje, zeby sie rozjechaly -
// dokladnie tak, jak rozjechal sie terminal z ekranem misji.
const skrypty: Record<string, string> = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'),
).scripts;

/** „npm run quest” → „quest”. Komendy npm-owe wlasne (npm install, npm test) zostaja. */
function nazwaSkryptu(komenda: string): string | null {
  const bezDopiskow = komenda.split(' -- ')[0].trim();
  const dopasowanie = /^npm (?:run )?([\w:-]+)$/.exec(bezDopiskow);
  if (!dopasowanie) return null;
  return dopasowanie[1];
}

describe('spis komend zgadza się z rzeczywistością', () => {
  it('każda komenda ze spisu naprawdę istnieje', () => {
    const wlasneNpm = new Set(['install', 'test', 'start']);
    const nieistniejace = wszystkieKomendy
      .map((k) => ({ komenda: k.komenda, nazwa: nazwaSkryptu(k.komenda) }))
      .filter(({ nazwa }) => nazwa && !wlasneNpm.has(nazwa) && !(nazwa in skrypty))
      .map(({ komenda }) => komenda);

    expect(nieistniejace).toEqual([]);
  });

  it('każdy skrypt z package.json jest w spisie albo wprost oznaczony jako automatyczny', () => {
    const opisane = new Set(wszystkieKomendy.map((k) => nazwaSkryptu(k.komenda)).filter(Boolean));
    // `start` opisane jest jako „npm start”, a nie „npm run start”.
    opisane.add('start');

    const nieopisane = Object.keys(skrypty).filter(
      (nazwa) => !opisane.has(nazwa) && !automatyczne.includes(nazwa),
    );

    // Komenda, ktorej nie ma w spisie, nie istnieje dla nikogo poza autorem.
    expect(nieopisane).toEqual([]);
  });

  it('README wymienia wszystkie komendy ze spisu', () => {
    const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
    const brakujace = wszystkieKomendy.filter((k) => !readme.includes(k.komenda)).map((k) => k.komenda);

    expect(brakujace).toEqual([]);
  });

  it('opisy są zdaniami, nie hasłami', () => {
    // Haslo w rodzaju „serwer dev” nie mowi nic komus, kto pyta „a to do czego?”.
    const zle = wszystkieKomendy.filter((k) => k.opis.length < 20 || !/[.!?]$/.test(k.opis.trim()));
    expect(zle.map((k) => k.komenda)).toEqual([]);
  });

  it('żadna komenda nie powtarza się w dwóch grupach', () => {
    const wszystkie = wszystkieKomendy.map((k) => k.komenda);
    expect(new Set(wszystkie).size).toBe(wszystkie.length);
  });

  it('każda grupa ma tytuł i wstęp', () => {
    for (const grupa of grupy) {
      expect(grupa.tytul, 'grupa bez tytułu').toBeTruthy();
      expect(grupa.wstep, `grupa „${grupa.tytul}” bez wstępu`).toBeTruthy();
      expect(grupa.komendy.length, `grupa „${grupa.tytul}” jest pusta`).toBeGreaterThan(0);
    }
  });
});
