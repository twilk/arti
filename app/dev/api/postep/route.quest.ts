import fs from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { kluczTygodnia } from '@/lib/quest/zadanie-na-dzis.mjs';

/**
 * Zapis postępu kat. Trasa istnieje wyłącznie przy włączonej grze - jej plik nazywa
 * się route.quest.ts, więc build produkcyjny w ogóle jej nie widzi. Pisze tylko do
 * .quest/progress.json i nie przyjmuje żadnej ścieżki z zewnątrz.
 */
const PLIK = () => path.join(process.cwd(), '.quest', 'progress.json');

type Postep = {
  version: number;
  katy: Record<string, { skonczona: boolean; kiedy: string; tydzien: string; notatka: string }>;
};

async function wczytaj(): Promise<Postep> {
  try {
    return JSON.parse(await fs.readFile(PLIK(), 'utf8')) as Postep;
  } catch {
    return { version: 1, katy: {} };
  }
}

export async function GET() {
  return NextResponse.json(await wczytaj());
}

export async function POST(request: Request) {
  const cialo = await request.json().catch(() => null);
  const id = typeof cialo?.id === 'string' ? cialo.id : null;
  if (!id || !/^[a-z0-9-]{1,60}$/.test(id)) {
    return NextResponse.json({ blad: 'Brak poprawnego identyfikatora katy.' }, { status: 400 });
  }

  const postep = await wczytaj();
  const poprzednia = postep.katy[id];
  postep.katy[id] = {
    skonczona: cialo.skonczona ?? poprzednia?.skonczona ?? false,
    // Tydzien zapisujemy przy pierwszym skonczeniu i juz go nie ruszamy - inaczej
    // poprawienie notatki tydzien pozniej przenosiloby kate do nowego tygodnia.
    tydzien: poprzednia?.tydzien ?? kluczTygodnia(),
    kiedy: poprzednia?.kiedy ?? new Date().toISOString(),
    notatka: typeof cialo.notatka === 'string' ? cialo.notatka : (poprzednia?.notatka ?? ''),
  };

  await fs.mkdir(path.dirname(PLIK()), { recursive: true });
  await fs.writeFile(PLIK(), `${JSON.stringify(postep, null, 2)}\n`);
  return NextResponse.json(postep.katy[id]);
}
