import { useEffect, useRef, useState } from 'react'
import styles from '@/styles/App.module.css'
import Header from '@/components/Header'
import Board from '@/components/Board'
import Keyboard from '@/components/Keyboard'
import Toast from '@/components/Toast'
import StatsModal from '@/components/StatsModal'
import ResultModal from '@/components/ResultModal'
import { useGameState } from '@/hooks/useGameState'

function App() {
  const { guesses, currentGuess, gameStatus, letterStates, restoredComplete, error, invalidCount, answer, addLetter, deleteLetter, submitGuess } = useGameState()

  const [shake, setShake] = useState(false)
  const [shakeKey, setShakeKey] = useState(0)
  const [toast, setToast] = useState(null)
  const [showStats, setShowStats] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const toastTimer = useRef(null)
  const modalTimer = useRef(null)

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

  // 800ms after last tile flip (8 tiles × 300ms stagger + 500ms duration = 2600ms)
  const FLIP_MODAL_DELAY_MS = (8 - 1) * 300 + 500 + 800;

  useEffect(() => {
    if (gameStatus !== 'won' && gameStatus !== 'lost') return
    clearTimeout(modalTimer.current)
    const delay = restoredComplete ? 1000 : FLIP_MODAL_DELAY_MS
    modalTimer.current = setTimeout(() => setShowResult(true), delay)
    return () => clearTimeout(modalTimer.current)
  }, [gameStatus, restoredComplete])

  useEffect(() => {
    function handleKeyDown(e) {
      if (showStats || showResult) return
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
  }, [showStats, showResult, gameStatus, addLetter, deleteLetter, submitGuess])

  return (
    <div className={styles.container}>
      <Header onStatsClick={() => setShowStats(true)} />
      <ResultModal
        isOpen={showResult}
        onClose={() => setShowResult(false)}
        onShowStats={() => { setShowResult(false); setShowStats(true) }}
        gameStatus={gameStatus}
        answer={answer}
        guessCount={guesses.length}
      />
      <StatsModal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        gameStatus={gameStatus}
        winGuessCount={gameStatus === 'won' ? guesses.length : null}
      />
      <main className={styles.main}>
        <div className={styles.boardContainer}>
          <Toast message={toast} />
          <Board
            guesses={guesses}
            currentGuess={currentGuess}
            currentRow={guesses.length}
            shake={shake}
            shakeKey={shakeKey}
            winRow={gameStatus === 'won' ? guesses.length - 1 : -1}
          />
        </div>
        <Keyboard
          letterStates={letterStates}
          onKey={addLetter}
          onDelete={deleteLetter}
          onEnter={submitGuess}
          disabled={gameStatus !== 'playing'}
        />
      </main>
    </div>
  )
}

export default App
