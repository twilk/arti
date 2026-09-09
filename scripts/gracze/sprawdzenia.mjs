// ══════════════════════════════════════════════════════════════════════
//  CO TO JEST: lista rzeczy, które gracze sprawdzają po każdym ruchu.
//  CO MOŻESZ TU ZMIENIAĆ: progi (np. 44 piksele na cel dotknięcia)
//                         i teksty opisujące, co jest nie tak.
//  CZEGO LEPIEJ NIE RUSZAĆ: kształtu zwracanych danych - czyta go silnik.
//  JAK SPRAWDZIĆ, CZY DZIAŁA: npm run gracze
// ══════════════════════════════════════════════════════════════════════

/**
 * Ta funkcja jedzie w całości do przeglądarki i tam się wykonuje, więc nie może
 * korzystać z niczego spoza siebie. Zwraca listę zastrzeżeń.
 */
export function sprawdzStrone({ najmniejszyCelDotkniecia, dotykowy }) {
  const zastrzezenia = [];
  const dodaj = (id, powaga, tytul, coSieDzieje, gdzie) =>
    zastrzezenia.push({ id, powaga, tytul, coSieDzieje, gdzie });

  // Nazwy znacznikow HTML nic nie mowia komus, kto HTML-a nie zna.
  // Mowimy po ludzku, czym ta rzecz jest na ekranie.
  const POLSKIE_NAZWY = {
    a: 'odnośnik',
    button: 'przycisk',
    img: 'obraz',
    figcaption: 'podpis pod obrazem',
    figure: 'kadr z pracą',
    span: 'kawałek tekstu',
    p: 'akapit',
    li: 'punkt listy',
    h1: 'główny nagłówek',
    h2: 'nagłówek poziomu 2',
    h3: 'nagłówek poziomu 3',
    h4: 'nagłówek poziomu 4',
    h5: 'nagłówek poziomu 5',
    h6: 'nagłówek poziomu 6',
    dialog: 'okno powiększenia',
    code: 'fragment kodu',
    div: 'blok',
    section: 'sekcja',
  };

  const opis = (el) => {
    if (!el) return 'nieznany element';
    const znacznik = el.tagName.toLowerCase();
    const jak = POLSKIE_NAZWY[znacznik] ?? znacznik;
    const nazwa = el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 40) || '';
    return `${jak}${nazwa ? ` „${nazwa}”` : ''}`;
  };

  const doLiczb = (kolor) => {
    if (!kolor) return null;
    // Nowoczesny zapis: color-mix() rozwiazuje sie w przegladarce do "color(srgb ...)",
    // gdzie skladowe sa ulamkami od 0 do 1. Bez tego czytalismy tylko polowe kolorow.
    const nowy = /color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)/.exec(kolor);
    if (nowy) {
      return {
        r: parseFloat(nowy[1]) * 255,
        g: parseFloat(nowy[2]) * 255,
        b: parseFloat(nowy[3]) * 255,
        a: nowy[4] === undefined ? 1 : parseFloat(nowy[4]),
      };
    }
    const m = /rgba?\(([^)]+)\)/.exec(kolor);
    if (!m) return null;
    const [r, g, b, a = '1'] = m[1].split(',').map((x) => parseFloat(x));
    return { r, g, b, a: Number(a) };
  };
  const jasnosc = ({ r, g, b }) => {
    const k = [r, g, b].map((c) => {
      const v = c / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * k[0] + 0.7152 * k[1] + 0.0722 * k[2];
  };
  const kontrast = (a, b) => {
    const ja = jasnosc(a);
    const jb = jasnosc(b);
    return (Math.max(ja, jb) + 0.05) / (Math.min(ja, jb) + 0.05);
  };
  const tloZa = (el) => {
    // Wewnatrz otwartego powiekszenia tlo maluje ::backdrop, ktorego nie ma w drzewie
    // elementow. Bez tego porownywalibysmy jasny tekst z papierem strony i wychodzilo
    // 1.00 do 1 - falszywy alarm przy kazdym podpisie w powiekszeniu.
    const dialog = el.closest('dialog[open]');
    if (dialog) {
      const zBackdropu = doLiczb(getComputedStyle(dialog, '::backdrop').backgroundColor);
      if (zBackdropu && zBackdropu.a > 0.5) return zBackdropu;
    }
    let w = el;
    while (w && w !== document.documentElement) {
      const kolor = doLiczb(getComputedStyle(w).backgroundColor);
      if (kolor && kolor.a > 0.9) return kolor;
      w = w.parentElement;
    }
    return doLiczb(getComputedStyle(document.body).backgroundColor) ?? { r: 255, g: 255, b: 255, a: 1 };
  };

  const korzen = document.documentElement;
  const otwartyDialog = document.querySelector('dialog[open]');

  // 1. Strona przesuwa się na boki.
  if (korzen.scrollWidth > korzen.clientWidth + 1) {
    dodaj(
      'strona-jedzie-w-bok',
      'zgrzyt',
      'Strona daje się przesuwać na boki',
      `Szerokość treści to ${korzen.scrollWidth} przy oknie ${korzen.clientWidth}. ` +
        'Ktoś przewijający kciukiem zsunie obraz w bok i zobaczy pusty pas.',
      'cała strona',
    );
  }

  // 2. Obrazy, które się nie wczytały albo zmieniły proporcje.
  for (const img of document.querySelectorAll('img')) {
    if (!img.complete || img.naturalWidth === 0) {
      dodaj('obraz-sie-nie-wczytal', 'blokada', 'Obraz się nie pokazał', `Puste miejsce zamiast pracy.`, opis(img) + ` [${img.alt}]`);
      continue;
    }
    if (img.clientWidth > 0 && img.clientHeight > 0) {
      const naEkranie = img.clientWidth / img.clientHeight;
      const wlasne = img.naturalWidth / img.naturalHeight;
      if (Math.abs(naEkranie - wlasne) > 0.02) {
        dodaj(
          'obraz-rozciagniety',
          'blokada',
          'Obraz jest ściśnięty albo rozciągnięty',
          `Praca ma proporcje ${wlasne.toFixed(3)}, a na ekranie wychodzi ${naEkranie.toFixed(3)}. ` +
            'Obraz malarski w złych proporcjach to inny obraz.',
          opis(img) + ` [${img.alt}]`,
        );
      }
    }
    if (!img.hasAttribute('alt')) {
      dodaj('obraz-bez-opisu', 'bariera', 'Obraz bez opisu słownego', 'Osoba korzystająca z czytnika ekranu nie dowie się, co tu wisi.', opis(img));
    }
  }

  // 3. Cos wystaje poza okno. Element w kontenerze z wlasnym przewijaniem ma prawo
  // wystawac - na tym polega ten wzorzec, a strona przez niego w bok nie jedzie.
  // Bez tego wyjatku narzedzie kazaloby "naprawiac" poprawne rozwiazanie.
  const wWlasnymPrzewijaniu = (el) => {
    let w = el.parentElement;
    while (w && w !== document.body) {
      const przewijanie = getComputedStyle(w).overflowX;
      if (przewijanie === 'auto' || przewijanie === 'scroll') return true;
      w = w.parentElement;
    }
    return false;
  };

  for (const el of document.querySelectorAll('body *')) {
    const p = el.getBoundingClientRect();
    if (p.width > 0 && p.right > korzen.clientWidth + 1 && !wWlasnymPrzewijaniu(el)) {
      dodaj('element-wystaje', 'zgrzyt', 'Element wychodzi poza ekran', `Prawa krawędź na ${Math.round(p.right)} przy oknie ${korzen.clientWidth}.`, opis(el));
      break;
    }
  }

  // 4. Przewijanie zablokowane, choć nic nie jest otwarte.
  if (!otwartyDialog && getComputedStyle(korzen).overflow === 'hidden') {
    dodaj(
      'strona-nie-chce-sie-przewijac',
      'blokada',
      'Strona przestała się przewijać',
      'Powiększenie pracy zostało zamknięte, ale strona pod spodem dalej stoi w miejscu.',
      'cała strona',
    );
  }

  // 5. Przyciski i odnośniki bez nazwy.
  for (const el of document.querySelectorAll('button, a[href]')) {
    const nazwa = (el.getAttribute('aria-label') || el.textContent || '').trim();
    if (!nazwa) {
      dodaj('przycisk-bez-nazwy', 'bariera', 'Przycisk bez nazwy', 'Czytnik ekranu przeczyta „przycisk” i nic więcej.', opis(el));
    }
  }

  // 6. Cele do dotknięcia palcem.
  if (dotykowy) {
    // Dwa progi, bo to dwie rozne rzeczy. 24 piksele to wymog normy WCAG 2.5.8 -
    // ponizej tego jest po prostu za malo. 44 piksele to szerokosc opuszki kciuka,
    // czyli granica miedzy "da sie trafic" a "trafia sie za pierwszym razem".
    const WYMOG = 24;
    for (const el of document.querySelectorAll('button, a[href]')) {
      const p = el.getBoundingClientRect();
      if (p.width === 0) continue;
      const krotszy = Math.min(p.width, p.height);
      const wymiary = `${Math.round(p.width)} na ${Math.round(p.height)} pikseli`;
      if (krotszy < WYMOG) {
        dodaj(
          'cel-ponizej-normy',
          'zgrzyt',
          'Cel do dotknięcia poniżej normy',
          `${wymiary}. Norma WCAG mówi o co najmniej ${WYMOG} pikselach w każdą stronę. Tego się nie trafia kciukiem.`,
          opis(el),
        );
      } else if (krotszy < najmniejszyCelDotkniecia) {
        dodaj(
          'cel-mniejszy-niz-kciuk',
          'szansa',
          'Cel mniejszy niż opuszka kciuka',
          `${wymiary}. Normę spełnia, ale ${najmniejszyCelDotkniecia} pikseli to szerokość kciuka. Poniżej trafia się za drugim razem.`,
          opis(el),
        );
      }
    }
  }

  // 7. Kolejnosc naglowkow. To jest spis tresci dla kogos, kto strony nie widzi:
  // czytnik ekranu pozwala skakac po naglowkach jak po rozdzialach. Zejscie o wiecej
  // niz jeden poziom brzmi tam jak podpunkt bez punktu. Powrot w gore jest w porzadku -
  // to normalne przejscie do nastepnej sekcji.
  const naglowki = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].map((el) => ({
    poziom: Number(el.tagName.slice(1)),
    tekst: el.textContent?.trim().slice(0, 40) ?? '',
    el,
  }));

  const pierwszePoziomu = naglowki.filter((n) => n.poziom === 1);
  if (naglowki.length > 0 && pierwszePoziomu.length === 0) {
    dodaj(
      'brak-glownego-naglowka',
      'bariera',
      'Strona nie ma głównego nagłówka',
      'Czytnik ekranu zaczyna od pytania „o czym jest ta strona”. Bez nagłówka pierwszego poziomu nie ma odpowiedzi.',
      'cała strona',
    );
  }
  if (pierwszePoziomu.length > 1) {
    dodaj(
      'kilka-glownych-naglowkow',
      'zgrzyt',
      'Strona ma kilka głównych nagłówków',
      `Znalazłam ich ${pierwszePoziomu.length}. Główny nagłówek jest jeden, tak jak tytuł książki.`,
      pierwszePoziomu.map((n) => `„${n.tekst}”`).join(', '),
    );
  }

  for (let i = 1; i < naglowki.length; i += 1) {
    const skok = naglowki[i].poziom - naglowki[i - 1].poziom;
    if (skok > 1) {
      dodaj(
        'przeskok-naglowka',
        'bariera',
        'Nagłówki przeskakują poziom',
        `Po nagłówku poziomu ${naglowki[i - 1].poziom} („${naglowki[i - 1].tekst}”) od razu idzie poziom ` +
          `${naglowki[i].poziom} („${naglowki[i].tekst}”). Dla kogoś, kto słucha strony, to jak podpunkt bez punktu — ` +
          'nie wie, czy coś przegapił.',
        opis(naglowki[i].el),
      );
      break;
    }
  }

  // 8. Miara wiersza. Oko wraca na poczatek nastepnej linii ruchem, ktorego sie nie
  // zauwaza - dopoki linia nie jest za dluga. Wtedy wraca w zle miejsce.
  const plotno = document.createElement('canvas').getContext('2d');
  for (const el of document.querySelectorAll('p, li, blockquote')) {
    const tekst = el.textContent?.trim() ?? '';
    // Krotkie akapity nie zawijaja sie na tyle, zeby miara miala znaczenie.
    if (tekst.length < 120) continue;
    const styl = getComputedStyle(el);
    plotno.font = `${styl.fontStyle} ${styl.fontWeight} ${styl.fontSize} ${styl.fontFamily}`;
    const szerokoscZnaku = plotno.measureText('0').width;
    if (!szerokoscZnaku) continue;
    const znakow = Math.round(el.getBoundingClientRect().width / szerokoscZnaku);
    if (znakow > 85) {
      dodaj(
        'wiersz-za-dlugi',
        'zgrzyt',
        'Wiersz tekstu jest za długi',
        `Około ${znakow} znaków w linii. Typografia trzyma się przedziału od 45 do 75, bo tyle oko ` +
          'obejmuje bez gubienia się przy powrocie do następnej linii. Powyżej czyta się tę samą linijkę dwa razy.',
        opis(el),
      );
      break;
    }
  }

  // 9. Kontrast tekstu.
  const juzSprawdzone = new Set();
  for (const el of document.querySelectorAll('p, span, a, li, h1, h2, h3, figcaption, code')) {
    if (!el.textContent?.trim()) continue;
    // Tylko elementy z wlasnym tekstem. Inaczej ten sam podpis zglaszamy dwa razy:
    // raz jako figcaption, raz jako span w srodku.
    const wlasnyTekst = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!wlasnyTekst) continue;
    const styl = getComputedStyle(el);
    const klucz = `${styl.color}|${styl.fontSize}`;
    if (juzSprawdzone.has(klucz)) continue;
    juzSprawdzone.add(klucz);
    const przod = doLiczb(styl.color);
    if (!przod || przod.a < 0.95) continue;
    const tyl = tloZa(el);
    const wynik = kontrast(przod, tyl);
    const duzy = parseFloat(styl.fontSize) >= 24 || (parseFloat(styl.fontSize) >= 18.66 && Number(styl.fontWeight) >= 700);
    const prog = duzy ? 3 : 4.5;
    if (wynik < prog) {
      dodaj(
        'tekst-za-jasny',
        'bariera',
        'Tekst zlewa się z tłem',
        `Różnica jasności ${wynik.toFixed(2)} do 1, a potrzeba ${prog} do 1. W słońcu na telefonie ten tekst znika.`,
        opis(el),
      );
    }
  }

  return zastrzezenia;
}

