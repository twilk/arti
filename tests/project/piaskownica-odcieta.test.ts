import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { katy } from '@/config/quest/katas';

const ROOT = process.cwd();

function pliki(katalog: string): string[] {
  const znalezione: string[] = [];
  const chodz = (gdzie: string) => {
    if (!fs.existsSync(gdzie)) return;
    for (const wpis of fs.readdirSync(gdzie, { withFileTypes: true })) {
      const pelna = path.join(gdzie, wpis.name);
      if (wpis.isDirectory()) chodz(pelna);
      else if (/\.tsx?$/.test(wpis.name)) znalezione.push(pelna);
    }
  };
  chodz(path.join(ROOT, katalog));
  return znalezione;
}

const wzgledna = (p: string) => path.relative(ROOT, p).split(path.sep).join('/');

/**
 * Cala kata opiera sie na jednym warunku psychologicznym: ona ma wiedziec, ze tu
 * nic nie da sie zepsuc. Gdyby piaskownica siegala po komponenty prawdziwej strony,
 * jedna nieostrozna zmiana mogla by ja polozyc - i po eksperymentowaniu.
 */
describe('piaskownica jest odcięta od prawdziwej strony', () => {
  it('kata nie importuje komponentów prawdziwej strony', () => {
    const zrodlo = fs.readFileSync(path.join(ROOT, 'components/quest/Kata.tsx'), 'utf8');
    // Wolno siegac po config/quest, nie wolno po components spoza quest.
    expect(zrodlo).not.toMatch(/from '@\/components\/(?!quest\/)/);
    expect(zrodlo).not.toMatch(/from '@\/data\//);
  });

  it('nic z prawdziwej strony nie sięga do piaskownicy', () => {
    const winni = [...pliki('app'), ...pliki('components'), ...pliki('lib'), ...pliki('config')]
      .filter((p) => !p.includes(`${path.sep}quest${path.sep}`) && !p.includes(`${path.sep}dev${path.sep}`))
      .filter((p) => !p.includes('.quest.'))
      .filter((p) => /from '@\/(components\/quest|config\/quest)/.test(fs.readFileSync(p, 'utf8')))
      .map(wzgledna);

    expect(winni).toEqual([]);
  });

  // Tego, ze trasy pod app/dev nie wchodza do buildu produkcyjnego, pilnuje juz
  // produkcja-bez-harnessu.test.ts. Drugi taki sam warunek to drugie miejsce,
  // ktore trzeba pamietac poprawic.

  // Ponizsze dwa sprawdzenia czytaly kiedys plik katas.ts jako tekst i wylawialy
  // z niego wartosci wyrazeniem regularnym. Po przeniesieniu danych do katas.mjs
  // czytaja je jako dane, i tak jest lepiej: parsowanie zrodla lamalo sie o rzeczy,
  // ktore z trescia nie maja nic wspolnego - o wciecie, o przecinek, o koniec wiersza.
  it('każda kata ma swój rysunek w spisie', () => {
    const spis = fs.readFileSync(path.join(ROOT, 'components/quest/rysunki/index.ts'), 'utf8');

    expect(katy.length).toBeGreaterThan(0);
    // Kata bez rysunku wywala sie dopiero przy wejsciu na jej strone, a nie przy
    // dopisaniu jej do talii - czyli w najgorszym momencie.
    const bezRysunku = katy.filter((kata) => !new RegExp('^  ' + kata.id + ':', 'm').test(spis));
    expect(bezRysunku.map((kata) => kata.id)).toEqual([]);
  });

  it('każda kata ma punkt startowy różny od wzorca', () => {
    // Kata, ktorej punkt startowy juz jest wzorcem, nie daje sie wykonac -
    // nie ma czego poprawiac.
    // Wszystkie katy, nie tylko pierwsza - inaczej luka rosnie z kazda dopisana.
    expect(katy.length).toBeGreaterThan(0);
    const bezRoboty = katy.filter(
      (kata) => JSON.stringify(kata.start) === JSON.stringify(kata.wzorzec),
    );
    expect(bezRoboty.map((kata) => kata.id)).toEqual([]);
  });
});
