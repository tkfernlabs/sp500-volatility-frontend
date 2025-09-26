import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, ColorType, CandlestickData, LineData } from 'lightweight-charts';

interface ChartData {
  date: string;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  volatility: number;
  predicted_upper: number;
  predicted_lower: number;
  actual_in_range: boolean;
}

interface TradingViewChartProps {
  data: ChartData[];
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ data }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const upperBandRef = useRef<ISeriesApi<'Line'> | null>(null);
  const lowerBandRef = useRef<ISeriesApi<'Line'> | null>(null);
  
  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#1f2937' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#374151' },
        horzLines: { color: '#374151' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        borderColor: '#374151',
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: '#374151',
      },
      crosshair: {
        mode: 1,
      },
    });
    chartRef.current = chart;

    // Add candlestick series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });
    candleSeriesRef.current = candleSeries;

    // Add predicted range bands
    const upperBand = chart.addLineSeries({
      color: '#fbbf24',
      lineWidth: 2,
      lineStyle: 2, // Dashed line
      title: 'Upper Range (95% CI)',
      lastValueVisible: false,
      priceLineVisible: false,
    });
    upperBandRef.current = upperBand;

    const lowerBand = chart.addLineSeries({
      color: '#fbbf24',
      lineWidth: 2,
      lineStyle: 2, // Dashed line
      title: 'Lower Range (95% CI)',
      lastValueVisible: false,
      priceLineVisible: false,
    });
    lowerBandRef.current = lowerBand;

    // Prepare data
    const candleData: CandlestickData[] = [];
    const upperData: LineData[] = [];
    const lowerData: LineData[] = [];

    data.forEach((item) => {
      const time = Math.floor(new Date(item.date).getTime() / 1000) as any;
      
      candleData.push({
        time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      });

      upperData.push({
        time,
        value: item.predicted_upper,
      });

      lowerData.push({
        time,
        value: item.predicted_lower,
      });
    });

    // Set data
    candleSeries.setData(candleData);
    upperBand.setData(upperData);
    lowerBand.setData(lowerData);

    // Fit content
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4">
          Historical Price & Predicted Ranges
        </h2>
        <div className="h-96 flex items-center justify-center">
          <p className="text-gray-400">Loading chart data...</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const latestPrice = data[data.length - 1]?.close;
  const firstPrice = data[0]?.close;
  const priceChange = ((latestPrice - firstPrice) / firstPrice) * 100;
  const accuracy = (data.filter(d => d.actual_in_range).length / data.length) * 100;

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-white">
            Historical Price & Predicted Ranges
          </h2>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-400">Up Days</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span className="text-gray-400">Down Days</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-8 h-0.5 bg-yellow-400 border-dashed border-b-2 border-yellow-400"></span>
              <span className="text-gray-400">Predicted Range (95% CI)</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Chart Details: Candlesticks show actual daily price movements (Open, High, Low, Close). 
          Yellow dashed lines indicate the predicted 95% confidence interval range based on volatility forecasts. 
          When actual prices stay within the predicted ranges, it validates our volatility model's accuracy.
        </p>
      </div>

      <div ref={chartContainerRef} className="w-full h-96" />

      <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-700">
        <div className="text-center">
          <p className="text-xs text-gray-400">Period</p>
          <p className="text-sm font-bold text-white">{data.length} Days</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400">Price Change</p>
          <p className={`text-sm font-bold ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400">Model Accuracy</p>
          <p className="text-sm font-bold text-blue-400">{accuracy.toFixed(1)}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400">Latest Price</p>
          <p className="text-sm font-bold text-white">${latestPrice?.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default TradingViewChart;
