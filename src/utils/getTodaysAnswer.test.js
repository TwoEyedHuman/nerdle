import { describe, it, expect, vi, afterEach } from 'vitest';
import { getTodaysAnswer } from './getTodaysAnswer.js';

const WORDS = ['MARIO', 'LINK', 'ZELDA', 'SAMUS', 'KIRBY', 'SONIC', 'CLOUD', 'TOAD'];

function mockDate(isoDate) {
  vi.setSystemTime(new Date(`${isoDate}T12:00:00Z`));
}

afterEach(() => {
  vi.useRealTimers();
});

describe('getTodaysAnswer', () => {
  it('returns same word for same date', () => {
    vi.useFakeTimers();
    mockDate('2026-06-27');
    const a = getTodaysAnswer(WORDS);
    const b = getTodaysAnswer(WORDS);
    expect(a).toBe(b);
  });

  it('returns different word for adjacent dates', () => {
    vi.useFakeTimers();
    mockDate('2026-06-27');
    const today = getTodaysAnswer(WORDS);
    mockDate('2026-06-28');
    const tomorrow = getTodaysAnswer(WORDS);
    expect(today).not.toBe(tomorrow);
  });

  it('returns only entry for single-word list', () => {
    vi.useFakeTimers();
    mockDate('2026-06-27');
    expect(getTodaysAnswer(['ONLY'])).toBe('ONLY');
  });

  it('result is always a word from the list', () => {
    vi.useFakeTimers();
    mockDate('2026-06-27');
    expect(WORDS).toContain(getTodaysAnswer(WORDS));
  });
});
