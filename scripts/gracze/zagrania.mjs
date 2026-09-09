// ══════════════════════════════════════════════════════════════════════
//  CO TO JEST: repertuar ruchów, które gracze wykonują na stronie.
//  CO MOŻESZ TU ZMIENIAĆ: dopisz własny ruch do listy `zagrania`.
//  CZEGO LEPIEJ NIE RUSZAĆ: kształtu obiektu ruchu (nazwa + wykonaj).
//  JAK SPRAWDZIĆ, CZY DZIAŁA: npm run gracze
// ══════════════════════════════════════════════════════════════════════

const czekaj = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Repertuar. Każdy ruch dostaje kartę przeglądarki, losowanie i opis postaci,
 * a oddaje krótkie zdanie o tym, co zrobił - żeby dało się to potem powtórzyć.
 */
export const zagrania = [
  {
    nazwa: 'przewiń gdzieś',
    async wykonaj(strona, los) {
      const dokad = await strona.evaluate((u) => {
        const cel = Math.floor(u * document.documentElement.scrollHeight);
        window.scrollTo({ top: cel, behavior: 'instant' });
        return cel;
      }, los());
      await czekaj(250);
      return `przewinęłam stronę na ${dokad} pikseli`;
    },
  },
  {
    nazwa: 'przewiń gwałtownie w górę i w dół',
    async wykonaj(strona) {
      await strona.evaluate(async () => {
        for (let i = 0; i < 6; i += 1) {
          window.scrollTo(0, i % 2 ? 0 : document.documentElement.scrollHeight);
          await new Promise((r) => setTimeout(r, 60));
        }
      });
      return 'poszarpałam stronę w górę i w dół';
    },
  },
  {
    nazwa: 'kliknij losową pracę',
    async wykonaj(strona, los) {
      const ile = await strona.evaluate(() => document.querySelectorAll('main figure button').length);
      if (ile === 0) return null;
      const nr = Math.floor(los() * ile);
      await strona.evaluate((i) => document.querySelectorAll('main figure button')[i]?.click(), nr);
      await czekaj(400);
      return `kliknęłam pracę numer ${nr + 1}`;
    },
  },
  {
    nazwa: 'kliknij cokolwiek klikalnego',
    async wykonaj(strona, los) {
      const wynik = await strona.evaluate((u) => {
        const kandydaci = [...document.querySelectorAll('button, a[href]')].filter((el) => {
          const p = el.getBoundingClientRect();
          return p.width > 0 && p.height > 0;
        });
        if (kandydaci.length === 0) return null;
        const el = kandydaci[Math.floor(u * kandydaci.length)];
        const nazwa = el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 30) || el.tagName;
        // Odnosniki wychodzace na zewnatrz pomijamy - nie chcemy opuscic strony.
        if (el.tagName === 'A' && el.getAttribute('href')?.startsWith('http')) return `pominęłam odnośnik na zewnątrz: ${nazwa}`;
        el.click();
        return `kliknęłam „${nazwa}”`;
      }, los());
      await czekaj(350);
      return wynik;
    },
  },
  {
    nazwa: 'naciskaj strzałki',
    async wykonaj(strona, los) {
      const ile = 1 + Math.floor(los() * 6);
      for (let i = 0; i < ile; i += 1) {
        await strona.keyboard.press(los() > 0.5 ? 'ArrowRight' : 'ArrowLeft');
        await czekaj(90);
      }
      return `nacisnęłam strzałki ${ile} razy`;
    },
  },
  {
    nazwa: 'naciśnij Escape',
    async wykonaj(strona) {
      await strona.keyboard.press('Escape');
      await czekaj(300);
      return 'nacisnęłam Escape';
    },
  },
  {
    nazwa: 'przejdź tabulatorem',
    async wykonaj(strona, los) {
      const ile = 2 + Math.floor(los() * 8);
      for (let i = 0; i < ile; i += 1) {
        await strona.keyboard.press('Tab');
        await czekaj(70);
      }
      return `przeszłam tabulatorem ${ile} razy`;
    },
  },
  {
    nazwa: 'wróć tabulatorem',
    async wykonaj(strona, los) {
      const ile = 1 + Math.floor(los() * 5);
      for (let i = 0; i < ile; i += 1) {
        await strona.keyboard.down('Shift');
        await strona.keyboard.press('Tab');
        await strona.keyboard.up('Shift');
        await czekaj(70);
      }
      return `cofnęłam się tabulatorem ${ile} razy`;
    },
  },
  {
    nazwa: 'naciśnij Enter na tym, co zaznaczone',
    async wykonaj(strona) {
      const co = await strona.evaluate(() => {
        const el = document.activeElement;
        return el ? el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 30) || el.tagName : 'nic';
      });
      await strona.keyboard.press('Enter');
      await czekaj(400);
      return `nacisnęłam Enter na „${co}”`;
    },
  },
  {
    nazwa: 'naciśnij przypadkowy klawisz',
    async wykonaj(strona, los) {
      const klawisze = ['Home', 'End', 'PageDown', 'PageUp', 'Space', 'Backspace', 'Delete', 'F5x', 'ArrowUp', 'ArrowDown'];
      const k = klawisze[Math.floor(los() * klawisze.length)];
      if (k === 'F5x') return 'powstrzymałam się przed odświeżeniem';
      await strona.keyboard.press(k);
      await czekaj(200);
      return `nacisnęłam ${k}`;
    },
  },
  {
    nazwa: 'kliknij dwa razy szybko',
    async wykonaj(strona, los) {
      const x = Math.floor(los() * 300) + 40;
      const y = Math.floor(los() * 300) + 120;
      await strona.mouse.click(x, y, { clickCount: 2 });
      await czekaj(300);
      return `kliknęłam dwukrotnie w punkt ${x}, ${y}`;
    },
  },
  {
    nazwa: 'otwórz i zamknij błyskawicznie',
    async wykonaj(strona) {
      await strona.evaluate(() => document.querySelectorAll('main figure button')[0]?.click());
      await czekaj(60);
      await strona.keyboard.press('Escape');
      await czekaj(60);
      await strona.evaluate(() => document.querySelectorAll('main figure button')[1]?.click());
      await czekaj(60);
      await strona.keyboard.press('Escape');
      await czekaj(350);
      return 'otworzyłam i zamknęłam powiększenie dwa razy pod rząd, bardzo szybko';
    },
  },
  {
    nazwa: 'zmień rozmiar okna w trakcie',
    async wykonaj(strona, los, postac) {
      const szerokosc = postac.dotykowy ? 320 + Math.floor(los() * 140) : 900 + Math.floor(los() * 1000);
      await strona.setViewport({ width: szerokosc, height: postac.okno.height });
      await czekaj(400);
      await strona.setViewport(postac.okno);
      await czekaj(300);
      return `zmieniłam szerokość okna na ${szerokosc} i z powrotem`;
    },
  },
  {
    nazwa: 'powiększ tekst tak, jak robią to osoby słabo widzące',
    async wykonaj(strona) {
      await strona.evaluate(() => {
        document.documentElement.style.fontSize = '200%';
      });
      await czekaj(400);
      const wynik = 'powiększyłam tekst dwukrotnie';
      return wynik;
    },
    async posprzataj(strona) {
      await strona.evaluate(() => {
        document.documentElement.style.fontSize = '';
      });
      await czekaj(200);
    },
  },
];

/** Losowanie z ziarnem - to samo ziarno daje tę samą rozgrywkę. */
export function losowanieZZiarnem(ziarno) {
  let stan = ziarno >>> 0;
  return function los() {
    stan += 0x6d2b79f5;
    let t = stan;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
