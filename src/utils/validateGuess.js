import { normalizeWord } from './wordMatch.js';

/**
 * @param {string} guess
 * @returns {{ valid: true } | { valid: false; reason: 'too_short' | 'too_long' | 'invalid_characters' }}
 */
export function validateGuess(guess) {
  const normalized = normalizeWord(guess);

  if (normalized.length < 4) return { valid: false, reason: 'too_short' };
  if (normalized.length > 8) return { valid: false, reason: 'too_long' };
  if (!/^[A-Z]+$/.test(normalized)) return { valid: false, reason: 'invalid_characters' };

  return { valid: true };
}
