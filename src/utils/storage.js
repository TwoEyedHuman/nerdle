/**
 * @typedef {'correct' | 'present' | 'absent'} LetterResult
 */

/**
 * @typedef {{ word: string, results: LetterResult[] }} GuessRecord
 */

/**
 * @typedef {{ date: string, guesses: GuessRecord[], currentGuess: string, gameStatus: 'playing' | 'won' | 'lost' }} DailyState
 */

/**
 * @typedef {{ gamesPlayed: number, gamesWon: number, currentStreak: number, bestStreak: number, guessDistribution: Record<string, number> }} Stats
 */

const DAILY_KEY = 'nerdle_daily';
const STATS_KEY = 'nerdle_stats';

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

/** @returns {DailyState | null} */
export function loadDailyState() {
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.date !== todayUTC()) return null;
    return data;
  } catch {
    return null;
  }
}

/** @param {Omit<DailyState, 'date'>} state */
export function saveDailyState(state) {
  const data = { ...state, date: todayUTC() };
  localStorage.setItem(DAILY_KEY, JSON.stringify(data));
}

/** @returns {Stats} */
export function loadStats() {
  const defaults = {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    bestStreak: 0,
    guessDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 },
  };
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return defaults;
    return JSON.parse(raw);
  } catch {
    return defaults;
  }
}

/** @param {Stats} stats */
export function saveStats(stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

/**
 * @param {Stats} stats
 * @param {'won' | 'lost'} gameStatus
 * @param {number} guessCount
 * @returns {Stats}
 */
export function updateStats(stats, gameStatus, guessCount) {
  const updated = { ...stats, guessDistribution: { ...stats.guessDistribution } };
  updated.gamesPlayed += 1;
  if (gameStatus === 'won') {
    updated.gamesWon += 1;
    updated.currentStreak += 1;
    if (updated.currentStreak > updated.bestStreak) {
      updated.bestStreak = updated.currentStreak;
    }
    const bucket = String(guessCount);
    updated.guessDistribution[bucket] = (updated.guessDistribution[bucket] ?? 0) + 1;
  } else {
    updated.currentStreak = 0;
  }
  return updated;
}
