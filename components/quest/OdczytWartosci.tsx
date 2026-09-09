// ══════════════════════════════════════════════════════════════════════
//  CO TO JEST: tabliczka z aktualnymi wartościami i ich progami.
//  CO MOŻESZ TU ZMIENIAĆ: nic nie musisz. Sama się przelicza.
//  CZEGO LEPIEJ NIE RUSZAĆ: progów — to są liczby z normy, nie z gustu.
//  JAK SPRAWDZIĆ, CZY DZIAŁA: npm run quest:dev, potem /dev/quest
// ══════════════════════════════════════════════════════════════════════

import { caption, miaraWiersza, paper, title, wysokoscPrzycisku } from '@/config/quest/tokens';
import { AA_NORMAL, contrastRatio } from '@/lib/quest/contrast';

/**
 * Bez tego trzeba by zgadywać, czy zmiana liczby coś dała. Wysokości przycisku
 * nie widać w galerii, bo obraz jest od niej wyższy - a odczyt pokazuje ją wprost.
 */
export default function OdczytWartosci() {
  const kontrastPodpisu = contrastRatio(caption, paper);

  const wiersze = [
    {
      co: 'Kontrast podpisu',
      teraz: `${kontrastPodpisu.toFixed(2)} do 1`,
      prog: `co najmniej ${AA_NORMAL} do 1`,
      dobrze: kontrastPodpisu >= AA_NORMAL,
    },
    {
      co: 'Wysokość przycisku',
      teraz: `${wysokoscPrzycisku} pikseli`,
      prog: 'co najmniej 44 piksele',
      dobrze: wysokoscPrzycisku >= 44,
    },
    {
      co: 'Miara wiersza',
      teraz: `${miaraWiersza} znaków`,
      prog: 'od 45 do 75 znaków',
      dobrze: miaraWiersza >= 45 && miaraWiersza <= 75,
    },
  ];

  return (
    <table className="mb-14 w-full max-w-[70ch] border-collapse text-sm">
      <caption className="mb-4 text-left text-[0.7rem] uppercase tracking-[0.28em] text-muted">
        Wartości, które teraz obowiązują
      </caption>
      <tbody>
        {wiersze.map((w) => (
          <tr key={w.co} className="border-t border-rule">
            <th scope="row" className="whitespace-nowrap py-3 pr-6 text-left font-normal" style={{ color: title }}>
              {w.co}
            </th>
            <td className="whitespace-nowrap py-3 pr-6 tabular-nums" style={{ color: title }}>
              {w.teraz}
            </td>
            <td className="whitespace-nowrap py-3 pr-6 text-muted">{w.prog}</td>
            <td className="whitespace-nowrap py-3 text-right">
              {/* Znak i slowo, nie sam kolor - kolor nie moze byc jedynym nosnikiem informacji. */}
              <span className={w.dobrze ? 'text-muted' : ''} style={w.dobrze ? undefined : { color: '#8a2f2f' }}>
                {w.dobrze ? '✓ przechodzi' : '✕ nie przechodzi'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
