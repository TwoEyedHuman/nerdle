function hashDate(dateStr) {
  let hash = 5381;
  for (const ch of dateStr) {
    hash = (((hash << 5) + hash) ^ ch.charCodeAt(0)) >>> 0;
  }
  return hash;
}

export function getTodaysAnswer(words) {
  const date = new Date().toISOString().slice(0, 10);
  return words[hashDate(date) % words.length];
}
