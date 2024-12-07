Project Folder Structure
csharp
Копировать код
chart-backtesting-app/
├── public/
│   └── index.html                // HTML template
├── src/
│   ├── assets/                   // Static assets (images, icons, etc.)
│   │   └── logo.svg              // Example logo
│   ├── components/               // UI components
│   │   ├── Chart/                // Chart-related components
│   │   │   ├── Chart.jsx         // Main chart component
│   │   │   ├── PriceDisplay.jsx  // Current price display
│   │   ├── Controls/             // Control components
│   │   │   ├── TimeframeControls.jsx // Timeframe control buttons
│   │   │   ├── CandleControls.jsx    // Candle count dropdown
│   │   ├── BacktestControls/     // Backtest action buttons
│   │   │   ├── BacktestControls.jsx
│   │   ├── Stats/                // Statistics display
│   │   │   ├── Stats.jsx         // Main stats component
│   ├── context/                  // Context and providers
│   │   └── ChartContext.jsx      // Context for managing global chart state
│   ├── hooks/                    // Custom hooks
│   │   └── useChartData.js       // Fetch and manage chart data
│   ├── services/                 // API services
│   │   └── chartApi.js           // API for fetching chart data
│   ├── styles/                   // Global and component-specific styles
│   │   ├── index.css             // Reset and global styles
│   │   ├── Chart.css             // Chart-specific styles
│   ├── utils/                    // Helper functions and utilities
│   │   └── chartUtils.js         // Chart setup and formatting
│   ├── views/                    // Page-level components (if multi-page)
│   │   └── Dashboard.jsx         // Main dashboard view
│   ├── App.jsx                   // Root app component
│   ├── index.jsx                 // ReactDOM entry point
├── .eslintignore                 // Ignored files for ESLint
├── .eslintrc.json                // ESLint configuration
├── .prettierrc                   // Prettier configuration
├── package.json                  // Dependencies and scripts
├── README.md                     // Documentation
└── yarn.lock / package-lock.json // Dependency lockfile
Folder Explanation
assets/

Place static assets like images, icons, or fonts here.
Keep large files organized in subfolders if needed.
components/

Group components into subfolders by feature (e.g., Chart, Controls).
Each subfolder contains the component file and optional styles (.css).
Avoid clutter by grouping related files (e.g., PriceDisplay is part of Chart).
context/

Store React Contexts for managing global states (e.g., chart state).
Facilitates the transition to a state management library like Redux or Zustand later.
hooks/

Store reusable custom hooks here (e.g., useChartData for fetching and managing chart data).
Hooks encapsulate logic to keep components clean and focused.
services/

Handle API calls in a centralized manner.
Abstract logic to ensure components stay clean and maintainable.
Example: chartApi.js contains functions like fetchChartData.
styles/

Use index.css for global styles and reset rules.
Include component-specific styles in the respective components folder if needed.
utils/

Include helper functions like data formatting, chart configuration, or calculations.
Example: chartUtils.js for processing raw data into chart-compatible formats.
views/

Use for page-level components, such as Dashboard.
This is useful if you add routing later (e.g., react-router-dom).
Configuration files

Use .eslintrc.json and .prettierrc for code formatting and linting.
Helps maintain code consistency as the project scales.
Best Practices
Future TypeScript Conversion

Use default exports sparingly. Prefer named exports for clarity and better type checking in TS.
Example:
jsx
Копировать код
export const Chart = () => { /* Component code */ };
Avoid prop drilling by using Context or hooks.
Scaling with Context or Redux

Use ChartContext to manage shared state like currentTimeframe and candleCount.
Transition to Redux or Zustand only if the state grows complex.
Modularity

Keep components small and focused. For example:
Chart handles chart rendering only.
PriceDisplay is a child component for displaying the price.
CSS Best Practices

Prefer scoped styles (e.g., CSS Modules or libraries like TailwindCSS).
Use utility-first CSS for faster development.
API Handling

Centralize API logic in the services folder for easy refactoring.
Include error handling for real-world API issues.
Testing

Consider adding tests folder with component and API tests later.
This structure keeps your project clean and organized, making it easier to scale and convert to TypeScript in the future. It also provides flexibility for adding more features like routing, state management, or complex UI logic.


















Step 1: Initialize React Project
Create a new React project using Vite:

bash
Копировать код
npm create vite@latest react-chart-app --template react
cd react-chart-app
npm install
Install necessary packages:

bash
Копировать код
npm install lightweight-charts
Delete unnecessary files like App.css, App.jsx, and replace them with our components.

Step 2: Organize the Project Structure
Here’s the project structure we'll follow:

