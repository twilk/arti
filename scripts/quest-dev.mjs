// Uruchamia dev server z wlaczonym harnessem. Osobny plik, bo skladnia
// "ZMIENNA=1 komenda" nie dziala w powloce Windows, a ona pracuje na Windows.
import { spawn } from 'node:child_process';

const child = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['next', 'dev'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env, NEXT_PUBLIC_QUEST: '1' },
});
child.on('exit', (code) => process.exit(code ?? 0));
