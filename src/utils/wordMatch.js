export function normalizeWord(word) {
  return word.replace(/[-\s]/g, '').toUpperCase();
}

export function wordsMatch(guess, answer) {
  return normalizeWord(guess) === normalizeWord(answer);
}
