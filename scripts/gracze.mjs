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
import { obchod, postacie } from './gracze/silnik.mjs';

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
const adres = wartosc('--adres', process.env.ADRES ?? 'http://localhost:3000');
const ruchow = Number(wartosc('--ruchow', 24));
const coIleMinut = argumenty.includes('--cykl') ? Number(wartosc('--cykl', 30)) : null;

// ── Jeden obchód obu postaci ──────────────────────────────────────────
async function jedenObchod() {
  // Podane ziarno odtwarza dokladnie te sama rozgrywke - stad znalezisko da sie powtorzyc.
  const podane = wartosc('--ziarno', null);
  const ziarno = podane ? Number(podane) : Date.now() % 2147483647;
  const rundy = [];

  for (const klucz of ['telefon', 'komputer']) {
    try {
      rundy.push(await obchod({ adres, postac: postacie[klucz], ziarno, ruchow }));
    } catch (blad) {
      pusto();
      console.log('  ' + pc.red('Obchód się nie odbył.'));
      pusto();
      console.log(zawin(blad.message, 2));
      pusto();
      console.log(
        zawin(
          'Co zrobić: sprawdź, czy strona chodzi pod adresem ' +
            adres +
            '. Jeśli nie, uruchom ją komendą „npm run dev” w drugim oknie terminala.',
          2,
        ),
      );
      pusto();
      return null;
    }
  }

  const wszystkie = rundy.flatMap((r) => r.znaleziska);
  wszystkie.sort((a, b) => WAGA[a.powaga] - WAGA[b.powaga]);

  const wpis = {
    kiedy: new Date().toISOString(),
    adres,
    ziarno,
    rundy: rundy.map((r) => ({ postac: r.postac, ruchow: r.ruchow, dziennik: r.dziennik, ile: r.znaleziska.length })),
    znaleziska: wszystkie,
  };

  const historia = fs.existsSync(PLIK) ? JSON.parse(fs.readFileSync(PLIK, 'utf8')) : { wersja: 1, obchody: [] };
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
  for (const runda of wpis.rundy) {
    console.log(zawin(`${runda.postac} — ${runda.ruchow} ruchów, ${runda.ile} zastrzeżeń.`, 2));
  }
  console.log(zawin(pc.dim(`Adres: ${wpis.adres} · numer rozgrywki: ${wpis.ziarno}`), 2));
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
    console.log(zawin(pc.dim(`Gdzie: ${z.gdzie} · zauważył: ${z.gracz} · ruch numer ${z.krok}`), 4));
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
