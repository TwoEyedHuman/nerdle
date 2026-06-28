import { forwardRef } from 'react'

const COLORS = {
  correct: '#00d68f',
  present: '#ffc94d',
  absent: '#1a1a2e',
  empty: 'transparent',
}

const BORDER = {
  correct: 'none',
  present: 'none',
  absent: '1px solid #2a2a40',
  empty: '1px solid #1e2a40',
}

const GLOW = {
  correct: '0 0 8px #00d68f, 0 0 16px #00d68f60',
  present: '0 0 8px #ffc94d, 0 0 16px #ffc94d60',
  absent: 'none',
  empty: 'none',
}

const ScreenshotCard = forwardRef(function ScreenshotCard({ guesses, gameStatus, guessCount }, ref) {
  const won = gameStatus === 'won'
  const guessDisplay = won ? `${guessCount}/6` : 'X/6'
  const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const rows = Array.from({ length: 6 }, (_, i) => guesses[i] ?? null)

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        left: '-9999px',
        top: '-9999px',
        width: '320px',
        padding: '32px 28px',
        backgroundColor: '#08080f',
        backgroundImage: 'radial-gradient(rgba(99, 102, 241, 0.08) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{
        fontSize: '26px',
        fontWeight: 900,
        color: '#d4e0f0',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        fontFamily: "'Orbitron', system-ui, sans-serif",
        textShadow: '0 0 12px rgba(99, 102, 241, 0.8), 0 0 24px rgba(99, 102, 241, 0.4)',
      }}>
        Nerdle
      </div>
      <div style={{ fontSize: '12px', color: '#4a5a6a', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {date}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {rows.map((guess, rowIdx) => (
          <div key={rowIdx} style={{ display: 'flex', gap: '5px' }}>
            {Array.from({ length: 8 }, (_, colIdx) => {
              const result = guess?.results[colIdx] ?? 'empty'
              return (
                <div
                  key={colIdx}
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: COLORS[result],
                    border: BORDER[result],
                    borderRadius: '4px',
                    boxShadow: GLOW[result],
                  }}
                />
              )
            })}
          </div>
        ))}
      </div>
      <div style={{
        fontSize: '20px',
        fontWeight: 700,
        color: won ? '#00d68f' : '#4a5a6a',
        letterSpacing: '0.08em',
        textShadow: won ? '0 0 10px #00d68f, 0 0 20px #00d68f60' : 'none',
      }}>
        {guessDisplay}
      </div>
    </div>
  )
})

export default ScreenshotCard
