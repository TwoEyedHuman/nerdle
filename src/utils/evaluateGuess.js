import { normalizeWord } from './wordMatch.js';

/**
 * @typedef {'correct' | 'present' | 'absent'} LetterResult
 */

/**
 * @param {string} guess
 * @param {string} answer
 * @returns {LetterResult[]}
 */
export function evaluateGuess(guess, answer) {
  const g = normalizeWord(guess);
  const a = normalizeWord(answer);

  const results = Array(g.length).fill('absent');

  // Count available letters in answer
  const remaining = {};
  for (const ch of a) {
    remaining[ch] = (remaining[ch] ?? 0) + 1;
  }

  // Pass 1: mark correct, consume from remaining
  for (let i = 0; i < g.length; i++) {
    if (g[i] === a[i]) {
      results[i] = 'correct';
      remaining[g[i]]--;
    }
  }

  // Pass 2: mark present from remaining
  for (let i = 0; i < g.length; i++) {
    if (results[i] === 'correct') continue;
    const ch = g[i];
    if (remaining[ch] > 0) {
      results[i] = 'present';
      remaining[ch]--;
    }
  }

  return results;
}
