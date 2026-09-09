import { describe, expect, it } from 'vitest';
import { katWTygodniu, kluczTygodnia, zadanieNaDzis } from '@/lib/quest/zadanie-na-dzis.mjs';

const BOSSOWIE = [
  { id: 'latwy', difficulty: 'łatwy', name: 'Łatwy' },
  { id: 'sredni', difficulty: 'średni', name: 'Średni' },
];
const KATY = [{ id: 'hierarchia' }, { id: 'stany' }];
const ZYWE = [
  { id: 'latwy', hp: 2, maxHp: 3 },
  { id: 'sredni', hp: 2, maxHp: 3 },
];
const POKONANE = [
  { id: 'latwy', hp: 0, maxHp: 3 },
  { id: 'sredni', hp: 0, maxHp: 3 },
];

describe('kluczTygodnia', () => {
  it('liczy tygodnie według ISO, od poniedziałku', () => {
    // 4 stycznia zawsze wypada w pierwszym tygodniu roku wedlug ISO 8601.
    expect(kluczTygodnia(new Date('2026-01-04T12:00:00'))).toBe('2026-W01');
  });

  it('niedziela należy do tygodnia, który się właśnie kończy', () => {
    const sobota = kluczTygodnia(new Date('2026-09-12T12:00:00'));
    const niedziela = kluczTygodnia(new Date('2026-09-13T12:00:00'));
    const poniedzialek = kluczTygodnia(new Date('2026-09-14T12:00:00'));
    expect(niedziela).toBe(sobota);
    expect(poniedzialek).not.toBe(niedziela);
  });
});

describe('katWTygodniu', () => {
  it('liczy tylko katy z podanego tygodnia', () => {
    const postep = {
      katy: {
        a: { skonczona: true, tydzien: '2026-W37' },
        b: { skonczona: true, tydzien: '2026-W37' },
        c: { skonczona: true, tydzien: '2026-W36' },
      },
    };
    expect(katWTygodniu(postep, '2026-W37')).toBe(2);
    expect(katWTygodniu(postep, '2026-W36')).toBe(1);
  });

  it('nie wywraca się na pustym postępie', () => {
    expect(katWTygodniu(null, '2026-W37')).toBe(0);
    expect(katWTygodniu({}, '2026-W37')).toBe(0);
  });
});

describe('zadanieNaDzis', () => {
  const teraz = new Date('2026-09-09T10:00:00');
  const tydzien = kluczTygodnia(teraz);

  it('bez katy w tym tygodniu daje katę, nawet gdy bossowie żyją', () => {
    const wynik = zadanieNaDzis({ bossowie: BOSSOWIE, stanBossow: ZYWE, katy: KATY, postep: null, teraz });
    expect(wynik.rodzaj).toBe('kata');
    expect(wynik.kata.id).toBe('hierarchia');
  });

  it('gdy kata w tym tygodniu już była, wraca boss', () => {
    const postep = { katy: { hierarchia: { skonczona: true, tydzien } } };
    const wynik = zadanieNaDzis({ bossowie: BOSSOWIE, stanBossow: ZYWE, katy: KATY, postep, teraz });
    expect(wynik.rodzaj).toBe('boss');
    expect(wynik.boss.id).toBe('latwy');
  });

  it('kata z zeszłego tygodnia nie zalicza tego tygodnia', () => {
    const postep = { katy: { hierarchia: { skonczona: true, tydzien: '2026-W01' } } };
    const wynik = zadanieNaDzis({ bossowie: BOSSOWIE, stanBossow: ZYWE, katy: KATY, postep, teraz });
    expect(wynik.rodzaj).toBe('kata');
    // Skonczona kata nie wraca - proponowana jest nastepna z talii.
    expect(wynik.kata.id).toBe('stany');
  });

  it('gdy bossowie pokonani, a katy zostały, daje katę', () => {
    const postep = { katy: { hierarchia: { skonczona: true, tydzien } } };
    const wynik = zadanieNaDzis({ bossowie: BOSSOWIE, stanBossow: POKONANE, katy: KATY, postep, teraz });
    expect(wynik.rodzaj).toBe('kata');
    expect(wynik.kata.id).toBe('stany');
  });

  it('gdy nie ma już nic, mówi to wprost zamiast udawać zadanie', () => {
    const postep = {
      katy: {
        hierarchia: { skonczona: true, tydzien },
        stany: { skonczona: true, tydzien },
      },
    };
    const wynik = zadanieNaDzis({ bossowie: BOSSOWIE, stanBossow: POKONANE, katy: KATY, postep, teraz });
    expect(wynik.rodzaj).toBe('nic');
  });

  it('daje ten sam wynik przy każdym wywołaniu', () => {
    const wyniki = Array.from({ length: 5 }, () =>
      JSON.stringify(zadanieNaDzis({ bossowie: BOSSOWIE, stanBossow: ZYWE, katy: KATY, postep: null, teraz })),
    );
    expect(new Set(wyniki).size).toBe(1);
  });
});
