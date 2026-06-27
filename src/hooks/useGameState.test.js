import { describe, it, expect } from 'vitest';
import { gameReducer, initialState } from './useGameState.js';

const BASE = { ...initialState, answer: 'MARIO' };

function applyLetters(state, letters) {
  return letters.split('').reduce(
    (s, letter) => gameReducer(s, { type: 'ADD_LETTER', letter }),
    state,
  );
}

describe('gameReducer — ADD_LETTER', () => {
  it('appends letter to currentGuess', () => {
    const s = gameReducer(BASE, { type: 'ADD_LETTER', letter: 'M' });
    expect(s.currentGuess).toBe('M');
  });

  it('caps at 8 normalized characters', () => {
    const s = applyLetters(BASE, '123456789');
    expect(s.currentGuess).toBe('12345678');
  });

  it('no-ops when game is not playing', () => {
    const won = { ...BASE, gameStatus: 'won' };
    expect(gameReducer(won, { type: 'ADD_LETTER', letter: 'X' }).currentGuess).toBe('');
  });

  it('clears error', () => {
    const withError = { ...BASE, currentGuess: 'MA', error: 'too_short' };
    expect(gameReducer(withError, { type: 'ADD_LETTER', letter: 'R' }).error).toBeNull();
  });
});

describe('gameReducer — DELETE_LETTER', () => {
  it('removes last character', () => {
    const s = applyLetters(BASE, 'MAR');
    expect(gameReducer(s, { type: 'DELETE_LETTER' }).currentGuess).toBe('MA');
  });

  it('no-ops on empty guess', () => {
    expect(gameReducer(BASE, { type: 'DELETE_LETTER' }).currentGuess).toBe('');
  });

  it('no-ops when game is not playing', () => {
    const lost = { ...BASE, currentGuess: 'MARIO', gameStatus: 'lost' };
    expect(gameReducer(lost, { type: 'DELETE_LETTER' }).currentGuess).toBe('MARIO');
  });
});

describe('gameReducer — SUBMIT_GUESS', () => {
  it('rejects guess that is too short', () => {
    const s = applyLetters(BASE, 'MAR');
    const next = gameReducer(s, { type: 'SUBMIT_GUESS' });
    expect(next.error).toBe('too_short');
    expect(next.guesses).toHaveLength(0);
  });

  it('rejects guess with invalid characters', () => {
    const s = { ...BASE, currentGuess: '????' };
    const next = gameReducer(s, { type: 'SUBMIT_GUESS' });
    expect(next.error).toBe('invalid_characters');
    expect(next.guesses).toHaveLength(0);
  });

  it('appends valid guess and clears currentGuess', () => {
    const s = applyLetters(BASE, 'ZELDA');
    const next = gameReducer(s, { type: 'SUBMIT_GUESS' });
    expect(next.guesses).toHaveLength(1);
    expect(next.guesses[0].word).toBe('ZELDA');
    expect(next.guesses[0].results).toHaveLength(5);
    expect(next.currentGuess).toBe('');
    expect(next.error).toBeNull();
  });

  it('sets gameStatus to won on correct guess', () => {
    const s = applyLetters(BASE, 'MARIO');
    const next = gameReducer(s, { type: 'SUBMIT_GUESS' });
    expect(next.gameStatus).toBe('won');
  });

  it('sets gameStatus to lost after 6 wrong guesses', () => {
    let s = BASE;
    for (let i = 0; i < 6; i++) {
      s = applyLetters(s, 'ZELDA');
      s = gameReducer(s, { type: 'SUBMIT_GUESS' });
    }
    expect(s.gameStatus).toBe('lost');
    expect(s.guesses).toHaveLength(6);
  });

  it('does not set lost after 5 wrong guesses', () => {
    let s = BASE;
    for (let i = 0; i < 5; i++) {
      s = applyLetters(s, 'ZELDA');
      s = gameReducer(s, { type: 'SUBMIT_GUESS' });
    }
    expect(s.gameStatus).toBe('playing');
  });

  it('no-ops when game already won', () => {
    const won = { ...BASE, gameStatus: 'won', currentGuess: 'MARIO' };
    expect(gameReducer(won, { type: 'SUBMIT_GUESS' }).guesses).toHaveLength(0);
  });

  it('updates letterStates with best-seen result', () => {
    const s = applyLetters(BASE, 'ZELDA');
    const next = gameReducer(s, { type: 'SUBMIT_GUESS' });
    expect(next.letterStates).toHaveProperty('A');
  });

  it('correct beats present beats absent in letterStates', () => {
    let s = BASE;
    s = applyLetters(s, 'ZELDA');
    s = gameReducer(s, { type: 'SUBMIT_GUESS' });
    const firstA = s.letterStates['A'];
    s = applyLetters(s, 'MARIO');
    s = gameReducer(s, { type: 'SUBMIT_GUESS' });
    const secondA = s.letterStates['A'];
    const priority = { correct: 2, present: 1, absent: 0 };
    expect(priority[secondA]).toBeGreaterThanOrEqual(priority[firstA]);
  });
});

describe('gameReducer — INIT', () => {
  it('sets words and answer', () => {
    const s = gameReducer(initialState, { type: 'INIT', words: ['MARIO'], answer: 'MARIO', persisted: null });
    expect(s.answer).toBe('MARIO');
    expect(s.words).toEqual(['MARIO']);
  });

  it('hydrates from persisted state', () => {
    const persisted = {
      guesses: [{ word: 'ZELDA', results: ['absent', 'present', 'absent', 'absent', 'absent'] }],
      currentGuess: 'MA',
      gameStatus: 'playing',
      letterStates: { Z: 'absent' },
    };
    const s = gameReducer(initialState, { type: 'INIT', words: ['MARIO'], answer: 'MARIO', persisted });
    expect(s.guesses).toHaveLength(1);
    expect(s.currentGuess).toBe('MA');
    expect(s.letterStates).toEqual({ Z: 'absent' });
  });
});
