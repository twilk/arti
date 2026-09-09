import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import { bosses } from '@/config/quest/bosses';
import { katy } from '@/config/quest/katas';
import { zadanieNaDzis } from '@/lib/quest/zadanie-na-dzis.mjs';

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

type Postep = {
  katy: Record<string, { skonczona: boolean; tydzien: string; kiedy?: string; notatka: string }>;
};

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
  const postep = czytaj<Postep>('progress.json');
  const zadanie = zadanieNaDzis({ bossowie: bosses, stanBossow: entries, katy, postep });
  const dzisiejszy = zadanie.rodzaj === 'boss' ? zadanie.boss : null;
  const pozostali = alive.filter((entry) => entry.id !== dzisiejszy?.id);
  const zrobioneKaty = new Set(
    Object.entries(postep?.katy ?? {})
      .filter(([, k]) => k.skonczona)
      .map(([id]) => id),
  );
  // Chronologicznie, bo to ma sie czytac jak dziennik. Notatki puste pomijamy -
  // skonczona kata bez zdania nie jest zasada.
  const zasady = Object.entries(postep?.katy ?? {})
    .filter(([, k]) => k.notatka?.trim())
    .map(([id, k]) => ({
      id,
      notatka: k.notatka.trim(),
      tytul: katy.find((kata) => kata.id === id)?.umiejetnosc ?? id,
      kiedy: k.kiedy ?? '',
      data: k.kiedy ? new Date(k.kiedy).toLocaleDateString('pl-PL') : '',
    }))
    .sort((a, b) => a.kiedy.localeCompare(b.kiedy));

  // Raport graczy zajmowal trzecia czesc ekranu misji. Tutaj ma byc sygnal, nie
  // caly raport - pelny jest w terminalie po `npm run gracze`.
  const NA_EKRANIE = 3;
  const znaleziska = (obchod?.znaleziska ?? [])
    .slice()
    .sort((a, b) => KOLEJNOSC_POWAGI.indexOf(a.powaga) - KOLEJNOSC_POWAGI.indexOf(b.powaga));
  const pokazane = znaleziska.slice(0, NA_EKRANIE);
  const ukryte = znaleziska.length - pokazane.length;

  const defeated = entries.filter((entry) => entry.maxHp > 0 && entry.hp === 0);

  return (
    <div className="mx-auto w-full max-w-[860px] px-6 py-20 sm:px-10">
      <header className="pb-16">
        <p className="text-[0.7rem] uppercase tracking-[0.28em] text-muted">
          Baza misji ·{' '}
          <a
            href="/dev/quest"
            className="inline-block py-1 underline decoration-rule underline-offset-[6px] transition-colors hover:decoration-ink"
          >
            kopia do ćwiczeń
          </a>
        </p>
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
        ) : zadanie.rodzaj === 'kata' ? (
          <div>
            {/* Brief jest calym zdaniem, wiec sklejenie go z „Zrob kate” dawalo dwa
                zdania bez znaku miedzy nimi. Zadanie stoi teraz samo. */}
            <p className="max-w-[54ch] font-display text-[1.0625rem] leading-relaxed">
              {zadanie.kata.brief}
            </p>
            <p className="mt-2 text-xs tracking-wide text-muted">
              Dzisiejsza kata · {zadanie.kata.umiejetnosc} · {zadanie.powod}
            </p>
            <p className="mt-6">
              <a
                href={`/dev/kata/${zadanie.kata.id}`}
                className="inline-block min-h-11 border border-ink px-5 py-3 text-xs uppercase tracking-[0.18em] transition-colors hover:bg-ink hover:text-paper"
              >
                Otwórz katę · {zadanie.kata.minut} minut
              </a>
            </p>
            <p className="mt-4 max-w-[54ch] text-sm leading-relaxed text-muted">
              Nie trzeba niczego otwierać w plikach — wszystko przestawia się suwakami.
            </p>
          </div>
        ) : dzisiejszy ? (
          <div>
            <p className="max-w-[54ch] font-display text-[1.0625rem] leading-relaxed">
              Pokonaj bossa <strong className="font-normal">{dzisiejszy.name}</strong>. Otwórz{' '}
              <code className="font-sans text-sm">{dzisiejszy.where}</code> i zamień komentarz
              między linią (A) a (B).
            </p>
            <p className="mt-2 text-xs tracking-wide text-muted">{zadanie.powod}</p>

            {/* Cala lekcja przy bossie, ktorego sie dzis bije. Przy pozostalych
                bylaby scianą tekstu do przewijania - ekran misji ma odpowiadac
                na pytanie „co dziś”, nie streszczac calej gry naraz. */}
            <div className="mt-10 border-t border-rule pt-8">
              <p className="max-w-[54ch] font-display text-[1.0625rem] leading-relaxed">
                {dzisiejszy.meaning}
              </p>
              <p className="mt-4 max-w-[54ch] text-sm leading-relaxed text-muted">
                <span className="uppercase tracking-[0.18em]">Wskazówka</span> — {dzisiejszy.hint}
              </p>
              <p className="mt-2 max-w-[54ch] text-sm leading-relaxed text-muted">
                <span className="uppercase tracking-[0.18em]">Czyj to problem</span> —{' '}
                {dzisiejszy.whose}
              </p>
            </div>
          </div>
        ) : (
          <p className="max-w-[54ch] font-display text-[1.0625rem] leading-relaxed">
            Wszyscy bossowie, których dotąd postawiliśmy, są pokonani. Następni czekają na kolejną fazę.
          </p>
        )}
      </section>

      <section className="pt-20">
        <Label>{pozostali.length > 0 ? 'Czeka w kolejce' : 'Bossowie'}</Label>
        {alive.length === 0 ? (
          <p className="max-w-[54ch] text-sm text-muted">
            {state === null ? 'Nie policzone.' : 'Żaden nie żyje.'}
          </p>
        ) : pozostali.length === 0 ? (
          <p className="max-w-[54ch] text-sm text-muted">Nikt więcej. Ten jeden i koniec.</p>
        ) : (
          <ul className="max-w-[54ch] divide-y divide-rule border-t border-rule">
            {pozostali.map((entry) => {
              const boss = byId.get(entry.id);
              if (!boss) return null;
              return (
                <li key={entry.id} className="flex flex-wrap items-baseline justify-between gap-x-6 py-3">
                  <span className="font-display text-[1.0625rem]">{boss.name}</span>
                  <span className="text-xs tabular-nums tracking-wide text-muted">
                    {boss.difficulty} · {entry.hp}/{entry.maxHp} życia
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="pt-20">
        <Label>Talia kat</Label>
        <ul className="max-w-[54ch] divide-y divide-rule border-t border-rule">
          {katy.map((kata) => (
            <li key={kata.id} className="flex flex-wrap items-baseline justify-between gap-x-6 py-3">
              <a
                href={`/dev/kata/${kata.id}`}
                className="inline-block min-h-11 py-1 font-display text-[1.0625rem] underline decoration-rule decoration-1 underline-offset-[6px] transition-colors hover:decoration-ink"
              >
                {kata.brief}
              </a>
              <span className="text-xs tracking-wide text-muted">
                {zrobioneKaty.has(kata.id) ? 'zrobiona' : `${kata.umiejetnosc} · ${kata.minut} min`}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 max-w-[54ch] text-xs text-muted">
          Talia ma docelowo trzydzieści pozycji. Na razie jest pierwsza.
        </p>
      </section>

      {/* Cmentarzysko pojawia sie dopiero, gdy jest na nim ktos. Sekcja mowiaca
          "jeszcze pusto" zajmowala 182 piksele, zeby nie powiedziec niczego. */}
      {defeated.length > 0 && (
        <section className="pt-20">
          <Label>Cmentarzysko</Label>
          <ul className="space-y-2">
            {defeated.map((entry) => (
              <li key={entry.id} className="font-display text-[1.0625rem]">
                {byId.get(entry.id)?.name}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="pt-20">
        <Label>Zeszyt zasad</Label>
        {zasady.length === 0 ? (
          <p className="max-w-[54ch] text-sm leading-relaxed text-muted">
            Pusto — i tak ma być, dopóki nie skończysz pierwszej katy. Każda kata kończy się
            polem „co zapamiętasz”. To, co tam wpiszesz, trafia tutaj i zostaje. Po trzydziestu
            katach to będzie Twój własny zbiór zasad, napisany Twoimi słowami — i to jest
            prawdziwy produkt tej gry, nie pokonani bossowie.
          </p>
        ) : (
          <ol className="max-w-[54ch] space-y-8">
            {zasady.map((z) => (
              <li key={z.id}>
                {/* Notatka jest tu najwazniejsza, wiec jest najwieksza. Skad pochodzi
                    i kiedy powstala - ciche, pod spodem. */}
                <p className="font-display text-lg leading-relaxed">{z.notatka}</p>
                <p className="mt-2 text-xs tracking-wide text-muted">
                  {z.tytul}
                  {z.data ? ` · ${z.data}` : ''}
                </p>
              </li>
            ))}
          </ol>
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
        ) : znaleziska.length === 0 ? (
          <p className="max-w-[54ch] font-display text-[1.0625rem] leading-relaxed">
            Obie postacie przeszły stronę wzdłuż i wszerz i nie mają zastrzeżeń.
          </p>
        ) : (
          <div className="max-w-[54ch] space-y-6">
            <ul className="divide-y divide-rule border-t border-rule">
              {pokazane.map((z, i) => (
                <li key={`${z.id}-${i}`} className="py-4">
                  <p className="text-[0.7rem] uppercase tracking-[0.28em] text-muted">
                    {ETYKIETA_POWAGI[z.powaga]}
                  </p>
                  <p className="mt-2 font-display text-[1.0625rem]">{z.tytul}</p>
                  <p className="mt-1 text-xs tracking-wide text-muted">{z.gdzie}</p>
                </li>
              ))}
            </ul>
            <p className="text-sm leading-relaxed text-muted">
              {ukryte > 0
                ? `Jeszcze ${ukryte} ${ukryte === 1 ? 'zastrzeżenie' : 'zastrzeżenia'} — całość razem z opisami wypisuje `
                : 'Całość razem z opisami wypisuje '}
              <code className="font-sans">npm run gracze</code>.
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
