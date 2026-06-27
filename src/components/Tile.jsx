import styles from '@/styles/Tile.module.css'

export default function Tile({ letter, state = 'empty', reveal = false, index = 0 }) {
  return (
    <div
      className={[styles.tile, styles[state], reveal ? styles.reveal : ''].join(' ')}
      style={reveal ? { '--tile-delay': `${index * 300}ms` } : undefined}
    >
      {letter}
    </div>
  )
}
