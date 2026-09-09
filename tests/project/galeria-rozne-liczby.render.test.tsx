// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import Gallery from '@/components/Gallery';
import type { Artwork } from '@/data/artworks';

afterEach(cleanup);

/**
 * jsdom nie ma showModal ani close - HTMLDialogElement jest tam zaimplementowany
 * tylko czesciowo. Dokladamy namiastke, ale trzeba wiedziec, czego ona NIE sprawdza:
 * prawdziwej semantyki okna modalnego, czyli pulapki zaznaczenia, wylaczenia tla
 * i natywnego Escape. Tego pilnuja gracze i przeglad QA w prawdziwej przegladarce.
 * Tutaj sprawdzamy wylacznie wlasna logike komponentu wokol tych wywolan.
 */
beforeAll(() => {
  const proto = window.HTMLDialogElement?.prototype;
  if (!proto) return;
  if (!proto.showModal) {
    proto.showModal = function showModal(this: HTMLDialogElement) {
      this.open = true;
    };
  }
  if (!proto.close) {
    proto.close = function close(this: HTMLDialogElement) {
      this.open = false;
      this.dispatchEvent(new Event('close'));
    };
  }
});

const PIKSEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/** Prace o roznych proporcjach, bo galeria ma je zachowywac, a nie ujednolicac. */
function prace(ile: number): Artwork[] {
  const ksztalty = [
    { width: 1984, height: 1488 },
    { width: 1282, height: 718 },
    { width: 945, height: 966 },
    { width: 424, height: 512 },
  ];
  return Array.from({ length: ile }, (_, i) => ({
    id: `praca-${i}`,
    src: `/artworks/praca-${i}.webp`,
    title: `Praca ${i + 1}`,
    blurDataURL: PIKSEL,
    ...ksztalty[i % ksztalty.length],
  }));
}

const otworzPierwsza = () => fireEvent.click(screen.getAllByRole('button', { name: /^Open / })[0]);

describe('galeria przy różnej liczbie prac', () => {
  it('bez prac mówi, co zrobić, zamiast pokazywać pustkę', () => {
    const { container } = render(<Gallery artworks={[]} />);
    expect((container.textContent ?? '').trim().length).toBeGreaterThan(20);
    expect(container.textContent).toContain('sources');
  });

  it('przy jednej pracy nie pokazuje strzałek do przewracania', () => {
    render(<Gallery artworks={prace(1)} />);
    otworzPierwsza();
    // Strzalki miedzy jedna praca a nia sama to przycisk, ktory nic nie robi.
    expect(screen.queryByRole('button', { name: /Next artwork/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Previous artwork/ })).toBeNull();
  });

  it('przy jednej pracy powiększenie i tak się otwiera i zamyka', () => {
    render(<Gallery artworks={prace(1)} />);
    otworzPierwsza();
    const okno = document.querySelector('dialog');
    expect(okno).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Close viewer/ }));
    expect(document.querySelector('dialog[open]')).toBeNull();
  });

  it('przy dwóch pracach strzałki są, bo mają dokąd prowadzić', () => {
    render(<Gallery artworks={prace(2)} />);
    otworzPierwsza();
    expect(screen.getByRole('button', { name: /Next artwork/ })).toBeTruthy();
  });

  it('przy dwudziestu pracach renderuje wszystkie', () => {
    render(<Gallery artworks={prace(20)} />);
    expect(screen.getAllByRole('button', { name: /^Open / })).toHaveLength(20);
  });

  it('przy dwudziestu pracach tylko pierwsze wchodzą od razu, reszta leniwie', () => {
    render(<Gallery artworks={prace(20)} />);
    const obrazy = [...document.querySelectorAll('img')];
    const leniwe = obrazy.filter((i) => i.getAttribute('loading') === 'lazy');
    // Gdyby wszystkie wchodzily od razu, galeria z dwudziestoma pracami sciagalaby
    // je wszystkie przy pierwszym wejsciu - to jest ten koszt, ktory rosnie z kazda
    // dodana praca.
    expect(leniwe.length).toBeGreaterThanOrEqual(obrazy.length - 3);
  });

  it('każda praca zachowuje własne proporcje niezależnie od liczby', () => {
    render(<Gallery artworks={prace(20)} />);
    const obrazy = [...document.querySelectorAll('img')];
    const proporcje = new Set(
      obrazy.map((i) => (Number(i.getAttribute('width')) / Number(i.getAttribute('height'))).toFixed(3)),
    );
    // Cztery ksztalty w danych - jesli galeria je ujednolica, zostanie jeden.
    expect(proporcje.size).toBe(4);
  });

  it('tytuł każdej pracy trafia do opisu dla czytnika ekranu', () => {
    render(<Gallery artworks={prace(3)} />);
    for (const tytul of ['Praca 1', 'Praca 2', 'Praca 3']) {
      expect(screen.getByAltText(new RegExp(tytul))).toBeTruthy();
    }
  });
});
