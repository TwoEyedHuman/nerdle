import { useEffect } from 'react'
import styles from '@/styles/App.module.css'
import Header from '@/components/Header'
import Board from '@/components/Board'
import Keyboard from '@/components/Keyboard'
import { useGameState } from '@/hooks/useGameState'

function App() {
  const { guesses, currentGuess, gameStatus, letterStates, addLetter, deleteLetter, submitGuess } = useGameState()

  useEffect(() => {
    function handleKeyDown(e) {
      if (gameStatus !== 'playing') return
      if (e.key === 'Backspace') {
        deleteLetter()
      } else if (e.key === 'Enter') {
        submitGuess()
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        addLetter(e.key.toUpperCase())
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameStatus, addLetter, deleteLetter, submitGuess])

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