css
Копировать код
src/
├── components/
│   ├── Chart.jsx
│   ├── Controls.jsx
│   ├── Stats.jsx
│   ├── BacktestControls.jsx
├── context/
│   ├── TradingContext.jsx
├── data/
│   ├── DataManager.js
├── styles/
│   ├── styles.css
├── App.jsx
├── main.jsx
Step 3: Create Trading Context
We will use React Context to manage the trading state.

File: src/context/TradingContext.jsx

jsx
Копировать код
import React, { createContext, useState } from 'react';

export const TradingContext = createContext();

export const TradingProvider = ({ children }) => {
    const [state, setState] = useState({
        currentIndex: 0,
        isBacktesting: false,
        trades: [],
        currentPosition: 'None',
        currentTimeframe: '15min',
        currentPrice: null,
    });

    const updateState = (newState) => {
        setState((prev) => ({ ...prev, ...newState }));
    };

    return (
        <TradingContext.Provider value={{ state, updateState }}>
            {children}
        </TradingContext.Provider>
    );
};
Step 4: Create Data Manager
File: src/data/DataManager.js

js
Копировать код
export default class DataManager {
    constructor() {
        this.baseUrl = './data';
    }

    async loadData(timeframe) {
        const fileName = `EURUSD_${timeframe}.json`;
        const url = `${this.baseUrl}/${fileName}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch data: ${response.statusText}`);

            const rawData = await response.json();
            const data = rawData.time.map((time, i) => ({
                time: time,
                open: rawData.open[i],
                high: rawData.high[i],
                low: rawData.low[i],
                close: rawData.close[i],
            }));

            return data;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}
Step 5: Build the Chart Component
File: src/components/Chart.jsx

jsx
Копировать код
import React, { useContext, useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import { TradingContext } from '../context/TradingContext';

const Chart = ({ data }) => {
    const { state } = useContext(TradingContext);
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        chartRef.current = createChart(chartContainerRef.current, {
            width: 800,
            height: 400,
            layout: { backgroundColor: '#1e1e1e', textColor: '#d1d4dc' },
            grid: { vertLines: { color: '#2a2a2a' }, horzLines: { color: '#2a2a2a' } },
            timeScale: { timeVisible: true },
        });

        seriesRef.current = chartRef.current.addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
        });

        return () => chartRef.current.remove();
    }, []);

    useEffect(() => {
        if (seriesRef.current) {
            seriesRef.current.setData(data);
        }
    }, [data]);

    return <div ref={chartContainerRef}></div>;
};

export default Chart;
Step 6: Create Controls Component
File: src/components/Controls.jsx

jsx
Копировать код
import React, { useContext } from 'react';
import { TradingContext } from '../context/TradingContext';

const Controls = ({ onTimeframeChange }) => {
    const { state, updateState } = useContext(TradingContext);

    const handleTimeframeChange = (timeframe) => {
        updateState({ currentTimeframe: timeframe });
        onTimeframeChange(timeframe);
    };

    return (
        <div className="control-group">
            <button onClick={() => handleTimeframeChange('1min')}>M1</button>
            <button onClick={() => handleTimeframeChange('5min')}>M5</button>
            <button onClick={() => handleTimeframeChange('15min')}>M15</button>
        </div>
    );
};

export default Controls;
Step 7: Create Stats Component
File: src/components/Stats.jsx

jsx
Копировать код
import React, { useContext } from 'react';
import { TradingContext } from '../context/TradingContext';

const Stats = () => {
    const { state } = useContext(TradingContext);

    return (
        <div className="stats">
            <div>Total Trades: {state.trades.length}</div>
            <div>Win Rate: {((state.trades.filter(t => t.profit > 0).length / state.trades.length) * 100).toFixed(2)}%</div>
            <div>Profit/Loss: ${state.trades.reduce((sum, t) => sum + t.profit, 0).toFixed(2)}</div>
        </div>
    );
};

export default Stats;
Step 8: App Component
File: src/App.jsx

jsx
Копировать код
import React, { useEffect, useState } from 'react';
import { TradingProvider } from './context/TradingContext';
import Chart from './components/Chart';
import Controls from './components/Controls';
import Stats from './components/Stats';
import DataManager from './data/DataManager';

const App = () => {
    const [data, setData] = useState([]);
    const dataManager = new DataManager();

    useEffect(() => {
        const fetchData = async () => {
            const initialData = await dataManager.loadData('15min');
            setData(initialData);
        };
        fetchData();
    }, []);

    const handleTimeframeChange = async (timeframe) => {
        const newData = await dataManager.loadData(timeframe);
        setData(newData);
    };

    return (
        <TradingProvider>
            <Controls onTimeframeChange={handleTimeframeChange} />
            <Chart data={data} />
            <Stats />
        </TradingProvider>
    );
};

export default App;
Step 9: Add Styling
File: src/styles/styles.css

css
Копировать код
body {
    background-color: #1e1e1e;
    color: #d1d4dc;
    font-family: Arial, sans-serif;
}
.control-group {
    margin: 10px 0;
}
.stats {
    margin-top: 20px;
}
Step 10: Run the Project
Start the project:

