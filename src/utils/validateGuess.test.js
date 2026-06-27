import { describe, it, expect } from 'vitest';
import { validateGuess } from './validateGuess.js';

describe('validateGuess', () => {
  it('valid 4-letter word', () => {
    expect(validateGuess('BIRD')).toEqual({ valid: true });
  });

  it('valid 8-letter word', () => {
    expect(validateGuess('ABSOLUTE')).toEqual({ valid: true });
  });

  it('valid word with separators stripped', () => {
    expect(validateGuess('BIG-FOOT')).toEqual({ valid: true });
  });

  it('too short after normalization', () => {
    expect(validateGuess('CAT')).toEqual({ valid: false, reason: 'too_short' });
  });

  it('empty string is too short', () => {
    expect(validateGuess('')).toEqual({ valid: false, reason: 'too_short' });
  });

  it('separators-only is too short', () => {
    expect(validateGuess('---')).toEqual({ valid: false, reason: 'too_short' });
  });

  it('too long after normalization', () => {
    expect(validateGuess('ABCDEFGHI')).toEqual({ valid: false, reason: 'too_long' });
  });

  it('invalid characters after normalization', () => {
    expect(validateGuess('HELL0')).toEqual({ valid: false, reason: 'invalid_characters' });
  });

  it('invalid characters with numbers only', () => {
    expect(validateGuess('1234')).toEqual({ valid: false, reason: 'invalid_characters' });
  });

  it('case-insensitive — lowercase valid', () => {
    expect(validateGuess('bird')).toEqual({ valid: true });
  });
});
