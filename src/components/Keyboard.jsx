import styles from '@/styles/Keyboard.module.css'

const ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['ENTER','Z','X','C','V','B','N','M','DELETE'],
]

export default function Keyboard({ letterStates = {}, onKey, onDelete, onEnter }) {
  function handleClick(key) {
    if (key === 'DELETE') onDelete()
    else if (key === 'ENTER') onEnter()
    else onKey(key)
  }

  return (
    <div className={styles.keyboard}>
      {ROWS.map((row, i) => (
        <div key={i} className={styles.row}>
          {row.map(key => {
            const state = letterStates[key] ?? 'unplayed'
            return (
              <button
                key={key}
                className={[styles.key, styles[state], key.length > 1 ? styles.wide : ''].join(' ')}
                onClick={() => handleClick(key)}
                aria-label={key}
              >
                {key}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
