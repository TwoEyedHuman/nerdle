import { loadWords } from '@/utils/loadWords'
import styles from '@/styles/App.module.css'
import Header from '@/components/Header'

function App() {
  return (
    <div className={styles.container}>
      <Header onStatsClick={() => {}} />
    </div>
  )
}

export default App
