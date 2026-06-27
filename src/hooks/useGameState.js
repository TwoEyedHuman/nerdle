import { useReducer, useEffect, useCallback } from 'react';
import { loadWords } from '@/utils/loadWords';
import { getTodaysAnswer } from '@/utils/getTodaysAnswer';
import { evaluateGuess } from '@/utils/evaluateGuess';
import { validateGuess } from '@/utils/validateGuess';
import { normalizeWord, wordsMatch } from '@/utils/wordMatch';
import { loadDailyState } from '@/utils/storage';

const MAX_GUESSES = 6;
const RESULT_PRIORITY = { correct: 2, present: 1, absent: 0 };

function mergeLetterStates(current, word, results) {
  const updated = { ...current };
  const normalized = normalizeWord(word);
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];
    const result = results[i];
    if (!updated[ch] || RESULT_PRIORITY[result] > RESULT_PRIORITY[updated[ch]]) {
      updated[ch] = result;
    }
  }
  return updated;
}

export const initialState = {
  words: [],
  answer: '',
  guesses: [],
  currentGuess: '',
  gameStatus: 'playing',
  letterStates: {},
  restoredComplete: false,
  error: null,
  invalidCount: 0,
};

export function gameReducer(state, action) {
  switch (action.type) {
    case 'INIT': {
      const { words, answer, persisted } = action;
      if (persisted) {
        const savedGuesses = persisted.guesses ?? [];
        let letterStates = {};
        for (const { word, results } of savedGuesses) {
          letterStates = mergeLetterStates(letterStates, word, results);
        }
        const savedStatus = persisted.gameStatus ?? 'playing';
        return {
          ...state,
          words,
          answer,
          guesses: savedGuesses,
          currentGuess: persisted.currentGuess ?? '',
          gameStatus: savedStatus,
          letterStates,
          restoredComplete: savedStatus === 'won' || savedStatus === 'lost',
        };
      }
      return { ...state, words, answer };
    }
    case 'ADD_LETTER': {
      if (state.gameStatus !== 'playing') return state;
      if (normalizeWord(state.currentGuess).length >= 8) return state;
      return { ...state, currentGuess: state.currentGuess + action.letter, error: null };
    }
    case 'DELETE_LETTER': {
      if (state.gameStatus !== 'playing') return state;
      return { ...state, currentGuess: state.currentGuess.slice(0, -1), error: null };
    }
    case 'SUBMIT_GUESS': {
      if (state.gameStatus !== 'playing') return state;
      const validation = validateGuess(state.currentGuess);
      if (!validation.valid) {
        return { ...state, error: validation.reason, invalidCount: state.invalidCount + 1 };
      }
      const results = evaluateGuess(state.currentGuess, state.answer);
      const newGuess = { word: state.currentGuess, results };
      const newGuesses = [...state.guesses, newGuess];
      const newLetterStates = mergeLetterStates(state.letterStates, state.currentGuess, results);

      let newStatus = state.gameStatus;
      if (wordsMatch(state.currentGuess, state.answer)) {
        newStatus = 'won';
      } else if (newGuesses.length >= MAX_GUESSES) {
        newStatus = 'lost';
      }

      return {
        ...state,
        guesses: newGuesses,
        currentGuess: '',
        gameStatus: newStatus,
        letterStates: newLetterStates,
        error: null,
      };
    }
    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    loadWords().then((words) => {
      const answer = getTodaysAnswer(words);
      const persisted = loadDailyState();
      dispatch({ type: 'INIT', words, answer, persisted });
    });
  }, []);

  const addLetter = useCallback((letter) => dispatch({ type: 'ADD_LETTER', letter }), []);
  const deleteLetter = useCallback(() => dispatch({ type: 'DELETE_LETTER' }), []);
  const submitGuess = useCallback(() => dispatch({ type: 'SUBMIT_GUESS' }), []);

  return {
    guesses: state.guesses,
    currentGuess: state.currentGuess,
    gameStatus: state.gameStatus,
    letterStates: state.letterStates,
    restoredComplete: state.restoredComplete,
    error: state.error,
    invalidCount: state.invalidCount,
    answer: state.answer,
    addLetter,
    deleteLetter,
    submitGuess,
  };
}
