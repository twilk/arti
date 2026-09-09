import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { bosses } from '@/config/quest/bosses.mjs';
import { katy } from '@/config/quest/katas';
import { zadanieNaDzis } from '@/lib/quest/zadanie-na-dzis.mjs';

const ROOT = process.cwd();

// Ten test istnieje, bo to samo zdarzylo sie dwa razy. .quest/progress.json
// pojechal do repozytorium z moimi postepami, wiec swiezy klon zaczynal
// z odhaczona pierwsza kata i gra proponowala druga. Za pierwszym razem
// wyczyscilem plik recznie - i wrocil, bo czyszczenie nie jest mechanizmem.
const OSOBISTE = ['.quest/progress.json', '.quest/boss-state.json'];

describe('stan gry nie jedzie do repozytorium', () => {
  it('.gitignore wymienia pliki ze stanem', () => {
    const ignore = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8');
    const brakujace = OSOBISTE.filter((plik) => !ignore.includes(plik));
    expect(brakujace).toEqual([]);
  });

  it('git ich nie śledzi', () => {
    let sledzone: string[];
    try {
      sledzone = execFileSync('git', ['ls-files', '.quest'], { cwd: ROOT, encoding: 'utf8' })
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
    } catch {
      // Pobranie projektu zipem zamiast klonem: nie ma repozytorium, nie ma
      // czego sprawdzac. Warunek wyzej i tak zostaje.
      return;
    }
    expect(sledzone.filter((plik) => OSOBISTE.includes(plik))).toEqual([]);
  });

  it('bez postępu pierwszym zadaniem jest pierwsza kata z talii', () => {
    // Bez tego warunku wyzsze dwa zamienilyby jeden blad na drugi: zamiast
    // cudzych postepow byloby puste miejsce. Tu sprawdzam na prawdziwych
    // danych gry, ze brak pliku daje sensowne pierwsze zadanie - to samo,
    // ktore README obiecuje w tutorialu.
    const wynik = zadanieNaDzis({ bossowie: bosses, stanBossow: [], katy, postep: null });

    expect(wynik.rodzaj).toBe('kata');
    expect(wynik.kata.id).toBe(katy[0].id);
  });

  it('README wysyła na tę samą katę, którą da gra', () => {
    const wynik = zadanieNaDzis({ bossowie: bosses, stanBossow: [], katy, postep: null });
    const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');

    // Tutorial podaje konkretny adres. Gdy talia kat sie przestawi, ten adres
    // stanie sie nieprawda w pierwszym kroku instrukcji dla poczatkujacej osoby.
    expect(readme).toContain(`/dev/kata/${wynik.kata.id}`);
  });
});
