import { forwardRef } from 'react'

const COLORS = {
  correct: '#538d4e',
  present: '#b59f3b',
  absent: '#3a3a3c',
  empty: '#d3d6da',
}

function getThemeColors() {
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return {
    background: dark ? '#121213' : '#ffffff',
    text: dark ? '#ffffff' : '#1a1a1a',
    textSecondary: dark ? '#818384' : '#6b6b6b',
    emptyBorder: dark ? '#3a3a3c' : '#d3d6da',
  }
}

const ScreenshotCard = forwardRef(function ScreenshotCard({ guesses, gameStatus, guessCount }, ref) {
  const theme = getThemeColors()
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
        backgroundColor: theme.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ fontSize: '28px', fontWeight: 800, color: theme.text, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Nerdle
      </div>
      <div style={{ fontSize: '13px', color: theme.textSecondary, letterSpacing: '0.05em' }}>
        {date}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {rows.map((guess, rowIdx) => (
          <div key={rowIdx} style={{ display: 'flex', gap: '4px' }}>
            {Array.from({ length: 8 }, (_, colIdx) => {
              const result = guess?.results[colIdx]
              const bg = result ? COLORS[result] : 'transparent'
              const border = result ? 'none' : `2px solid ${theme.emptyBorder}`
              return (
                <div
                  key={colIdx}
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: bg,
                    border,
                    borderRadius: '2px',
                  }}
                />
              )
            })}
          </div>
        ))}
      </div>
      <div style={{ fontSize: '18px', fontWeight: 700, color: theme.text, letterSpacing: '0.05em' }}>
        {guessDisplay}
      </div>
    </div>
  )
})

export default ScreenshotCard
