import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { katy } from '@/config/quest/katas';

const ROOT = process.cwd();

/**
 * Kata jest tresci a nie kodem, wiec TypeScript nie powie ani slowa, gdy brief
 * urosnie do trzech zdan, lista zostanie pusta albo wzorzec wyjdzie poza zakres
 * suwaka. Wyszloby to dopiero wtedy, gdy ona na te kate trafi - czyli najgorzej.
 */
describe('jakość definicji kat', () => {
  it.each(katy.map((k) => [k.id, k] as const))('%s: brief to jedno zdanie', (_id, kata) => {
    // Jedno zdanie. Nie akapit - tak mowi opis silnika i tak ma zostac.
    const kropki = (kata.brief.match(/[.!?](\s|$)/g) ?? []).length;
    expect(kropki).toBe(1);
    expect(kata.brief.trim()).toMatch(/[.!?]$/);
    expect(kata.brief.length).toBeLessThanOrEqual(120);
  });

  it.each(katy.map((k) => [k.id, k] as const))('%s: lista ma od czterech do sześciu pytań', (_id, kata) => {
    expect(kata.lista.length).toBeGreaterThanOrEqual(4);
    expect(kata.lista.length).toBeLessThanOrEqual(6);
    // Pytania zamkniete, wiec kazde konczy sie znakiem zapytania.
    for (const pytanie of kata.lista) expect(pytanie.trim()).toMatch(/\?$/);
  });

  it.each(katy.map((k) => [k.id, k] as const))('%s: komentarz ma od trzech do pięciu akapitów', (_id, kata) => {
    expect(kata.komentarz.length).toBeGreaterThanOrEqual(3);
    expect(kata.komentarz.length).toBeLessThanOrEqual(5);
    // Akapit, ktory nie tlumaczy zasady, tylko opisuje wyglad, nie uczy niczego.
    for (const akapit of kata.komentarz) expect(akapit.length).toBeGreaterThan(80);
  });

  it.each(katy.map((k) => [k.id, k] as const))('%s: każde pokrętło ma wartość startową i wzorcową', (_id, kata) => {
    for (const p of kata.pokretla) {
      expect(kata.start, `brak wartości startowej dla ${p.klucz}`).toHaveProperty(p.klucz);
      expect(kata.wzorzec, `brak wartości wzorcowej dla ${p.klucz}`).toHaveProperty(p.klucz);
    }
    // I odwrotnie: wartosc bez pokretla to wartosc, ktorej ona nie ma jak zmienic.
    const klucze = new Set(kata.pokretla.map((p) => p.klucz));
    for (const klucz of Object.keys(kata.start)) expect(klucze).toContain(klucz);
  });

  it.each(katy.map((k) => [k.id, k] as const))('%s: wartości mieszczą się w zakresach pokręteł', (_id, kata) => {
    for (const p of kata.pokretla) {
      for (const [gdzie, zestaw] of [['start', kata.start], ['wzorzec', kata.wzorzec]] as const) {
        const wartosc = zestaw[p.klucz];
        if (p.rodzaj === 'liczba') {
          expect(Number(wartosc), `${gdzie}.${p.klucz}`).toBeGreaterThanOrEqual(p.min ?? -Infinity);
          expect(Number(wartosc), `${gdzie}.${p.klucz}`).toBeLessThanOrEqual(p.max ?? Infinity);
        } else if (p.rodzaj === 'tekst') {
          expect(typeof wartosc, `${gdzie}.${p.klucz}`).toBe('string');
          if (gdzie === 'start') {
            // Pole na tekst zaczyna sie puste - to jest sens tego cwiczenia.
            expect(String(wartosc), `${gdzie}.${p.klucz}`).toBe('');
          } else {
            // Wersja odslaniana musi cos zawierac, inaczej nie ma czego porownac.
            expect(String(wartosc).length, `${gdzie}.${p.klucz}`).toBeGreaterThan(20);
          }
        } else {
          const dozwolone = (p.mozliwosci ?? []).map((m) => m.wartosc);
          expect(dozwolone, `${gdzie}.${p.klucz}`).toContain(String(wartosc));
        }
      }
    }
  });

  it.each(katy.map((k) => [k.id, k] as const))('%s: każde pokrętło jest używane przez rysunek', (_id, kata) => {
    const spis = fs.readFileSync(path.join(ROOT, 'components/quest/rysunki/index.ts'), 'utf8');
    const nazwaRysunku = new RegExp(`^  ${kata.id}: (\\w+),`, 'm').exec(spis)?.[1];
    expect(nazwaRysunku, `kata ${kata.id} nie ma rysunku w spisie`).toBeTruthy();

    const zrodlo = fs.readFileSync(
      path.join(ROOT, 'components/quest/rysunki', `${nazwaRysunku}.tsx`),
      'utf8',
    );
    // Pokretlo, ktorego rysunek nie czyta, jest suwakiem bez skutku - najgorsza
    // rzecz, jaka mozna dac komus, kto sie uczy: rusza i nic sie nie dzieje.
    const nieuzywane = kata.pokretla.filter((p) => !zrodlo.includes(p.klucz)).map((p) => p.klucz);
    expect(nieuzywane).toEqual([]);
  });

  it.each(katy.map((k) => [k.id, k] as const))('%s: komentarz mówi o tym, co ta kata zmienia', (_id, kata) => {
    // Sprawdzenie jest przyblizone i trzeba wiedziec, gdzie sie myli.
    //
    // Polska odmiana wyklucza dopasowanie doslowne: „obrys” pojawia sie jako „obrysu”,
    // „grubosc” jako „pogrubianie”. Porownujemy wiec piecioznakowe rdzenie slow
    // z etykiety pokretla, bez ogonkow.
    //
    // Czego to NIE wykryje: pokretla o etykiecie z samych krotkich slow (jak „Co stoi
    // wyzej”) sa pomijane, bo nie ma z czego zrobic rdzenia. Zdarza sie tez trafienie
    // przypadkowe - w probie z celowo podmienionym komentarzem wykrylo dwa z trzech
    // pokretel, bo trzecie mialo rdzen wystepujacy w obcym tekscie. To jest siatka
    // na duze dziury, nie dowod, ze komentarz jest dobry.
    const bezOgonkow = (s: string) =>
      s
        .toLowerCase()
        .replace(/ą/g, 'a')
        .replace(/ć/g, 'c')
        .replace(/ę/g, 'e')
        .replace(/ł/g, 'l')
        .replace(/ń/g, 'n')
        .replace(/ó/g, 'o')
        .replace(/ś/g, 's')
        .replace(/ź/g, 'z')
        .replace(/ż/g, 'z');

    const POMIJANE = new Set(['stoi', 'wyzej', 'krawedzi']);
    const rdzenie = (etykieta: string) =>
      bezOgonkow(etykieta)
        .split(/\s+/)
        .filter((s) => s.length > 4 && !POMIJANE.has(s))
        .map((s) => s.slice(0, 5));

    // Sam komentarz, bez listy i briefu. Sprawdzanie tekstu lacznego maskowaloby obcy
    // komentarz wlasna lista katy - sprawdzone: podmieniony komentarz przechodzil.
    const tekst = bezOgonkow(kata.komentarz.join(' '));
    const bezPokrycia = kata.pokretla
      .filter((p) => {
        const r = rdzenie(p.etykieta);
        return r.length > 0 && !r.some((rd) => tekst.includes(rd));
      })
      .map((p) => p.etykieta);

    // Pokretlo, o ktorym komentarz milczy, to pokretlo, ktore ona przestawia
    // bez zrozumienia po co - a zrozumienie jest cala trescia katy.
    expect(bezPokrycia).toEqual([]);
  });

  it.each(katy.map((k) => [k.id, k] as const))('%s: kata na tekst jest oznaczona jako jedna z możliwych', (_id, kata) => {
    const maTekst = kata.pokretla.some((p) => p.rodzaj === 'tekst');
    // Przy liczbach wzorzec JEST odpowiedzia. Przy tekscie dwie dobre odpowiedzi moga
    // nie miec ze soba nic wspolnego, wiec podpisanie jednej jako wzorcowej uczyloby,
    // ze istnieje jedno wlasciwe zdanie.
    expect(Boolean(kata.jednaZMozliwych), maTekst ? 'kata na tekst musi mieć jednaZMozliwych' : 'kata liczbowa nie powinna mieć jednaZMozliwych').toBe(maTekst);
  });

  it('identyfikatory kat są niepowtarzalne', () => {
    const id = katy.map((k) => k.id);
    expect(new Set(id).size).toBe(id.length);
  });
});
