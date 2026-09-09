// ══════════════════════════════════════════════════════════════════════
//  CO TO JEST: rysunek do katy o obrysie zaznaczenia. Ten sam przycisk
//              na jasnym i na ciemnym tle jednocześnie.
//  CO MOŻESZ TU ZMIENIAĆ: wszystko - to piaskownica.
//  CZEGO LEPIEJ NIE RUSZAĆ: tego, że tła są dwa. Obrys, który działa na
//                           jednym, potrafi zniknąć na drugim - i o tym
//                           jest cała ta kata.
//  JAK SPRAWDZIĆ, CZY DZIAŁA: /dev/kata/pierscien
// ══════════════════════════════════════════════════════════════════════
import type { Wartosci } from './rodzaje';

const ATRAMENT = '#171715';
const PAPIER = '#f6f5f2';
const CIEMNE_TLO = '#0e0e0d';

/**
 * Dwa tla obok siebie. Obrys w kolorze atramentu wyglada bez zarzutu na papierze
 * i znika na ciemnym - i wlasnie tak bylo na prawdziwej stronie, dopoki gracze
 * tego nie wytropili. Ta kata nie jest wymyslona.
 */
function Powierzchnia({
  tlo,
  kolorTekstu,
  kolorObrysu,
  grubosc,
  odsuniecie,
  podpis,
}: {
  tlo: string;
  kolorTekstu: string;
  kolorObrysu: string;
  grubosc: number;
  odsuniecie: number;
  podpis: string;
}) {
  return (
    <div style={{ backgroundColor: tlo }} className="p-8">
      <div style={{ color: kolorTekstu }} className="mb-5 text-xs uppercase tracking-[0.18em] opacity-70">
        {podpis}
      </div>
      {/* Rysunek, nie prawdziwy przycisk - obrys jest tu pokazany, nie wywolany. */}
      <span
        style={{
          backgroundColor: 'transparent',
          color: kolorTekstu,
          border: `1px solid ${kolorTekstu}`,
          padding: '12px 22px',
          fontSize: '13px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          outline: grubosc > 0 ? `${grubosc}px solid ${kolorObrysu}` : 'none',
          outlineOffset: `${odsuniecie}px`,
          display: 'inline-flex',
          minHeight: 44,
          alignItems: 'center',
        }}
      >
        Zamknij
      </span>
    </div>
  );
}

export default function PierscienFocusu({ w }: { w: Wartosci }) {
  const grubosc = Number(w.gruboscObrysu);
  const odsuniecie = Number(w.odsuniecieObrysu);

  const naJasnym = w.kolorObrysu === 'papier' ? PAPIER : ATRAMENT;
  const naCiemnym =
    w.kolorObrysu === 'atrament' ? ATRAMENT : w.kolorObrysu === 'papier' ? PAPIER : PAPIER;

  return (
    <div className="grid gap-px border border-rule bg-rule sm:grid-cols-2">
      <Powierzchnia
        tlo={PAPIER}
        kolorTekstu={ATRAMENT}
        kolorObrysu={naJasnym}
        grubosc={grubosc}
        odsuniecie={odsuniecie}
        podpis="na stronie"
      />
      <Powierzchnia
        tlo={CIEMNE_TLO}
        kolorTekstu={PAPIER}
        kolorObrysu={naCiemnym}
        grubosc={grubosc}
        odsuniecie={odsuniecie}
        podpis="w powiększeniu pracy"
      />
    </div>
  );
}
