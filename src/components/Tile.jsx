import styles from '@/styles/Tile.module.css'

export default function Tile({ letter, state = 'empty', reveal = false, index = 0, bounceDelay = null }) {
  const hasBounce = bounceDelay !== null;
  const className = [styles.tile, styles[state], hasBounce ? styles.bounce : reveal ? styles.reveal : ''].join(' ');
  const style = hasBounce
    ? { '--tile-delay': `${index * 300}ms`, '--bounce-delay': `${bounceDelay}ms` }
    : reveal
    ? { '--tile-delay': `${index * 300}ms` }
    : undefined;

  return (
    <div className={className} style={style}>
      {letter}
    </div>
  )
}
