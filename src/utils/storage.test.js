import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { loadDailyState, saveDailyState, loadStats, saveStats, updateStats } from './storage.js';

const TODAY = '2026-06-27';

// Minimal localStorage mock
function makeLocalStorage() {
  const store = new Map();
  return {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => store.set(k, v),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  };
}

beforeEach(() => {
  vi.stubGlobal('localStorage', makeLocalStorage());
  vi.useFakeTimers();
  vi.setSystemTime(new Date(`${TODAY}T12:00:00Z`));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('loadDailyState', () => {
  it('returns null when key missing', () => {
    expect(loadDailyState()).toBeNull();
  });

  it('returns null when stored date is stale', () => {
    localStorage.setItem(
      'nerdle_daily',
      JSON.stringify({ date: '2026-06-26', guesses: [], currentGuess: '', gameStatus: 'playing' }),
    );
    expect(loadDailyState()).toBeNull();
  });

  it('returns null on malformed JSON', () => {
    localStorage.setItem('nerdle_daily', '{bad json}');
    expect(loadDailyState()).toBeNull();
  });

  it('returns state when date matches today', () => {
    const state = { date: TODAY, guesses: [], currentGuess: 'AB', gameStatus: 'playing' };
    localStorage.setItem('nerdle_daily', JSON.stringify(state));
    expect(loadDailyState()).toEqual(state);
  });
});

describe('saveDailyState', () => {
  it('writes state with current UTC date', () => {
    saveDailyState({ guesses: [], currentGuess: '', gameStatus: 'playing' });
    const stored = JSON.parse(localStorage.getItem('nerdle_daily'));
    expect(stored.date).toBe(TODAY);
  });

  it('overwrites previous save', () => {
    saveDailyState({ guesses: [], currentGuess: 'A', gameStatus: 'playing' });
    saveDailyState({ guesses: [], currentGuess: 'BC', gameStatus: 'playing' });
    const stored = JSON.parse(localStorage.getItem('nerdle_daily'));
    expect(stored.currentGuess).toBe('BC');
  });
});

describe('loadStats', () => {
  it('returns zero-state defaults when key missing', () => {
    const stats = loadStats();
    expect(stats.gamesPlayed).toBe(0);
    expect(stats.gamesWon).toBe(0);
    expect(stats.currentStreak).toBe(0);
    expect(stats.bestStreak).toBe(0);
    expect(stats.guessDistribution).toEqual({ '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 });
  });

  it('returns defaults on malformed JSON', () => {
    localStorage.setItem('nerdle_stats', 'oops');
    expect(loadStats().gamesPlayed).toBe(0);
  });

  it('returns stored stats', () => {
    const stats = { gamesPlayed: 10, gamesWon: 7, currentStreak: 2, bestStreak: 5, guessDistribution: { '1': 0, '2': 1, '3': 3, '4': 2, '5': 1, '6': 0 } };
    localStorage.setItem('nerdle_stats', JSON.stringify(stats));
    expect(loadStats()).toEqual(stats);
  });
});

describe('saveStats', () => {
  it('persists stats to localStorage', () => {
    const stats = { gamesPlayed: 3, gamesWon: 2, currentStreak: 1, bestStreak: 2, guessDistribution: { '1': 0, '2': 1, '3': 1, '4': 0, '5': 0, '6': 0 } };
    saveStats(stats);
    expect(JSON.parse(localStorage.getItem('nerdle_stats'))).toEqual(stats);
  });
});

describe('updateStats', () => {
  const base = {
    gamesPlayed: 5,
    gamesWon: 3,
    currentStreak: 2,
    bestStreak: 4,
    guessDistribution: { '1': 0, '2': 1, '3': 1, '4': 1, '5': 0, '6': 0 },
  };

  it('increments gamesPlayed on win', () => {
    expect(updateStats(base, 'won', 3).gamesPlayed).toBe(6);
  });

  it('increments gamesWon on win', () => {
    expect(updateStats(base, 'won', 3).gamesWon).toBe(4);
  });

  it('increments currentStreak on win', () => {
    expect(updateStats(base, 'won', 3).currentStreak).toBe(3);
  });

  it('updates bestStreak when currentStreak surpasses it', () => {
    const withHighStreak = { ...base, currentStreak: 4 };
    expect(updateStats(withHighStreak, 'won', 1).bestStreak).toBe(5);
  });

  it('does not update bestStreak when currentStreak stays below', () => {
    expect(updateStats(base, 'won', 3).bestStreak).toBe(4);
  });

  it('increments guessDistribution bucket for guess count', () => {
    expect(updateStats(base, 'won', 3).guessDistribution['3']).toBe(2);
  });

  it('does not touch other buckets on win', () => {
    const result = updateStats(base, 'won', 3);
    expect(result.guessDistribution['1']).toBe(0);
    expect(result.guessDistribution['2']).toBe(1);
  });

  it('increments gamesPlayed on loss', () => {
    expect(updateStats(base, 'lost', 6).gamesPlayed).toBe(6);
  });

  it('does not increment gamesWon on loss', () => {
    expect(updateStats(base, 'lost', 6).gamesWon).toBe(3);
  });

  it('resets currentStreak to 0 on loss', () => {
    expect(updateStats(base, 'lost', 6).currentStreak).toBe(0);
  });

  it('does not increment guessDistribution on loss', () => {
    const result = updateStats(base, 'lost', 6);
    expect(result.guessDistribution['6']).toBe(0);
  });

  it('does not mutate input stats', () => {
    const before = JSON.stringify(base);
    updateStats(base, 'won', 2);
    expect(JSON.stringify(base)).toBe(before);
  });
});
