// ══════════════════════════════════════════════════════════════════════
//  CO TO JEST: `npm run gracze`. Dwie postacie chodzą po stronie, robią
//              nieprzewidywalne rzeczy i spisują, co im nie pasuje.
//  CO MOŻESZ TU ZMIENIAĆ: nic nie musisz.
//  CZEGO LEPIEJ NIE RUSZAĆ: zapisu do .quest/znaleziska.json.
//  JAK SPRAWDZIĆ, CZY DZIAŁA: npm run gracze
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pc from 'picocolors';
import { obchod, otworzPrzegladarke, postacie } from './gracze/silnik.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const PLIK = path.join(ROOT, '.quest', 'znaleziska.json');

const WAGA = { blokada: 0, bariera: 1, zgrzyt: 2, szansa: 3 };
const ETYKIETA = {
  blokada: 'NIE DA SIĘ UŻYĆ',
  bariera: 'CZĘŚĆ OSÓB NIE DA RADY',
  zgrzyt: 'DZIAŁA, ALE KŁUJE',
  szansa: 'DA SIĘ LEPIEJ',
};
const KOLOR = { blokada: pc.red, bariera: pc.yellow, zgrzyt: pc.cyan, szansa: pc.dim };

const WIDTH = 74;
const linia = () => console.log(pc.dim('  ' + '─'.repeat(WIDTH)));
const pusto = () => console.log();

const ANSI = new RegExp(String.fromCharCode(27) + String.raw`\[[0-9;]*m`, 'g');
const dlugosc = (s) => s.replace(ANSI, '').length;

function zawin(tekst, wciecie = 4, szerokosc = WIDTH - 4) {
  const slowa = String(tekst).split(/\s+/);
  const linie = [];
  let biezaca = '';
  for (const slowo of slowa) {
    if (dlugosc((biezaca + ' ' + slowo).trim()) > szerokosc) {
      linie.push(biezaca.trim());
      biezaca = slowo;
    } else {
      biezaca += ' ' + slowo;
    }
  }
  if (biezaca.trim()) linie.push(biezaca.trim());
  return linie.map((l) => ' '.repeat(wciecie) + l).join('\n');
}

// ── Argumenty ─────────────────────────────────────────────────────────
const argumenty = process.argv.slice(2);
const wartosc = (nazwa, domyslna) => {
  const i = argumenty.indexOf(nazwa);
  return i >= 0 && argumenty[i + 1] ? argumenty[i + 1] : domyslna;
};
// Kilka adresow po przecinku: gracze chodza po kazdym po kolei. Dzieki temu
// patroluja nie tylko prawdziwa strone, ale i kopie do cwiczen - czyli sprawdzaja
// takze to, co sami budujemy.
const adresy = wartosc('--adres', process.env.ADRES ?? 'http://localhost:3000,http://localhost:3000/dev/quest')
  .split(',')
  .map((a) => a.trim())
  .filter(Boolean);
const ruchow = Number(wartosc('--ruchow', 24));
const coIleMinut = argumenty.includes('--cykl') ? Number(wartosc('--cykl', 30)) : null;

// ── Jeden obchód obu postaci ──────────────────────────────────────────
async function jedenObchod() {
  // Podane ziarno odtwarza dokladnie te sama rozgrywke - stad znalezisko da sie powtorzyc.
  const podane = wartosc('--ziarno', null);
  const ziarno = podane ? Number(podane) : Date.now() % 2147483647;
  const rundy = [];

  const pominiete = [];
  const przegladarka = await otworzPrzegladarke();

  try {
  for (const adres of adresy) {
    for (const klucz of ['telefon', 'komputer']) {
      try {
        rundy.push(await obchod({ adres, postac: postacie[klucz], ziarno, ruchow, przegladarka }));
      } catch (blad) {
        // Adres, ktorego nie ma, nie przerywa calego obchodu. Kopia do cwiczen
        // istnieje tylko przy „npm run quest:dev” - przy zwyklym „npm run dev”
        // po prostu jej nie ma i to nie jest powod, zeby nie sprawdzic reszty.
        if (!pominiete.includes(adres)) pominiete.push(adres);
        break;
      }
    }
  }
  } finally {
    await przegladarka.close();
  }

  if (rundy.length === 0) {
    pusto();
    console.log('  ' + pc.red('Obchód się nie odbył.'));
    pusto();
    console.log(zawin(`Żaden z adresów nie odpowiedział: ${adresy.join(', ')}`, 2));
    pusto();
    console.log(
      zawin('Co zrobić: uruchom stronę komendą „npm run quest:dev” w drugim oknie terminala.', 2),
    );
    pusto();
    return null;
  }

  // To samo zastrzezenie widza zwykle obie postacie. W raporcie ma sie pojawic raz,
  // z informacja, kto je zauwazyl - inaczej polowa ekranu to powtorzenia.
  const scalone = new Map();
  for (const runda of rundy) {
    for (const z of runda.znaleziska) {
      const klucz = `${z.id}|${z.gdzie}|${z.adres ?? runda.adres}`;
      const istniejace = scalone.get(klucz);
      if (istniejace) {
        if (!istniejace.gracze.includes(z.gracz)) istniejace.gracze.push(z.gracz);
        istniejace.krok = Math.min(istniejace.krok, z.krok);
      } else {
        scalone.set(klucz, { ...z, adres: z.adres ?? runda.adres, gracze: [z.gracz] });
      }
    }
  }
  const wszystkie = [...scalone.values()];
  wszystkie.sort((a, b) => WAGA[a.powaga] - WAGA[b.powaga]);

  const wpis = {
    kiedy: new Date().toISOString(),
    adres: adresy.join(', '),
    adresy,
    pominiete,
    ziarno,
    rundy: rundy.map((r) => ({
      adres: r.adres,
      postac: r.postac,
      ruchow: r.ruchow,
      dziennik: r.dziennik,
      ile: r.znaleziska.length,
    })),
    znaleziska: wszystkie,
  };

  const historia = fs.existsSync(PLIK) ? JSON.parse(fs.readFileSync(PLIK, 'utf8')) : { wersja: 1, obchody: [] };
  // Zapis ruchow zostaje tylko przy najswiezszym obchodzie. Starsze i tak da sie
  // odtworzyc z ziarna, a bez tego plik puchl o pol tysiaca linii na kazdy obchod
  // i kazde uruchomienie robilo halas w historii repozytorium.
  for (const stary of historia.obchody) {
    for (const runda of stary.rundy) delete runda.dziennik;
  }
  historia.obchody.push(wpis);
  // Trzymamy ostatnie trzydziesci obchodow - reszta to balast.
  historia.obchody = historia.obchody.slice(-30);
  fs.mkdirSync(path.dirname(PLIK), { recursive: true });
  fs.writeFileSync(PLIK, JSON.stringify(historia, null, 2) + '\n');

  return { wpis, historia };
}

