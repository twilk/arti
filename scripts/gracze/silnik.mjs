// ══════════════════════════════════════════════════════════════════════
//  CO TO JEST: silnik graczy. Otwiera stronę, wykonuje ruchy i po każdym
//              sprawdza, czy coś się nie zepsuło.
//  CO MOŻESZ TU ZMIENIAĆ: liczbę ruchów w obchodzie (`ruchow`).
//  CZEGO LEPIEJ NIE RUSZAĆ: sposobu zbierania znalezisk.
//  JAK SPRAWDZIĆ, CZY DZIAŁA: npm run gracze
// ══════════════════════════════════════════════════════════════════════

import puppeteer from 'puppeteer-core';
import { znajdzPrzegladarke } from './przegladarka.mjs';
import { sprawdzStrone, sprawdzWidocznoscZaznaczenia } from './sprawdzenia.mjs';
import { losowanieZZiarnem, zagrania } from './zagrania.mjs';

/** Dwie postacie. Różnią się nie tylko rozmiarem okna, ale i sposobem grania. */
export const postacie = {
  telefon: {
    nazwa: 'Gracz z telefonu',
    okno: { width: 375, height: 812, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
    dotykowy: true,
    najmniejszyCelDotkniecia: 44,
    // Na telefonie ludzie głównie przewijają i stukają, rzadziej używają klawiatury.
    upodobania: { 'przewiń gdzieś': 3, 'kliknij losową pracę': 3, 'przewiń gwałtownie w górę i w dół': 2, 'przejdź tabulatorem': 0.3 },
  },
  komputer: {
    nazwa: 'Gracz z komputera',
    okno: { width: 1440, height: 900, isMobile: false, hasTouch: false, deviceScaleFactor: 1 },
    dotykowy: false,
    najmniejszyCelDotkniecia: 24,
    // Przy komputerze więcej klawiatury i szybkich, nerwowych ruchów myszą.
    upodobania: { 'przejdź tabulatorem': 3, 'naciskaj strzałki': 2, 'kliknij dwa razy szybko': 2, 'naciśnij Enter na tym, co zaznaczone': 2 },
  },
};

/** Losuje ruch, uwzględniając upodobania postaci. */
function wylosujZagranie(postac, los) {
  const pula = [];
  for (const ruch of zagrania) {
    const waga = postac.upodobania[ruch.nazwa] ?? 1;
    for (let i = 0; i < Math.max(1, Math.round(waga * 2)); i += 1) pula.push(ruch);
  }
  return pula[Math.floor(los() * pula.length)];
}

/**
 * Jeden obchód: otwiera stronę, wykonuje `ruchow` zagrań i zbiera zastrzeżenia.
 * To samo `ziarno` daje tę samą rozgrywkę, więc każde znalezisko da się powtórzyć.
 */
export async function obchod({ adres, postac, ziarno, ruchow = 24 }) {
  const los = losowanieZZiarnem(ziarno);
  const przegladarka = await puppeteer.launch({
    executablePath: znajdzPrzegladarke(),
    headless: 'new',
    args: ['--hide-scrollbars'],
  });

  const znaleziska = [];
  const dziennik = [];
  const juzWidziane = new Set();

  const zapisz = (z, krok) => {
    const klucz = `${z.id}|${z.gdzie}`;
    if (juzWidziane.has(klucz)) return;
    juzWidziane.add(klucz);
    znaleziska.push({ ...z, gracz: postac.nazwa, ziarno, krok, kiedy: new Date().toISOString() });
  };

  try {
    const strona = await przegladarka.newPage();
    await strona.setViewport(postac.okno);
    if (postac.dotykowy) {
      await strona.setUserAgent(
        'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Mobile Safari/537.36',
      );
    }

    strona.on('pageerror', (e) =>
      zapisz(
        {
          id: 'strona-sie-wysypala',
          powaga: 'blokada',
          tytul: 'Strona zgłosiła błąd',
          coSieDzieje: `Przeglądarka przerwała działanie kodu: ${e.message.slice(0, 160)}`,
          gdzie: 'kod strony',
        },
        dziennik.length,
      ),
    );
    strona.on('console', (m) => {
      if (m.type() !== 'error') return;
      zapisz(
        {
          id: 'blad-w-konsoli',
          powaga: 'zgrzyt',
          tytul: 'Błąd w dzienniku przeglądarki',
          coSieDzieje: m.text().slice(0, 160),
          gdzie: 'dziennik przeglądarki',
        },
        dziennik.length,
      );
    });
    strona.on('response', (r) => {
      if (r.status() < 400) return;
      zapisz(
        {
          id: 'plik-sie-nie-pobral',
          powaga: 'blokada',
          tytul: 'Czegoś nie udało się pobrać',
          coSieDzieje: `Serwer odpowiedział ${r.status()} na ${r.url().slice(0, 110)}`,
          gdzie: 'sieć',
        },
        dziennik.length,
      );
    });

    const odpowiedz = await strona.goto(adres, { waitUntil: 'networkidle0', timeout: 45000 });
    if (!odpowiedz || odpowiedz.status() >= 400) {
      throw new Error(`Strona ${adres} odpowiedziała ${odpowiedz?.status() ?? 'niczym'}.`);
    }

    // Rozgrzewka: przewiń całość, żeby wszystkie prace zdążyły się wczytać.
    await strona.evaluate(async () => {
      window.scrollTo(0, document.documentElement.scrollHeight);
      await new Promise((r) => setTimeout(r, 700));
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 300));
    });

    for (let krok = 1; krok <= ruchow; krok += 1) {
      const ruch = wylosujZagranie(postac, los);
      let opis = null;
      try {
        opis = await ruch.wykonaj(strona, los, postac);
      } catch (blad) {
        zapisz(
          {
            id: 'ruch-sie-nie-udal',
            powaga: 'zgrzyt',
            tytul: `Nie dało się wykonać ruchu „${ruch.nazwa}”`,
            coSieDzieje: String(blad.message).slice(0, 160),
            gdzie: ruch.nazwa,
          },
          krok,
        );
      }
      dziennik.push(opis ?? `${ruch.nazwa} (bez skutku)`);

      const zastrzezenia = await strona.evaluate(sprawdzStrone, {
        najmniejszyCelDotkniecia: postac.najmniejszyCelDotkniecia,
        dotykowy: postac.dotykowy,
      });
      for (const z of zastrzezenia) zapisz(z, krok);

      const zaznaczenie = await strona.evaluate(sprawdzWidocznoscZaznaczenia);
      if (zaznaczenie) zapisz(zaznaczenie, krok);

      if (ruch.posprzataj) await ruch.posprzataj(strona);
    }

    // Na koniec: czy da się w ogóle wyjść z powiększenia klawiaturą.
    await strona.evaluate(() => document.querySelectorAll('main figure button')[0]?.click());
    await new Promise((r) => setTimeout(r, 400));
    const bylOtwarty = await strona.evaluate(() => Boolean(document.querySelector('dialog[open]')));
    if (bylOtwarty) {
      await strona.keyboard.press('Escape');
      await new Promise((r) => setTimeout(r, 400));
      const dalejOtwarty = await strona.evaluate(() => Boolean(document.querySelector('dialog[open]')));
      if (dalejOtwarty) {
        zapisz(
          {
            id: 'nie-da-sie-wyjsc-klawiatura',
            powaga: 'blokada',
            tytul: 'Z powiększenia nie da się wyjść klawiszem Escape',
            coSieDzieje:
              'Ktoś, kto nie używa myszy, zostaje uwięziony w powiększonej pracy i musi zamknąć całą kartę.',
            gdzie: 'powiększenie pracy',
          },
          ruchow,
        );
      }
    }
  } finally {
    await przegladarka.close();
  }

  return { postac: postac.nazwa, adres, ziarno, ruchow, dziennik, znaleziska };
}
