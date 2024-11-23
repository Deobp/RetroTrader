import { useState } from 'react';
import './App.css';
import Chart from './components/Chart';

function App() {
  const [timeframe, setTimeframe] = useState('M1');
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="chart-container">
        <Chart timeframe={timeframe} onTimeframeChange={setTimeframe} />
      </div>
    </div>
  );
}

export default App;
