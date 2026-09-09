import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Obietnica "harness nie istnieje na produkcji" jest warta tyle, ile jej sprawdzenie.
 * Ten zestaw pilnuje mechanizmu, ktory ja realizuje: trasy questa nazywaja sie
 * page.quest.tsx, a Next widzi je tylko wtedy, gdy NEXT_PUBLIC_QUEST=1 dopisze
 * `quest.tsx` do pageExtensions.
 */
const ROOT = process.cwd();

describe('harness nie wycieka na produkcję', () => {
  it('każda trasa pod app/dev nosi rozszerzenie questowe', () => {
    const devDir = path.join(ROOT, 'app', 'dev');
    if (!fs.existsSync(devDir)) return;

    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (/^(page|layout|route)\.tsx?$/.test(entry.name)) {
          offenders.push(path.relative(ROOT, full));
        }
      }
    };
    walk(devDir);

    expect(offenders).toEqual([]);
  });

  it('pageExtensions dopuszcza questowe trasy tylko przy NEXT_PUBLIC_QUEST=1', () => {
    const config = fs.readFileSync(path.join(ROOT, 'next.config.mjs'), 'utf8');
    expect(config).toContain("process.env.NEXT_PUBLIC_QUEST === '1'");
    expect(config).toContain('pageExtensions');
    // Bez flagi lista rozszerzen nie moze zawierac wariantu questowego.
    const offBranch = /pageExtensions:[^;]*?:\s*(\[[^\]]*\])/s.exec(config)?.[1] ?? '';
    expect(offBranch).not.toContain('quest');
  });

  it('prawdziwa strona nie importuje niczego z harnessu', () => {
    const dirs = ['app', 'components', 'config', 'data', 'lib'];
    const offenders: string[] = [];
    const walk = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === 'quest' || entry.name === 'dev') continue;
          walk(full);
        } else if (/\.tsx?$/.test(entry.name) && !entry.name.includes('.quest.')) {
          const source = fs.readFileSync(full, 'utf8');
          if (/from '@\/(config\/quest|components\/quest|lib\/quest)/.test(source)) {
            offenders.push(path.relative(ROOT, full));
          }
        }
      }
    };
    for (const dir of dirs) walk(path.join(ROOT, dir));

    expect(offenders).toEqual([]);
  });
});
