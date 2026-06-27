import { describe, it, expect } from 'vitest';
import { evaluateGuess } from './evaluateGuess.js';

describe('evaluateGuess', () => {
  it('all correct', () => {
    expect(evaluateGuess('ZELDA', 'ZELDA')).toEqual([
      'correct', 'correct', 'correct', 'correct', 'correct',
    ]);
  });

  it('all absent', () => {
    // BIRTH shares no letters with ZELDA
    expect(evaluateGuess('BIRTH', 'ZELDA')).toEqual([
      'absent', 'absent', 'absent', 'absent', 'absent',
    ]);
  });

  it('all present — anagram', () => {
    // ARIOM is an anagram of MARIO
    expect(evaluateGuess('ARIOM', 'MARIO')).toEqual([
      'present', 'present', 'present', 'present', 'present',
    ]);
  });

  it('duplicate in guess — first L present, second L absent, trailing A correct (LLAMA / ZELDA)', () => {
    // ZELDA has one L at index 2; LLAMA has L at index 0 and 1
    // Pass 1: A(4) is correct (both have A at index 4), consumes the answer's A
    // Pass 2: L(0) → present (one L remaining), L(1) → absent (no L left)
    expect(evaluateGuess('LLAMA', 'ZELDA')).toEqual([
      'present', 'absent', 'absent', 'absent', 'correct',
    ]);
  });

  it('duplicate in answer — present only up to remaining count', () => {
    // LLAMA (L,L,A,M,A) has 2 A's. Guess AAAAZ has 4 A's.
    // Pass 1: A(2)=A correct; remaining A=1
    // Pass 2: A(0) present; A(1) absent; A(3) absent
    expect(evaluateGuess('AAAAZ', 'LLAMA')).toEqual([
      'present', 'absent', 'correct', 'absent', 'absent',
    ]);
  });

  it('normalizes separators before evaluation', () => {
    expect(evaluateGuess('ZEL-DA', 'ZELDA')).toEqual([
      'correct', 'correct', 'correct', 'correct', 'correct',
    ]);
  });

  it('correct takes priority over present for same letter', () => {
    // ABBEY (A,B,B,E,Y) — 2 B's. Guess KEBAB (K,E,B,A,B).
    // Pass 1: B(2)=B correct; remaining B=1
    // Pass 2: E→present, A→present, B(4)→present (one B still available)
    expect(evaluateGuess('KEBAB', 'ABBEY')).toEqual([
      'absent', 'present', 'correct', 'present', 'present',
    ]);
  });
});
