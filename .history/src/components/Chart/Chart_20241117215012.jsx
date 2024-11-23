const TradingChart = ({ timeframe = '15min' }) => {
  const containerRef = useRef(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const { data, error, isLoading } = useChartData(timeframe);
  const { chartRef, candleSeriesRef } = useChartInstance(containerRef, data);

  // Set the current price when data changes
  useEffect(() => {
    if (data && data.length > 0) {
      setCurrentPrice(data[data.length - 1].close);
    }
  }, [data]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-900 rounded-lg border border-red-500">
        <div className="text-red-500">
          Error loading chart data: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div ref={containerRef} className="border border-gray-700 rounded-lg" />
      {isLoading && !data && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="text-blue-500">Loading chart data...</div>
        </div>
      )}
      {currentPrice && (
        <div className="text-right text-sm">
          Current Price: {currentPrice.toFixed(5)}
        </div>
      )}
    </div>
  );
};
