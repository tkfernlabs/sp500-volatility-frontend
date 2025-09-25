import React from 'react';
import { VolatilityData } from '../types';

interface VolatilityIndicatorsProps {
  data: VolatilityData | null;
}

const VolatilityIndicators: React.FC<VolatilityIndicatorsProps> = ({ data }) => {
  if (!data) return null;

  const formatNumber = (num: number, decimals: number = 4) => {
    return num.toFixed(decimals);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend.toLowerCase()) {
      case 'increasing':
        return '📈';
      case 'decreasing':
        return '📉';
      case 'stable':
        return '➡️';
      default:
        return '〰️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend.toLowerCase()) {
      case 'increasing':
        return 'text-yellow-400';
      case 'decreasing':
        return 'text-green-400';
      case 'stable':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const indicators = [
    { 
      name: 'Realized Volatility', 
      value: data.realizedVolatility,
      description: 'Historical volatility based on past returns'
    },
    { 
      name: 'GARCH Forecast', 
      value: data.garchForecast,
      description: 'Next period volatility prediction'
    },
    { 
      name: 'ATR (14)', 
      value: data.atr14,
      description: 'Average True Range over 14 periods'
    },
    { 
      name: 'Parkinson Estimator', 
      value: data.parkinsonEstimator,
      description: 'Range-based volatility estimate'
    },
    { 
      name: 'Garman-Klass', 
      value: data.garmanKlassEstimator,
      description: 'OHLC-based volatility measure'
    }
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Volatility Indicators</h2>
        <div className={`flex items-center ${getTrendColor(data.volatilityTrend)}`}>
          <span className="mr-2">{getTrendIcon(data.volatilityTrend)}</span>
          <span className="text-sm font-semibold capitalize">{data.volatilityTrend}</span>
        </div>
      </div>

      <div className="space-y-3">
        {indicators.map((indicator, index) => (
          <div key={index} className="bg-gray-700/50 rounded p-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{indicator.name}</p>
                <p className="text-xs text-gray-400 mt-1">{indicator.description}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-400">
                  {formatNumber(indicator.value)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.impliedVolatility && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="bg-blue-900/20 rounded p-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-white">Implied Volatility (VIX proxy)</p>
                <p className="text-xs text-gray-400 mt-1">Market expectation of future volatility</p>
              </div>
              <p className="text-lg font-bold text-yellow-400">
                {formatNumber(data.impliedVolatility)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-2 bg-gray-700/30 rounded">
            <p className="text-xs text-gray-400">Risk Level</p>
            <p className={`text-sm font-bold mt-1 ${
              data.realizedVolatility > 2 ? 'text-red-400' : 
              data.realizedVolatility > 1.5 ? 'text-yellow-400' : 
              'text-green-400'
            }`}>
              {data.realizedVolatility > 2 ? 'HIGH' : 
               data.realizedVolatility > 1.5 ? 'MEDIUM' : 'LOW'}
            </p>
          </div>
          <div className="text-center p-2 bg-gray-700/30 rounded">
            <p className="text-xs text-gray-400">Market Condition</p>
            <p className="text-sm font-bold mt-1 text-blue-400">
              {data.realizedVolatility > data.garchForecast ? 'CALMING' : 'HEATING'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolatilityIndicators;
