import styles from '@/styles/App.module.css'
import Header from '@/components/Header'
import Board from '@/components/Board'
import Keyboard from '@/components/Keyboard'
import { useGameState } from '@/hooks/useGameState'

function App() {
  const { guesses, currentGuess, letterStates, addLetter, deleteLetter, submitGuess } = useGameState()

  return (
    <div className={styles.container}>
      <Header onStatsClick={() => {}} />
      <main className={styles.main}>
        <Board
          guesses={guesses}
          currentGuess={currentGuess}
          currentRow={guesses.length}
        />
        <Keyboard
          letterStates={letterStates}
          onKey={addLetter}
          onDelete={deleteLetter}
          onEnter={submitGuess}
        />
      </main>
    </div>
  )
}

export default App
