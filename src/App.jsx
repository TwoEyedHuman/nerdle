import { loadWords } from '@/utils/loadWords'
import styles from '@/styles/App.module.css'
import Header from '@/components/Header'
import Board from '@/components/Board'
import Keyboard from '@/components/Keyboard'

const DEMO_GUESSES = [
  { word: '10+2+3=5', results: ['absent', 'correct', 'present', 'correct', 'absent', 'correct', 'absent', 'correct'] },
]

function App() {
  return (
    <div className={styles.container}>
      <Header onStatsClick={() => {}} />
      <main className={styles.main}>
        <Board
          guesses={DEMO_GUESSES}
          currentGuess="2+2"
          currentRow={1}
        />
        <Keyboard
          letterStates={{}}
          onKey={(letter) => console.log('key', letter)}
          onDelete={() => console.log('delete')}
          onEnter={() => console.log('enter')}
        />
      </main>
    </div>
  )
}

export default App
