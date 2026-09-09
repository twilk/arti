// ══════════════════════════════════════════════════════════════════════
//  CO TO JEST: piaskownica kat. Nic tu nie dotyka prawdziwej strony.
//  CO MOŻESZ TU ZMIENIAĆ: wszystko. Zmiany widać od razu, nic nie zapisuje
//                         się na stałe poza Twoją notatką.
//  CZEGO LEPIEJ NIE RUSZAĆ: importów - piaskownica celowo nie wie nic
//                           o komponentach prawdziwej strony.
//  JAK SPRAWDZIĆ, CZY DZIAŁA: npm run quest:dev, potem /dev/kata/hierarchia
// ══════════════════════════════════════════════════════════════════════
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Kata as KataDef } from '@/config/quest/katas';
import { rysunki } from './rysunki';

import type { Wartosci } from './rysunki/rodzaje';

function Zegar({ minut, skonczone }: { minut: number; skonczone: boolean }) {
  const [sekund, setSekund] = useState(minut * 60);
  const [stoi, setStoi] = useState(false);

  useEffect(() => {
    if (stoi || skonczone) return;
    const t = setInterval(() => setSekund((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [stoi, skonczone]);

  const minuty = Math.floor(Math.abs(sekund) / 60);
  const reszta = Math.abs(sekund) % 60;
  const poCzasie = sekund < 0;

  return (
    <div className="flex items-baseline gap-4">
      <span className={`text-sm tabular-nums ${poCzasie ? 'text-muted' : ''}`}>
        {poCzasie ? '+' : ''}
        {minuty}:{String(reszta).padStart(2, '0')}
      </span>
      <button
        type="button"
        onClick={() => setStoi((s) => !s)}
        className="min-h-11 text-xs uppercase tracking-[0.18em] text-muted underline decoration-rule underline-offset-4 hover:decoration-ink"
      >
        {stoi ? 'wznów' : 'pauza'}
      </button>
      {poCzasie && (
        // Czas jest presja pozytywna, nie kara. Po uplywie tylko odnotowuje.
        <span className="text-xs text-muted">czas minął, ale nic się nie stało — kończ, kiedy chcesz</span>
      )}
    </div>
  );
}

export default function Kata({ kata }: { kata: KataDef }) {
  const [wartosci, setWartosci] = useState<Wartosci>(kata.start);
  const [skonczone, setSkonczone] = useState(false);
  const [pokazWzorzec, setPokazWzorzec] = useState(false);
  const [zaznaczone, setZaznaczone] = useState<boolean[]>(() => kata.lista.map(() => false));
  const [notatka, setNotatka] = useState('');

  const kluczZapisu = `kata:${kata.id}`;

  useEffect(() => {
    try {
      const zapisane = window.localStorage.getItem(kluczZapisu);
      if (zapisane) setNotatka(JSON.parse(zapisane).notatka ?? '');
    } catch {
      // Brak zapisu albo zablokowane dane strony - nie ma czego wczytywac.
    }
  }, [kluczZapisu]);

  // Notatka laduje w przegladarce (przezyje odswiezenie) i na dysku (ekran misji
  // liczy z tego, czy w tym tygodniu byla juz kata). Blad zapisu na dysk nie moze
  // zabrac jej notatki, wiec jest cichy.
  const naDysk = useCallback(
    (dane: Record<string, unknown>) => {
      void fetch('/dev/api/postep', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: kata.id, ...dane }),
      }).catch(() => {});
    },
    [kata.id],
  );

  const zapisz = useCallback(
    (tresc: string) => {
      setNotatka(tresc);
      try {
        window.localStorage.setItem(kluczZapisu, JSON.stringify({ notatka: tresc, kiedy: Date.now() }));
      } catch {
        // Zapis moze byc zablokowany. Notatka zostaje na ekranie, tylko nie przetrwa odswiezenia.
      }
      naDysk({ notatka: tresc });
    },
    [kluczZapisu, naDysk],
  );

  const Rysunek = rysunki[kata.id];

  const pokazywane = useMemo(
    () => (pokazWzorzec ? kata.wzorzec : wartosci),
    [pokazWzorzec, kata.wzorzec, wartosci],
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-t border-rule pt-3">
        <p className="text-[0.7rem] uppercase tracking-[0.28em] text-muted">
          {kata.umiejetnosc} · {kata.trudnosc}
        </p>
        <Zegar minut={kata.minut} skonczone={skonczone} />
      </div>

      <p className="max-w-[54ch] font-display text-xl leading-snug">{kata.brief}</p>

      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]">
        <div>
          {skonczone && (
            <div className="mb-4 flex gap-6 text-xs uppercase tracking-[0.18em]">
              <button
                type="button"
                onClick={() => setPokazWzorzec(false)}
                className={`min-h-11 ${pokazWzorzec ? 'text-muted' : 'text-ink underline decoration-ink underline-offset-4'}`}
              >
                Twoja
              </button>
              <button
                type="button"
                onClick={() => setPokazWzorzec(true)}
                className={`min-h-11 ${pokazWzorzec ? 'text-ink underline decoration-ink underline-offset-4' : 'text-muted'}`}
              >
                Wzorcowa
              </button>
            </div>
          )}
          <Rysunek w={pokazywane} />
        </div>

        <div className="space-y-6">
          {kata.pokretla.map((p) => (
            <div key={p.klucz}>
              <label
                htmlFor={`pokretlo-${p.klucz}`}
                className="mb-2 block text-xs uppercase tracking-[0.18em] text-muted"
              >
                {p.etykieta}
                {p.rodzaj === 'liczba' && (
                  <span className="ml-2 tabular-nums normal-case tracking-normal">
                    {wartosci[p.klucz]}
                    {p.jednostka}
                  </span>
                )}
              </label>
              {p.rodzaj === 'liczba' ? (
                <input
                  id={`pokretlo-${p.klucz}`}
                  type="range"
                  min={p.min}
                  max={p.max}
                  value={Number(wartosci[p.klucz])}
                  onChange={(e) =>
                    setWartosci((w) => ({ ...w, [p.klucz]: Number(e.target.value) }))
                  }
                  className="w-full"
                />
              ) : (
                <select
                  id={`pokretlo-${p.klucz}`}
                  value={String(wartosci[p.klucz])}
                  onChange={(e) => setWartosci((w) => ({ ...w, [p.klucz]: e.target.value }))}
                  className="min-h-11 w-full border border-rule bg-paper px-3 text-sm"
                >
                  {p.mozliwosci?.map((m) => (
                    <option key={m.wartosc} value={m.wartosc}>
                      {m.etykieta}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}

          {!skonczone && (
            <button
              type="button"
              onClick={() => {
                setSkonczone(true);
                setPokazWzorzec(true);
                naDysk({ skonczona: true });
              }}
              className="min-h-11 w-full border border-ink px-4 text-xs uppercase tracking-[0.18em]"
            >
              Skończone
            </button>
          )}
        </div>
      </div>

      {skonczone && (
        <div className="space-y-10 border-t border-rule pt-10">
          <div>
            <h2 className="mb-5 text-[0.7rem] uppercase tracking-[0.28em] text-muted">
              Dlaczego wzorcowa wygląda tak
            </h2>
            <div className="max-w-[54ch] space-y-4 font-display text-[1.0625rem] leading-relaxed">
              {kata.komentarz.map((akapit) => (
                <p key={akapit.slice(0, 24)}>{akapit}</p>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-5 text-[0.7rem] uppercase tracking-[0.28em] text-muted">
              Sprawdź sama
            </h2>
            <ul className="max-w-[54ch] space-y-3">
              {kata.lista.map((pytanie, i) => (
                <li key={pytanie}>
                  <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
                    <input
                      type="checkbox"
                      checked={zaznaczone[i]}
                      onChange={() =>
                        setZaznaczone((z) => z.map((v, j) => (j === i ? !v : v)))
                      }
                      className="mt-1"
                    />
                    <span>{pytanie}</span>
                  </label>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted">
              Nikt tego nie liczy i nie ma tu wyniku. To lista do przejścia wzrokiem, nie ocena.
            </p>
          </div>

          <div>
            <label
              htmlFor="notatka"
              className="mb-5 block text-[0.7rem] uppercase tracking-[0.28em] text-muted"
            >
              Co zapamiętasz z tej katy
            </label>
            <textarea
              id="notatka"
              value={notatka}
              onChange={(e) => zapisz(e.target.value)}
              rows={3}
              className="w-full max-w-[54ch] border border-rule bg-paper p-3 font-display text-[1.0625rem] leading-relaxed"
              placeholder="Jedno zdanie własnymi słowami."
            />
            <p className="mt-2 text-xs text-muted">
              Zapisuje się samo. Po trzydziestu katach będziesz mieć własny zbiór zasad — i to jest
              prawdziwy produkt tego ćwiczenia, nie ta karta obok.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
