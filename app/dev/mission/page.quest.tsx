import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import { bosses } from '@/config/quest/bosses';

export const metadata: Metadata = {
  title: 'Baza misji',
  robots: { index: false, follow: false },
};

type BossState = {
  at: string;
  bosses: { id: string; hp: number; maxHp: number; failing: string[] }[];
};

function readState(): BossState | null {
  try {
    const file = path.join(process.cwd(), '.quest', 'boss-state.json');
    return JSON.parse(fs.readFileSync(file, 'utf8')) as BossState;
  } catch {
    // Brak pliku to nie blad - to znaczy, ze `npm run quest` jeszcze nie biegl.
    return null;
  }
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-8 border-t border-rule pt-3 text-[0.7rem] uppercase tracking-[0.28em] text-muted">
      {children}
    </h2>
  );
}

export default function MissionPage() {
  const state = readState();
  const byId = new Map(bosses.map((boss) => [boss.id, boss]));
  const entries = state?.bosses ?? [];
  const alive = entries.filter((entry) => entry.hp > 0);
  const defeated = entries.filter((entry) => entry.maxHp > 0 && entry.hp === 0);

  return (
    <div className="mx-auto w-full max-w-[860px] px-6 py-20 sm:px-10">
      <header className="pb-16">
        <p className="text-[0.7rem] uppercase tracking-[0.28em] text-muted">Baza misji</p>
        <h1 className="mt-5 font-display text-[clamp(2.25rem,7vw,4rem)] leading-[0.95] tracking-[-0.015em]">
          {state === null ? 'Jeszcze nic nie wiemy' : alive.length > 0 ? alive.length === 1 ? 'Jeden boss żyje' : `${alive.length} bossów żyje` : 'Czysto'}
        </h1>
      </header>

      <section>
        <Label>Dziś</Label>
        {state === null ? (
          <div className="max-w-[54ch] space-y-4 font-display text-[1.0625rem] leading-relaxed">
            <p>
              Ten ekran jest pusty, bo gra jeszcze nie policzyła stanu. Nic się nie zepsuło —
              po prostu nikt jeszcze nie sprawdził, którzy bossowie żyją.
            </p>
            <p className="text-muted">
              Otwórz terminal w katalogu projektu i wklej jedną linijkę:
            </p>
            <p>
              <code className="border border-rule px-2 py-1 font-sans text-sm">npm run quest</code>
            </p>
            <p className="text-muted">Potem odśwież tę stronę.</p>
          </div>
        ) : alive.length > 0 ? (
          <p className="max-w-[54ch] font-display text-[1.0625rem] leading-relaxed">
            Pokonaj bossa <strong className="font-normal">{byId.get(alive[0].id)?.name}</strong>.
            Otwórz <code className="font-sans text-sm">{byId.get(alive[0].id)?.where}</code> i zamień
            komentarz między linią (A) a (B).
          </p>
        ) : (
          <p className="max-w-[54ch] font-display text-[1.0625rem] leading-relaxed">
            Wszyscy bossowie, których dotąd postawiliśmy, są pokonani. Następni czekają na kolejną fazę.
          </p>
        )}
      </section>

      <section className="pt-20">
        <Label>Bossowie</Label>
        {alive.length === 0 ? (
          <p className="max-w-[54ch] text-sm text-muted">
            {state === null ? 'Nie policzone.' : 'Żaden nie żyje.'}
          </p>
        ) : (
          <ul className="space-y-12">
            {alive.map((entry) => {
              const boss = byId.get(entry.id);
              if (!boss) return null;
              return (
                <li key={entry.id}>
                  {/* Ta sama miara co tekst nizej - inaczej stan zycia odjezdza
                      na prawy brzeg i przestaje sie wiazac z nazwa bossa. */}
                  <div className="flex max-w-[54ch] flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <h3 className="font-display text-xl">{boss.name}</h3>
                    <span className="text-xs tabular-nums tracking-wide text-muted">
                      {boss.difficulty} · {entry.hp}/{entry.maxHp} życia
                    </span>
                  </div>
                  <p className="mt-1 text-xs tracking-wide text-muted">{boss.where}</p>
                  <p className="mt-4 max-w-[54ch] font-display text-[1.0625rem] leading-relaxed">
                    {boss.meaning}
                  </p>
                  <p className="mt-4 max-w-[54ch] text-sm leading-relaxed text-muted">
                    <span className="uppercase tracking-[0.18em]">Wskazówka</span> — {boss.hint}
                  </p>
                  <p className="mt-2 max-w-[54ch] text-sm leading-relaxed text-muted">
                    <span className="uppercase tracking-[0.18em]">Czyj to problem</span> — {boss.whose}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="pt-20">
        <Label>Cmentarzysko</Label>
        {defeated.length === 0 ? (
          <p className="max-w-[54ch] text-sm text-muted">
            Jeszcze pusto. Tu trafiają bossowie, których pokonałaś — i zostają na stałe.
          </p>
        ) : (
          <ul className="space-y-2">
            {defeated.map((entry) => (
              <li key={entry.id} className="font-display text-[1.0625rem]">
                {byId.get(entry.id)?.name}
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="mt-24 border-t border-rule py-8 text-[0.7rem] uppercase tracking-[0.24em] text-muted">
        {state === null ? 'Stan nie policzony' : `Stan z ${new Date(state.at).toLocaleString('pl-PL')}`}
      </footer>
    </div>
  );
}
