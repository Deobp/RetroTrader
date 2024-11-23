import { useState } from 'react'
import './App.css'
import TimeframeControls from './components/Controls/TimeframeControls';

function App() {
  const [timeframe, setTimeframe] = useState('1m');
  return (
    <div>
      <TimeframeControls setTf={setTimeframe} />
    </div>
  )

}

export default App
