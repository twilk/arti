import { site } from '@/config/site';

export default function Header() {
  return (
    <header className="pb-16 pt-20 sm:pb-24 sm:pt-28">
      <h1 className="font-display text-[clamp(3rem,11vw,7.5rem)] leading-[0.92] tracking-[-0.015em]">
        {site.artistName}
      </h1>
      <p className="mt-5 text-[0.7rem] uppercase tracking-[0.28em] text-muted sm:mt-6">
        {site.discipline} — {site.location}
      </p>
    </header>
  );
}
