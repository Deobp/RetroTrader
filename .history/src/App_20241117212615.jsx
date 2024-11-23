import { useState } from 'react'
import './App.css'
import TimeframeControls from './components/Controls/TimeframeControls';
import Chart from './components/Chart';

function App() {
  const [timeframe, setTimeframe] = useState('1m');
  return (
    <div className="flex flex-col gap-4 p-4">
    <TimeframeControls 
      currentTimeframe={timeframe}
      onTimeframeChange={setTimeframe}
    />
    <TradingChart timeframe={timeframe} />
  </div>
  )

}

export default App
