import styles from '@/styles/Board.module.css'
import Tile from './Tile'

const ROWS = 6
const COLS = 8

export default function Board({ guesses = [], currentGuess = '', currentRow = 0 }) {
  return (
    <div className={styles.board}>
      {Array.from({ length: ROWS }, (_, rowIndex) => {
        const isSubmitted = rowIndex < currentRow

        if (isSubmitted) {
          const { word, results } = guesses[rowIndex]
          return (
            <div key={rowIndex} className={styles.row}>
              {Array.from({ length: COLS }, (_, colIndex) => (
                <Tile
                  key={colIndex}
                  letter={word[colIndex] ?? ''}
                  state={results[colIndex] ?? 'empty'}
                  reveal
                  index={colIndex}
                />
              ))}
            </div>
          )
        }

        if (rowIndex === currentRow) {
          return (
            <div key={rowIndex} className={styles.row}>
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
