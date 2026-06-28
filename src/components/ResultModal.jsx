import { useEffect, useRef, useState } from 'react'
import styles from '@/styles/ResultModal.module.css'
import ScreenshotCard from '@/components/ScreenshotCard'
import { captureAndDownload } from '@/utils/screenshot'

export default function ResultModal({ isOpen, onClose, onShowStats, gameStatus, answer, guessCount, guesses }) {
  const modalRef = useRef(null)
  const cardRef = useRef(null)
  const [capturing, setCapturing] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    const modal = modalRef.current
    if (!modal) return
    const focusable = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    first?.focus()
    function trap(e) {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus() }
      }
    }
    modal.addEventListener('keydown', trap)
    return () => modal.removeEventListener('keydown', trap)
  }, [isOpen])

  async function handleScreenshot() {
    if (capturing || !cardRef.current) return
    setCapturing(true)
    try {
      await captureAndDownload(cardRef.current)
    } finally {
      setCapturing(false)
    }
  }

  if (!isOpen) return null

  const won = gameStatus === 'won'
  const guessDisplay = won ? `${guessCount}/6` : 'X/6'

  return (
    <>
      <ScreenshotCard
        ref={cardRef}
        guesses={guesses}
        gameStatus={gameStatus}
        guessCount={guessCount}
      />
      <div className={styles.overlay}>
        <div
          className={styles.modal}
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label="Game result"
        >
          <p className={styles.message}>
            {won ? 'You got it!' : 'Better luck tomorrow!'}
          </p>
          <p className={styles.answer}>{answer}</p>
          <p className={styles.guessCount}>{guessDisplay}</p>
          <div className={styles.actions}>
            <button className={styles.button} onClick={handleScreenshot} disabled={capturing}>
              {capturing ? '...' : 'Screenshot'}
            </button>
            <button className={`${styles.button} ${styles.buttonPrimary}`} onClick={onShowStats}>
              Stats
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