// ── Ekran ─────────────────────────────────────────────────────────────
function pokaz({ wpis, historia }) {
  const czas = new Date(wpis.kiedy).toLocaleString('pl-PL');
  pusto();
  console.log('  ' + pc.bold('OBCHÓD GRACZY') + pc.dim(' '.repeat(Math.max(1, WIDTH - 13 - czas.length)) + czas));
  linia();
  pusto();

  console.log('  ' + pc.dim('KTO GRAŁ'));
  pusto();
  for (const adres of (wpis.adresy ?? [wpis.adres]).filter((a) => !wpis.pominiete?.includes(a))) {
    console.log(zawin(pc.dim(adres), 2));
    for (const runda of wpis.rundy.filter((r) => (r.adres ?? wpis.adres) === adres)) {
      console.log(zawin(`${runda.postac} — ${runda.ruchow} ruchów, ${runda.ile} zastrzeżeń.`, 4));
    }
  }
  if (wpis.pominiete?.length) {
    console.log(zawin(pc.dim(`Pominięte, bo nie odpowiedziały: ${wpis.pominiete.join(', ')}`), 2));
  }
  console.log(zawin(pc.dim(`Numer rozgrywki: ${wpis.ziarno}`), 2));
  pusto();
  linia();
  pusto();

  console.log('  ' + pc.dim('CO ZNALEŹLI'));
  pusto();

  if (wpis.znaleziska.length === 0) {
    console.log(zawin('Nic. Obie postacie przeszły stronę wzdłuż i wszerz i nie mają zastrzeżeń.', 2));
    pusto();
  }

  let ostatniaPowaga = null;
  for (const z of wpis.znaleziska) {
    if (z.powaga !== ostatniaPowaga) {
      ostatniaPowaga = z.powaga;
      console.log('  ' + KOLOR[z.powaga](ETYKIETA[z.powaga]));
      pusto();
    }
    console.log(zawin(pc.bold(z.tytul), 4));
    console.log(zawin(z.coSieDzieje, 4));
    const kto = (z.gracze ?? [z.gracz]).length > 1 ? `obie postacie` : (z.gracze ?? [z.gracz])[0];
    console.log(zawin(pc.dim(`Gdzie: ${z.gdzie} · ${kto} · ruch ${z.krok}` + (wpis.adresy && wpis.adresy.length > 1 ? ` · ${z.adres}` : ``)), 4));
    pusto();
  }

  linia();
  pusto();
  console.log('  ' + pc.dim('JAK TO POWTÓRZYĆ'));
  pusto();
  console.log(zawin(`Ta sama rozgrywka odtworzy się komendą:`, 2));
  pusto();
  console.log('    ' + pc.bold(`npm run gracze -- --ziarno ${wpis.ziarno}`));
  pusto();
  console.log(zawin(pc.dim('Pełny zapis ruchów leży w .quest/znaleziska.json'), 2));
  pusto();

  if (historia.obchody.length > 1) {
    const poprzedni = historia.obchody[historia.obchody.length - 2];
    const roznica = wpis.znaleziska.length - poprzedni.znaleziska.length;
    linia();
    pusto();
    console.log('  ' + pc.dim('W PORÓWNANIU Z POPRZEDNIM OBCHODEM'));
    pusto();
    const opis =
      roznica === 0
        ? 'Tyle samo zastrzeżeń co ostatnio.'
        : roznica < 0
          ? `O ${Math.abs(roznica)} mniej niż ostatnio.`
          : `O ${roznica} więcej niż ostatnio.`;
    console.log(zawin(roznica <= 0 ? pc.green(opis) : pc.yellow(opis), 2));
    pusto();
  }
}

// ── Bieg ──────────────────────────────────────────────────────────────
const wynik = await jedenObchod();
if (wynik) pokaz(wynik);

if (coIleMinut) {
  console.log(zawin(pc.dim(`Następny obchód za ${coIleMinut} min. Przerwiesz klawiszami Ctrl+C.`), 2));
  pusto();
  setInterval(
    async () => {
      const kolejny = await jedenObchod();
      if (kolejny) pokaz(kolejny);
    },
    coIleMinut * 60 * 1000,
  );
} else if (!wynik) {
  process.exit(1);
}
