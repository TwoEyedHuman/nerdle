import styles from '@/styles/Header.module.css'

function StatsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      width="24"
      height="24"
      aria-hidden="true"
    >
      <path d="M3 13h2v8H3v-8zm4-6h2v14H7V7zm4 3h2v11h-2V10zm4-7h2v18h-2V3zm4 5h2v13h-2V8z" />
    </svg>
  )
}

export default function Header({ onStatsClick }) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Nerdle</h1>
        <button
          className={styles.statsButton}
          onClick={onStatsClick}
          aria-label="View stats"
        >
          <StatsIcon />
        </button>
      </div>
    </header>
  )
}
