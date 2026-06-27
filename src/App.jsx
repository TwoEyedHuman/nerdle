import { useEffect, useRef, useState } from 'react'
import styles from '@/styles/App.module.css'
import Header from '@/components/Header'
import Board from '@/components/Board'
import Keyboard from '@/components/Keyboard'
import Toast from '@/components/Toast'
import { useGameState } from '@/hooks/useGameState'

function App() {
  const { guesses, currentGuess, gameStatus, letterStates, error, invalidCount, addLetter, deleteLetter, submitGuess } = useGameState()

  const [shake, setShake] = useState(false)
  const [shakeKey, setShakeKey] = useState(0)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  useEffect(() => {
    if (invalidCount === 0) return
    clearTimeout(toastTimer.current)
    setShake(true)
    setShakeKey(invalidCount)
    setToast(error)
    toastTimer.current = setTimeout(() => {
      setToast(null)
      setShake(false)
    }, 1500)
  }, [invalidCount, error])

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
        <div className={styles.boardContainer}>
          <Toast message={toast} />
          <Board
            guesses={guesses}
            currentGuess={currentGuess}
            currentRow={guesses.length}
            shake={shake}
            shakeKey={shakeKey}
          />
        </div>
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
