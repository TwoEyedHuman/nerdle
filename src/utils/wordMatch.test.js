import { describe, it, expect } from 'vitest';
import { normalizeWord, wordsMatch } from './wordMatch.js';

describe('normalizeWord', () => {
  it('strips hyphens and uppercases', () => {
    expect(normalizeWord('PAC-MAN')).toBe('PACMAN');
  });

  it('strips spaces and uppercases', () => {
    expect(normalizeWord('pac man')).toBe('PACMAN');
  });

  it('passes through already-normalized word', () => {
    expect(normalizeWord('PACMAN')).toBe('PACMAN');
  });
});

describe('wordsMatch', () => {
  it('matches hyphenated vs space-separated', () => {
    expect(wordsMatch('PAC MAN', 'PAC-MAN')).toBe(true);
  });

  it('matches no-separator vs hyphenated', () => {
    expect(wordsMatch('PACMAN', 'PAC-MAN')).toBe(true);
  });

  it('returns false for different words', () => {
    expect(wordsMatch('MARIO', 'PAC-MAN')).toBe(false);
  });
});