bash
Копировать код
npm run dev
This will run your React app and display the candlestick chart with backtesting controls.






-----------








Step 1: Project Setup
Create Your React App:

bash
Копировать код
npx create-react-app chart-app --template typescript
cd chart-app
Install Lightweight Charts:

bash
Копировать код
npm install lightweight-charts
Set Up Folder Structure: Inside src, create these folders for better organization:

kotlin
Копировать код
src/
├── components/       // All reusable React components
│   ├── Chart/
│   ├── Controls/
│   ├── Stats/
├── context/          // Global state management
├── hooks/            // Custom React hooks
├── utils/            // Utility functions like time formatters
├── data/             // Static or mock data files
├── styles/           // Global and component-specific styles
Step 2: Build the Chart Component
Why Start Here?

The chart component is the foundation of your app.
It handles rendering candlestick data, reacting to updates, and setting up the Lightweight Charts library.
Component Code: Create a Chart.tsx file in components/Chart/.

tsx
Копировать код
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';

interface ChartProps {
  data: Array<{
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
  }>;
}

const Chart: React.FC<ChartProps> = ({ data }) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  useEffect(() => {
    if (chartContainerRef.current) {
      // Create the chart instance
      chartRef.current = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.offsetWidth,
        height: 400,
        layout: {
          backgroundColor: '#1e1e1e',
          textColor: '#d1d4dc',
        },
        grid: {
          vertLines: { color: '#2a2a2a' },
          horzLines: { color: '#2a2a2a' },
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        },
      });

      // Add candlestick series
      seriesRef.current = chartRef.current.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderUpColor: '#26a69a',
        borderDownColor: '#ef5350',
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });

      // Set initial data
      seriesRef.current.setData(data);

      // Clean up chart on unmount
      return () => chartRef.current?.remove();
    }
  }, [data]);

  return <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />;
};

export default Chart;
Test the Chart: Replace the content of App.tsx with:

tsx
Копировать код
import React from 'react';
import Chart from './components/Chart/Chart';

const mockData = [
  { time: 1672531200, open: 1.05, high: 1.10, low: 1.03, close: 1.08 },
  { time: 1672534800, open: 1.08, high: 1.15, low: 1.06, close: 1.10 },
  { time: 1672538400, open: 1.10, high: 1.12, low: 1.07, close: 1.08 },
];

const App: React.FC = () => {
  return (
    <div style={{ width: '800px', margin: 'auto' }}>
      <h1 style={{ color: '#d1d4dc', textAlign: 'center' }}>Candlestick Chart</h1>
      <Chart data={mockData} />
    </div>
  );
};

export default App;
Run the App:

bash
Копировать код
npm start
You should see the chart with mock data rendered in your browser.

Step 3: Add Controls
Next, you’ll create components for timeframe selection and candlestick count. These controls will update the chart data.

Create a Controls.tsx file in components/Controls/:

tsx
Копировать код
import React from 'react';

interface ControlsProps {
  onTimeframeChange: (timeframe: string) => void;
}

const Controls: React.FC<ControlsProps> = ({ onTimeframeChange }) => {
  const timeframes = ['1min', '5min', '15min', '30min', '1h', '4h', '1day'];

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
      {timeframes.map((tf) => (
        <button
          key={tf}
          style={{
            padding: '10px',
            margin: '0 5px',
            background: '#2a2a2a',
            color: '#d1d4dc',
            border: 'none',
            cursor: 'pointer',
          }}
          onClick={() => onTimeframeChange(tf)}
        >
          {tf.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default Controls;
Step 4: Integrate Controls with Chart
Update App.tsx to include Controls:

tsx
Копировать код
import React, { useState } from 'react';
import Chart from './components/Chart/Chart';
import Controls from './components/Controls/Controls';

const App: React.FC = () => {
  const [data, setData] = useState([]);
  const [timeframe, setTimeframe] = useState('15min');

  const handleTimeframeChange = async (tf: string) => {
    setTimeframe(tf);
    // Fetch new data for the selected timeframe
    const response = await fetch(`./data/EURUSD_${tf.toUpperCase()}.json`);
    const rawData = await response.json();
    setData(
      rawData.map((item: any) => ({
        time: item.time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }))
    );
  };

  return (
    <div style={{ width: '800px', margin: 'auto' }}>
      <h1 style={{ color: '#d1d4dc', textAlign: 'center' }}>Candlestick Chart</h1>
      <Controls onTimeframeChange={handleTimeframeChange} />
      <Chart data={data} />
    </div>
  );
};

export default App;
Step 5: Add Global State for Backtesting
Once the chart and controls work, introduce global state for managing trades, backtesting, and stats using React Context.

Let me know if you’d like to move to this step!