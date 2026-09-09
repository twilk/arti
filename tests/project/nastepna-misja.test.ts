import { describe, expect, it } from 'vitest';
import type { Boss } from '@/config/quest/bosses';
import { bossNaDzis } from '@/lib/quest/nastepna-misja';

const boss = (id: string, difficulty: Boss['difficulty']): Boss => ({
  id,
  difficulty,
  name: id,
  where: 'config/quest/tokens.ts',
  meaning: '',
  hint: '',
  whose: '',
});

const BOSSOWIE = [
  boss('trudny-pierwszy', 'trudny'),
  boss('sredni-drugi', 'średni'),
  boss('latwy-trzeci', 'łatwy'),
  boss('latwy-czwarty', 'łatwy'),
];

describe('bossNaDzis', () => {
  it('nie proponuje nic, gdy wszyscy pokonani', () => {
    const stan = BOSSOWIE.map((b) => ({ id: b.id, hp: 0, maxHp: 3 }));
    expect(bossNaDzis(BOSSOWIE, stan)).toBeNull();
  });

  it('bierze najłatwiejszego, a nie pierwszego z listy', () => {
    const stan = BOSSOWIE.map((b) => ({ id: b.id, hp: 2, maxHp: 3 }));
    expect(bossNaDzis(BOSSOWIE, stan)?.id).toBe('latwy-trzeci');
  });

  it('wśród równie łatwych bierze tego bliżej pokonania', () => {
    const stan = [
      { id: 'trudny-pierwszy', hp: 3, maxHp: 3 },
      { id: 'sredni-drugi', hp: 3, maxHp: 3 },
      { id: 'latwy-trzeci', hp: 3, maxHp: 3 },
      { id: 'latwy-czwarty', hp: 1, maxHp: 3 },
    ];
    expect(bossNaDzis(BOSSOWIE, stan)?.id).toBe('latwy-czwarty');
  });

  it('pomija pokonanych, nawet gdy byli najłatwiejsi', () => {
    const stan = [
      { id: 'trudny-pierwszy', hp: 2, maxHp: 3 },
      { id: 'sredni-drugi', hp: 2, maxHp: 3 },
      { id: 'latwy-trzeci', hp: 0, maxHp: 3 },
      { id: 'latwy-czwarty', hp: 0, maxHp: 3 },
    ];
    expect(bossNaDzis(BOSSOWIE, stan)?.id).toBe('sredni-drugi');
  });

  it('daje ten sam wynik przy każdym wywołaniu', () => {
    // Losowanie zadania na dzis oznaczaloby, ze dwa uruchomienia tej samej
    // komendy mowia co innego - i nie dalo by sie jej ufac.
    const stan = BOSSOWIE.map((b) => ({ id: b.id, hp: 2, maxHp: 3 }));
    const wyniki = Array.from({ length: 5 }, () => bossNaDzis(BOSSOWIE, stan)?.id);
    expect(new Set(wyniki).size).toBe(1);
  });

  it('nie wywraca się na stanie opisującym bossa, którego już nie ma', () => {
    const stan = [
      { id: 'usuniety-dawno-temu', hp: 3, maxHp: 3 },
      { id: 'latwy-trzeci', hp: 2, maxHp: 3 },
    ];
    expect(bossNaDzis(BOSSOWIE, stan)?.id).toBe('latwy-trzeci');
  });
});