/** Sprawdza, czy aktualnie zaznaczony element widać. */
export function sprawdzWidocznoscZaznaczenia() {
  const el = document.activeElement;
  if (!el || el === document.body) return null;
  // Tylko rzeczy, ktore sie naciska. Po otwarciu powiekszenia zaznaczenie potrafi
  // wyladowac na samym oknie - kontener nie potrzebuje obrysu, wiec to nie usterka.
  const sterujacy = el.matches('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (!sterujacy) return null;
  // Po kliknieciu myszka przegladarka celowo nie rysuje obrysu - i dobrze.
  // Pytamy tylko wtedy, gdy sama uznala, ze obrys sie nalezy.
  if (!el.matches(':focus-visible')) return null;
  const styl = getComputedStyle(el);
  const maObrys = styl.outlineStyle !== 'none' && parseFloat(styl.outlineWidth) > 0;
  const maCien = styl.boxShadow !== 'none';
  const maRamke = parseFloat(styl.borderWidth) > 0;
  const NAZWY = { a: 'odnośnik', button: 'przycisk', input: 'pole', select: 'lista wyboru', textarea: 'pole tekstowe' };
  const nazwa = el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 40) || el.tagName;
  const jak = NAZWY[el.tagName.toLowerCase()] ?? el.tagName.toLowerCase();
  const gdzie = `${jak} „${nazwa}”`;

  if (!maObrys && !maCien && !maRamke) {
    return {
      id: 'nie-widac-gdzie-jestem',
      powaga: 'bariera',
      tytul: 'Nie widać, co jest zaznaczone',
      coSieDzieje:
        'Ktoś porusza się po stronie klawiszem tabulacji i nie ma pojęcia, na czym stoi. ' +
        'To jak chodzenie po ciemnym mieszkaniu bez latarki.',
      gdzie,
    };
  }

  // Sam obrys nie wystarczy - musi go byc widac na tym, co pod nim lezy.
  // Ciemny obrys na ciemnym tle to obrys, ktorego nie ma.
  if (maObrys) {
    const czytaj = (kolor) => {
      if (!kolor) return null;
      const nowy = /color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)/.exec(kolor);
      if (nowy) return [1, 2, 3].map((i) => parseFloat(nowy[i]) * 255);
      const m = /rgba?\(([^)]+)\)/.exec(kolor);
      if (!m) return null;
      const cz = m[1].split(',').map((x) => parseFloat(x));
      return cz[3] !== undefined && cz[3] < 0.9 ? null : cz.slice(0, 3);
    };
    const jasnosc = (c) => {
      const k = c.map((x) => {
        const v = x / 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * k[0] + 0.7152 * k[1] + 0.0722 * k[2];
    };

    const obrys = czytaj(styl.outlineColor);
    const dialog = el.closest('dialog[open]');
    const tlo =
      (dialog ? czytaj(getComputedStyle(dialog, '::backdrop').backgroundColor) : null) ??
      (() => {
        let w = el;
        while (w && w !== document.documentElement) {
          const k = czytaj(getComputedStyle(w).backgroundColor);
          if (k) return k;
          w = w.parentElement;
        }
        return czytaj(getComputedStyle(document.body).backgroundColor);
      })();

    if (obrys && tlo) {
      const ja = jasnosc(obrys);
      const jt = jasnosc(tlo);
      const roznica = (Math.max(ja, jt) + 0.05) / (Math.min(ja, jt) + 0.05);
      if (roznica < 3) {
        return {
          id: 'obrys-zaznaczenia-niewidoczny',
          powaga: 'bariera',
          tytul: 'Obrys zaznaczenia jest w kolorze tła',
          coSieDzieje:
            `Obrys wokół zaznaczonego elementu odcina się od tła tylko ${roznica.toFixed(2)} do 1, ` +
            'a potrzeba 3 do 1. Obrys jest, ale nikt go nie zobaczy — czyli dla osoby ' +
            'poruszającej się klawiaturą to tak, jakby go nie było.',
          gdzie,
        };
      }
    }
  }

  return null;
}
