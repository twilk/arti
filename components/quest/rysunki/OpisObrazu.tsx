// ══════════════════════════════════════════════════════════════════════
//  CO TO JEST: rysunek do katy o tekście alternatywnym. Pokazuje obraz
//              i to, co usłyszy osoba, która go nie widzi.
//  CO MOŻESZ TU ZMIENIAĆ: wszystko - to piaskownica.
//  CZEGO LEPIEJ NIE RUSZAĆ: tego, że obraz jest zasłonięty. Alt pisze się
//                           dla kogoś, kto obrazu nie zobaczy, więc trzeba
//                           umieć spojrzeć na swój tekst bez patrzenia na pracę.
//  JAK SPRAWDZIĆ, CZY DZIAŁA: /dev/kata/opis
// ══════════════════════════════════════════════════════════════════════
import type { Wartosci } from './rodzaje';

const TYTUL = 'Żółta łąka';

/**
 * Sygnaly, nie oceny. Nikt tu nie liczy punktow - to sa rzeczy, ktore da sie
 * stwierdzic bez czytania ze zrozumieniem, i tyle o nich mowimy.
 */
function sygnaly(opis: string) {
  const t = opis.trim();
  const wynik: { tekst: string; dobrze: boolean }[] = [];
  wynik.push({ tekst: `${t.length} znaków`, dobrze: t.length > 0 && t.length <= 140 });
  wynik.push({
    tekst: /^(obraz|zdj[eę]cie|grafika|ilustracja)\b/i.test(t)
      ? 'zaczyna się od słowa „obraz”'
      : 'nie zaczyna się od nazwy rodzaju',
    dobrze: !/^(obraz|zdj[eę]cie|grafika|ilustracja)\b/i.test(t),
  });
  wynik.push({
    tekst: t.toLowerCase() === TYTUL.toLowerCase() ? 'to sam tytuł, bez niczego więcej' : 'mówi coś ponad sam tytuł',
    dobrze: t.length > 0 && t.toLowerCase() !== TYTUL.toLowerCase(),
  });
  return wynik;
}

export default function OpisObrazu({ w }: { w: Wartosci }) {
  const opis = String(w.opis ?? '');

  return (
    <div className="space-y-6">
      <div className="border border-rule bg-paper p-6">
        <p className="mb-4 text-xs uppercase tracking-[0.18em] text-muted">
          Praca, do której piszesz opis
        </p>
        {/* Zaslonieta celowo: alt pisze sie dla kogos, kto obrazu nie zobaczy. */}
        <div className="flex h-40 w-full items-center justify-center bg-ink/10 text-xs uppercase tracking-[0.18em] text-muted">
          zasłonięta — po to, żeby czytać sam tekst
        </div>
        <p className="mt-4 font-display text-[1.0625rem]">{TYTUL}</p>
        <p className="text-xs tracking-wide text-muted">olej na płótnie · 2024 · 100 × 80 cm</p>
      </div>

      <div className="border border-rule bg-paper p-6">
        <p className="mb-4 text-xs uppercase tracking-[0.18em] text-muted">
          Co usłyszy osoba korzystająca z czytnika ekranu
        </p>
        <p className="font-display text-[1.0625rem] leading-relaxed">
          {opis.trim() ? `„Obraz. ${opis.trim()}”` : <span className="text-muted">„Obraz.” — i nic więcej</span>}
        </p>
        <ul className="mt-5 space-y-1 text-xs tracking-wide text-muted">
          {sygnaly(opis).map((s) => (
            <li key={s.tekst}>
              {/* Znak i slowo, nie sam kolor - i nie punkty. */}
              {s.dobrze ? '·' : '!'} {s.tekst}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
