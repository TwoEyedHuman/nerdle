import styles from '@/styles/Board.module.css'
import Tile from './Tile'

const ROWS = 6
const COLS = 8

// Last flip ends at (COLS-1)*300+500ms; bounce tiles stagger 100ms each after that
const LAST_FLIP_END_MS = (COLS - 1) * 300 + 500;

export default function Board({ guesses = [], currentGuess = '', currentRow = 0, shake = false, shakeKey = 0, winRow = -1, restoredGuessCount = 0 }) {
  return (
    <div className={styles.board}>
      {Array.from({ length: ROWS }, (_, rowIndex) => {
        const isSubmitted = rowIndex < currentRow

        if (isSubmitted) {
          const { word, results } = guesses[rowIndex]
          const isWinRow = rowIndex === winRow
          const wasRestored = rowIndex < restoredGuessCount
          return (
            <div key={rowIndex} className={styles.row}>
              {Array.from({ length: COLS }, (_, colIndex) => (
                <Tile
                  key={colIndex}
                  letter={word[colIndex] ?? ''}
                  state={results[colIndex] ?? 'empty'}
                  reveal={!wasRestored}
                  index={colIndex}
                  bounceDelay={isWinRow && !wasRestored ? LAST_FLIP_END_MS + colIndex * 100 : null}
                />
              ))}
            </div>
          )
        }

        if (rowIndex === currentRow) {
          return (
            <div key={`current-${shakeKey}`} className={`${styles.row} ${shake ? styles.rowShake : ''}`}>
              {Array.from({ length: COLS }, (_, colIndex) => {
                const letter = currentGuess[colIndex] ?? ''
                return (
                  <Tile
                    key={colIndex}
                    letter={letter}
                    state={letter ? 'filled' : 'empty'}
                  />
                )
              })}
            </div>
          )
        }

        return (
          <div key={rowIndex} className={styles.row}>
            {Array.from({ length: COLS }, (_, colIndex) => (
              <Tile key={colIndex} letter="" state="empty" />
            ))}
          </div>
        )
      })}
    </div>
  )
}
