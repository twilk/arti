import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import { bosses } from '@/config/quest/bosses';

export const metadata: Metadata = {
  title: 'Baza misji',
  robots: { index: false, follow: false },
};

// Stan gry siedzi w plikach, ktore zmieniaja sie miedzy uruchomieniami.
// Bez tego Next policzylby te strone raz, przy budowaniu, i zamrozil na niej
// stan z tamtej chwili - pokonany boss nigdy by nie zniknal z ekranu.
export const dynamic = 'force-dynamic';

type BossState = {
  at: string;
  bosses: { id: string; hp: number; maxHp: number; failing: string[] }[];
};

type Znalezisko = {
  id: string;
  powaga: 'blokada' | 'bariera' | 'zgrzyt' | 'szansa';
  tytul: string;
  coSieDzieje: string;
  gdzie: string;
  gracz: string;
};

type Obchod = { kiedy: string; adres: string; ziarno: number; znaleziska: Znalezisko[] };

function czytaj<T>(nazwa: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), '.quest', nazwa), 'utf8')) as T;
  } catch {
    // Brak pliku to nie blad - to znaczy, ze dana komenda jeszcze nie biegla.
    return null;
  }
}

function readState(): BossState | null {
  return czytaj<BossState>('boss-state.json');
}

function ostatniObchod(): Obchod | null {
  const historia = czytaj<{ obchody: Obchod[] }>('znaleziska.json');
  return historia?.obchody?.at(-1) ?? null;
}

const ETYKIETA_POWAGI: Record<Znalezisko['powaga'], string> = {
  blokada: 'Nie da się użyć',
  bariera: 'Część osób nie da rady',
  zgrzyt: 'Działa, ale kłuje',
  szansa: 'Da się lepiej',
};
const KOLEJNOSC_POWAGI: Znalezisko['powaga'][] = ['blokada', 'bariera', 'zgrzyt', 'szansa'];

function Label({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-8 border-t border-rule pt-3 text-[0.7rem] uppercase tracking-[0.28em] text-muted">
      {children}
    </h2>
  );
}

export default function MissionPage() {
  const state = readState();
  const obchod = ostatniObchod();
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

      <section className="pt-20">
        <Label>Co zauważyli gracze</Label>
        {obchod === null ? (
          <div className="max-w-[54ch] space-y-4 text-sm leading-relaxed text-muted">
            <p>
              Dwie postacie — jedna z telefonu, druga z komputera — chodzą po stronie i robią
              rzeczy, których nikt nie planował: stukają gdzie popadnie, szarpią tabulatorem,
              otwierają i zamykają powiększenie w ułamku sekundy, powiększają tekst dwukrotnie.
              Po każdym ruchu sprawdzają, czy coś się nie posypało.
            </p>
            <p>Jeszcze nie były na obchodzie. Wpisz w terminalu:</p>
            <p>
              <code className="border border-rule px-2 py-1 font-sans">npm run gracze</code>
            </p>
          </div>
        ) : obchod.znaleziska.length === 0 ? (
          <p className="max-w-[54ch] font-display text-[1.0625rem] leading-relaxed">
            Obie postacie przeszły stronę wzdłuż i wszerz i nie mają zastrzeżeń.
          </p>
        ) : (
          <div className="space-y-10">
            {KOLEJNOSC_POWAGI.filter((p) => obchod.znaleziska.some((z) => z.powaga === p)).map((powaga) => (
              <div key={powaga}>
                <p className="mb-5 text-[0.7rem] uppercase tracking-[0.28em] text-muted">
                  {ETYKIETA_POWAGI[powaga]}
                </p>
                <ul className="space-y-6">
                  {obchod.znaleziska
                    .filter((z) => z.powaga === powaga)
                    .map((z, i) => (
                      <li key={`${z.id}-${i}`}>
                        <h3 className="font-display text-[1.0625rem]">{z.tytul}</h3>
                        <p className="mt-2 max-w-[54ch] text-sm leading-relaxed text-muted">
                          {z.coSieDzieje}
                        </p>
                        <p className="mt-2 text-xs tracking-wide text-muted">
                          {z.gdzie} · zauważył {z.gracz}
                        </p>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
            <p className="text-xs tracking-wide text-muted">
              Obchód z {new Date(obchod.kiedy).toLocaleString('pl-PL')} · numer rozgrywki {obchod.ziarno}
            </p>
          </div>
        )}
      </section>

      <footer className="mt-24 border-t border-rule py-8 text-[0.7rem] uppercase tracking-[0.24em] text-muted">
        {state === null ? 'Stan nie policzony' : `Stan z ${new Date(state.at).toLocaleString('pl-PL')}`}
      </footer>
    </div>
  );
}
