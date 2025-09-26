import React from 'react';
import { MarketData } from '../types';

interface MarketSummaryProps {
  data: MarketData | null;
}

const MarketSummary: React.FC<MarketSummaryProps> = ({ data }) => {
  if (!data) return null;

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  };

  const formatVolume = (vol: number) => {
    if (vol >= 1e9) return (vol / 1e9).toFixed(2) + 'B';
    if (vol >= 1e6) return (vol / 1e6).toFixed(2) + 'M';
    if (vol >= 1e3) return (vol / 1e3).toFixed(2) + 'K';
    return vol.toString();
  };

  const isPositive = data.change >= 0;
  const changeColor = isPositive ? 'text-green-400' : 'text-red-400';
  const bgColor = isPositive ? 'bg-green-900/20' : 'bg-red-900/20';

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">S&P 500 Index (US500)</h2>
          <p className="text-sm text-gray-400">Real-time market data from Yahoo Finance</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-white">${formatNumber(data.price)}</div>
          <div className={`text-lg font-semibold ${changeColor} flex items-center justify-end`}>
            <span className="mr-1">{isPositive ? '▲' : '▼'}</span>
            <span>{formatNumber(Math.abs(data.change))} ({formatNumber(Math.abs(data.changePercent))}%)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-700">
        <div className={`p-3 rounded ${bgColor}`}>
          <p className="text-xs text-gray-400 mb-1">Day Range</p>
          <p className="text-sm font-semibold text-white">
            ${formatNumber(data.low)} - ${formatNumber(data.high)}
          </p>
        </div>
        
        <div className="p-3 rounded bg-gray-700/50">
          <p className="text-xs text-gray-400 mb-1">Open</p>
          <p className="text-sm font-semibold text-white">${formatNumber(data.open)}</p>
        </div>
        
        <div className="p-3 rounded bg-gray-700/50">
          <p className="text-xs text-gray-400 mb-1">Previous Close</p>
          <p className="text-sm font-semibold text-white">${formatNumber(data.previousClose)}</p>
        </div>
        
        <div className="p-3 rounded bg-gray-700/50">
          <p className="text-xs text-gray-400 mb-1">Volume</p>
          <p className="text-sm font-semibold text-white">{formatVolume(data.volume)}</p>
        </div>
      </div>

      {data.week52High && data.week52Low && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-400">52 Week Range</span>
            <span className="text-xs text-gray-400">
              ${formatNumber(data.week52Low)} - ${formatNumber(data.week52High)}
            </span>
          </div>
          <div className="relative h-2 bg-gray-700 rounded-full">
            <div 
              className="absolute h-2 w-2 bg-blue-500 rounded-full -mt-0"
              style={{
                left: `${((data.price - data.week52Low) / (data.week52High - data.week52Low)) * 100}%`
              }}
            />
          </div>
        </div>
      )}

      {data.marketCap && data.pe_ratio && (
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-700">
          <div>
            <p className="text-xs text-gray-400 mb-1">Market Cap</p>
            <p className="text-sm font-semibold text-white">
              ${(data.marketCap / 1e12).toFixed(2)}T
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">P/E Ratio</p>
            <p className="text-sm font-semibold text-white">{formatNumber(data.pe_ratio)}</p>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-400">
          Last Updated: {new Date(data.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default MarketSummary;
