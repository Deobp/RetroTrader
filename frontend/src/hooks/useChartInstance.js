// import { useEffect, useRef, useState } from 'react';
// import { createChart } from 'lightweight-charts';
// import { CHART_CONFIG } from '../constants/chartConfig';

// export const useChartInstance = (containerRef) => {
//   const chartRef = useRef(null);
//   const candleSeriesRef = useRef(null);
//   const drawingCanvasRef = useRef(null);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [startPoint, setStartPoint] = useState(null);

//   useEffect(() => {
//     if (!containerRef.current) return;

//     chartRef.current = createChart(containerRef.current, {
//       width: containerRef.current.clientWidth,
//       height: 1600,
//       ...CHART_CONFIG.layout,
//       localization: {
//         locale: 'en-US',
//         dateFormat: 'yyyy-MM-dd',
//       },
//     });

//     candleSeriesRef.current = chartRef.current.addCandlestickSeries(
//       CHART_CONFIG.seriesOptions
//     );

//     const canvas = document.createElement('canvas');
//     canvas.style.position = 'absolute';
//     canvas.style.top = 0;
//     canvas.style.left = 0;
//     canvas.style.pointerEvents = 'none';
//     canvas.width = containerRef.current.clientWidth;
//     canvas.height = 500;
//     containerRef.current.appendChild(canvas);
//     drawingCanvasRef.current = canvas;

//     const handleResize = () => {
//       if (chartRef.current) {
//         chartRef.current.applyOptions({
//           width: containerRef.current.clientWidth,
//         });
//         canvas.width = containerRef.current.clientWidth;
//       }
//     };

//     window.addEventListener('resize', handleResize);

//     return () => {
//       window.removeEventListener('resize', handleResize);
//       chartRef.current.remove();
//     };
//   }, []);

//   const handleMouseDown = (event) => {
//     const rect = drawingCanvasRef.current.getBoundingClientRect();
//     setIsDrawing(true);
//     setStartPoint({
//       x: event.clientX - rect.left,
//       y: event.clientY - rect.top,
//     });
//   };

//   const handleMouseMove = (event) => {
//     if (!isDrawing || !startPoint) return;

//     const rect = drawingCanvasRef.current.getBoundingClientRect();
//     const ctx = drawingCanvasRef.current.getContext('2d');

//     drawingCanvasRef.current.width = drawingCanvasRef.current.width;

//     ctx.strokeStyle = 'red';
//     ctx.lineWidth = 2;
//     ctx.beginPath();
//     ctx.moveTo(startPoint.x, startPoint.y);
//     ctx.lineTo(event.clientX - rect.left, event.clientY - rect.top);
//     ctx.stroke();
//   };

//   const handleMouseUp = () => {
//     setIsDrawing(false);
//     setStartPoint(null);
//   };

//   useEffect(() => {
//     const canvas = drawingCanvasRef.current;
//     if (canvas) {
//       canvas.style.pointerEvents = 'auto'; // Allow canvas to receive events
//       canvas.addEventListener('mousedown', handleMouseDown);
//       canvas.addEventListener('mousemove', handleMouseMove);
//       canvas.addEventListener('mouseup', handleMouseUp);
//     }

//     return () => {
//       if (canvas) {
//         canvas.removeEventListener('mousedown', handleMouseDown);
//         canvas.removeEventListener('mousemove', handleMouseMove);
//         canvas.removeEventListener('mouseup', handleMouseUp);
//       }
//     };
//   }, [isDrawing, startPoint]);

//   return { chartRef, candleSeriesRef, drawingCanvasRef };
// };
