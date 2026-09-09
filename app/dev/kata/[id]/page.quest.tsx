import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Kata from '@/components/quest/Kata';
import { kataPoId, katy } from '@/config/quest/katas';

export const metadata: Metadata = {
  title: 'Kata',
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return katy.map((kata) => ({ id: kata.id }));
}

export default async function StronaKaty({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const kata = kataPoId.get(id);
  if (!kata) notFound();

  return (
    <div className="mx-auto w-full max-w-[1000px] px-6 py-16 sm:px-10">
      <header className="pb-12">
        <p className="text-[0.7rem] uppercase tracking-[0.28em] text-muted">Kata</p>
        <h1 className="mt-5 font-display text-[clamp(2rem,6vw,3.25rem)] leading-[0.95] tracking-[-0.015em]">
          Piaskownica
        </h1>
        <p className="mt-6 max-w-[54ch] text-sm leading-relaxed text-muted">
          Tu nic nie da się zepsuć. Ta karta pracy nie jest komponentem prawdziwej strony —
          to osobny rysunek, który istnieje wyłącznie na tym ekranie. Cokolwiek zrobisz,
          portfolio zostaje nietknięte.
        </p>
      </header>

      <Kata kata={kata} />
    </div>
  );
}
