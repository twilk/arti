import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
  test: {
    // Domyslnie node: start jsdom kosztowal 95 s, a wiekszosc bossow to czysta
    // logika. Pliki, ktore renderuja komponenty, wlaczaja jsdom u siebie przez
    // `// @vitest-environment jsdom` w pierwszej linii.
    environment: 'node',
    include: ['tests/**/*.test.{ts,tsx}'],
  },
});
