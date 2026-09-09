import About from '@/components/About';
import Contact from '@/components/Contact';
import Gallery from '@/components/Gallery';
import Header from '@/components/Header';
import { site } from '@/config/site';
import { artworks } from '@/data/artworks';

/** Quiet catalogue-style section marker: small tracked label over a hairline rule. */
function SectionLabel({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="mb-8 border-t border-rule pt-3 text-[0.7rem] uppercase tracking-[0.28em] text-muted sm:mb-12"
    >
      {children}
    </h2>
  );
}

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-10 lg:px-16 2xl:max-w-[1560px]">
      <Header />

      <main>
        <section aria-labelledby="works">
          <SectionLabel id="works">Selected works</SectionLabel>
          <Gallery artworks={artworks} />
        </section>

        <section aria-labelledby="about" className="pt-10 sm:pt-16">
          <SectionLabel id="about">About</SectionLabel>
          <About />
        </section>

        <section aria-labelledby="contact" className="pt-20 sm:pt-28">
          <SectionLabel id="contact">Contact</SectionLabel>
          <Contact />
        </section>
      </main>

      <footer className="mt-24 border-t border-rule py-8 text-[0.7rem] uppercase tracking-[0.24em] text-muted sm:mt-32">
        © {new Date().getFullYear()} {site.artistName}
      </footer>
    </div>
  );
}
