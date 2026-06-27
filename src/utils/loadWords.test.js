import { describe, it, expect, vi } from 'vitest';
import { loadWords } from './loadWords.js';

function mockFetch(text) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ text: () => Promise.resolve(text) }));
}

describe('loadWords', () => {
  it('returns array of trimmed non-empty strings', async () => {
    mockFetch('MARIO\nLINK\nZELDA\n');
    const words = await loadWords();
    expect(words).toEqual(['MARIO', 'LINK', 'ZELDA']);
  });

  it('filters blank lines and trims whitespace', async () => {
    mockFetch('SONIC\n\n  KIRBY  \n\nSAMUS');
    const words = await loadWords();
    expect(words).toEqual(['SONIC', 'KIRBY', 'SAMUS']);
  });
});
