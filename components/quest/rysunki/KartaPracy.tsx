// ══════════════════════════════════════════════════════════════════════
//  CO TO JEST: rysunek do katy o hierarchii. Karta jednej pracy.
//  CO MOŻESZ TU ZMIENIAĆ: wszystko - to piaskownica.
//  CZEGO LEPIEJ NIE RUSZAĆ: nazw pól odczytywanych z `w`, bo pochodzą
//                           z pokręteł opisanych w config/quest/katas.ts.
//  JAK SPRAWDZIĆ, CZY DZIAŁA: /dev/kata/hierarchia
// ══════════════════════════════════════════════════════════════════════
import type { Wartosci } from './rodzaje';

export default function KartaPracy({ w }: { w: Wartosci }) {
  const tytul = (
    <div style={{ fontSize: `${w.rozmiarTytulu}px`, lineHeight: 1.25 }} className="font-display">
      Żółta łąka
    </div>
  );
  const metadane = (
    <div
      style={{
        fontSize: `${w.rozmiarMetadanych}px`,
        opacity: 1 - Number(w.szarosc) / 100,
        lineHeight: 1.4,
      }}
    >
      olej na płótnie · 2024 · 100 × 80 cm
    </div>
  );

  return (
    <div className="border border-rule bg-paper p-6">
      <div className="mb-5 h-40 w-full bg-ink/10" aria-hidden />
      {w.kolejnosc === 'tytul' ? (
        <>
          {tytul}
          <div style={{ height: `${w.odstep}px` }} />
          {metadane}
        </>
      ) : (
        <>
          {metadane}
          <div style={{ height: `${w.odstep}px` }} />
          {tytul}
        </>
      )}
    </div>
  );
}
