// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import GaleriaQuest from '@/components/quest/GaleriaQuest';

afterEach(cleanup);

/**
 * Galeria bez prac. Na prawdziwej stronie nikt tego nie zobaczy, dopoki prac jest
 * piec - i wlasnie dlatego stan pusty tak czesto zostaje niedokonczony.
 */
describe('boss:stan-pusty', () => {
  it('pusta galeria w ogóle coś pokazuje', () => {
    const { container } = render(<GaleriaQuest artworks={[]} />);
    expect(container.textContent?.trim()).not.toBe('');
  });

  it('pusta galeria mówi, co się stało', () => {
    render(<GaleriaQuest artworks={[]} />);
    // Nie sprawdzamy konkretnego zdania - tylko tego, ze cokolwiek zostalo napisane.
    // Sama nazwa sekcji to za malo, wiec liczymy tekst dluzszy niz naglowek.
    const { container } = render(<GaleriaQuest artworks={[]} />);
    expect((container.textContent ?? '').trim().length).toBeGreaterThan(40);
  });

  it('pusta galeria mówi, co zrobić dalej', () => {
    render(<GaleriaQuest artworks={[]} />);
    // Stan pusty bez nastepnego kroku zostawia czlowieka z pytaniem "i co teraz".
    expect(screen.getByText(/sources/)).toBeTruthy();
    expect(screen.getByText(/npm run artworks/)).toBeTruthy();
  });

  it('pusta galeria nie udaje, że coś się zepsuło', () => {
    const { container } = render(<GaleriaQuest artworks={[]} />);
    const tekst = (container.textContent ?? '').toLowerCase();
    for (const slowo of ['błąd', 'awaria', 'nie udało się', 'coś poszło nie tak']) {
      expect(tekst).not.toContain(slowo);
    }
  });
});
