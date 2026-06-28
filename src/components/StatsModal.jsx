import { useEffect, useRef, useState } from 'react'
import { loadStats } from '@/utils/storage'
import styles from '@/styles/StatsModal.module.css'

function useCountdown() {
  const [time, setTime] = useState('')
  useEffect(() => {
    function tick() {
      const now = new Date()
      const midnight = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1,
      ))
      const diff = midnight - now
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1_000)
      setTime(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
      )
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

export default function StatsModal({ isOpen, onClose, gameStatus, winGuessCount }) {
  const modalRef = useRef(null)
  const countdown = useCountdown()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (isOpen) setStats(loadStats())
  }, [isOpen])

  // Escape to close
  useEffect(() => {
    if (!isOpen) return
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  // Focus trap
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

  if (!isOpen || !stats) return null

  const { gamesPlayed, gamesWon, currentStreak, bestStreak, guessDistribution } = stats
  const winPct = gamesPlayed === 0 ? 0 : Math.round((gamesWon / gamesPlayed) * 100)
  const maxCount = Math.max(...Object.values(guessDistribution), 1)
  const showCountdown = gameStatus === 'playing' || gameStatus === 'won' || gameStatus === 'lost'

  return (
    <div
      className={styles.overlay}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className={styles.modal}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Statistics"
      >
        <button className={styles.closeButton} onClick={onClose} aria-label="Close statistics">
          ✕
        </button>

        <h2 className={styles.title}>Statistics</h2>

        <div className={styles.metrics}>
          <div className={styles.metric}>
            <span className={styles.metricValue}>{gamesPlayed}</span>
            <span className={styles.metricLabel}>Played</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricValue}>{winPct}</span>
            <span className={styles.metricLabel}>Win %</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricValue}>{currentStreak}</span>
            <span className={styles.metricLabel}>Current Streak</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricValue}>{bestStreak}</span>
            <span className={styles.metricLabel}>Best Streak</span>
          </div>
        </div>

        <h3 className={styles.sectionTitle}>Guess Distribution</h3>
        <div className={styles.distribution}>
          {[1, 2, 3, 4, 5, 6].map((row) => {
            const count = guessDistribution[String(row)] ?? 0
            const pct = Math.max(Math.round((count / maxCount) * 100), 7)
            const highlighted = gameStatus === 'won' && winGuessCount === row
            return (
              <div key={row} className={styles.distRow}>
                <span className={styles.distLabel}>{row}</span>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.bar} ${highlighted ? styles.barHighlight : ''}`}
                    style={{ width: `${pct}%` }}
                  >
                    <span className={styles.barCount}>{count}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {showCountdown && (
          <div className={styles.countdown}>
            <div className={styles.countdownLabel}>Next Nerdle</div>
            <div className={styles.countdownTime}>{countdown}</div>
          </div>
        )}
      </div>
    </div>
  )
}
