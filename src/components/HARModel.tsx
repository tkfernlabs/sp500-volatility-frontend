import React from 'react';
import { HARParams } from '../types';

interface HARModelProps {
  params: HARParams | null;
}

const HARModel: React.FC<HARModelProps> = ({ params }) => {
  if (!params) return null;

  const formatNumber = (num: number, decimals: number = 4) => {
    return num.toFixed(decimals);
  };

  const formatPercentage = (num: number) => {
    return (num * 100).toFixed(2) + '%';
  };

  const getR2Quality = (r2: number) => {
    if (r2 >= 0.8) return { text: 'Excellent', color: 'text-green-400' };
    if (r2 >= 0.6) return { text: 'Good', color: 'text-yellow-400' };
    if (r2 >= 0.4) return { text: 'Fair', color: 'text-orange-400' };
    return { text: 'Poor', color: 'text-red-400' };
  };

  const r2Quality = getR2Quality(params.r_squared);

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">HAR Model Parameters</h2>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">Model Fit:</span>
          <span className={`text-sm font-bold ${r2Quality.color}`}>
            {r2Quality.text}
          </span>
        </div>
      </div>

      <div className="bg-gray-700/30 rounded p-4 mb-4">
        <p className="text-xs text-gray-400 mb-2">Model Equation</p>
        <code className="text-sm text-blue-300 font-mono">
          σ²(t+1) = {formatNumber(params.intercept, 3)} + 
          {formatNumber(params.daily, 3)}·RV<sub>d</sub> + 
          {formatNumber(params.weekly, 3)}·RV<sub>w</sub> + 
          {formatNumber(params.monthly, 3)}·RV<sub>m</sub>
        </code>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-700/50 rounded p-3">
          <p className="text-xs text-gray-400 mb-1">Daily Component</p>
          <p className="text-lg font-bold text-white">{formatNumber(params.daily)}</p>
          <div className="mt-1 h-1 bg-gray-600 rounded-full">
            <div 
              className="h-1 bg-blue-500 rounded-full"
              style={{ width: `${Math.abs(params.daily) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-700/50 rounded p-3">
          <p className="text-xs text-gray-400 mb-1">Weekly Component</p>
          <p className="text-lg font-bold text-white">{formatNumber(params.weekly)}</p>
          <div className="mt-1 h-1 bg-gray-600 rounded-full">
            <div 
              className="h-1 bg-green-500 rounded-full"
              style={{ width: `${Math.abs(params.weekly) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-700/50 rounded p-3">
          <p className="text-xs text-gray-400 mb-1">Monthly Component</p>
          <p className="text-lg font-bold text-white">{formatNumber(params.monthly)}</p>
          <div className="mt-1 h-1 bg-gray-600 rounded-full">
            <div 
              className="h-1 bg-purple-500 rounded-full"
              style={{ width: `${Math.abs(params.monthly) * 50}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-700/50 rounded p-3">
          <p className="text-xs text-gray-400 mb-1">Intercept</p>
          <p className="text-lg font-bold text-white">{formatNumber(params.intercept)}</p>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-4">
        <h3 className="text-sm font-semibold text-white mb-3">Volatility Forecasts</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-900/20 rounded p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">1-Day</p>
            <p className="text-xl font-bold text-blue-400">
              {formatNumber(params.forecast_1d)}
            </p>
          </div>
          <div className="bg-green-900/20 rounded p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">5-Day</p>
            <p className="text-xl font-bold text-green-400">
              {formatNumber(params.forecast_5d)}
            </p>
          </div>
          <div className="bg-purple-900/20 rounded p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">22-Day</p>
            <p className="text-xl font-bold text-purple-400">
              {formatNumber(params.forecast_22d)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">R² Score</p>
            <div className="flex items-center space-x-2">
              <p className={`text-lg font-bold ${r2Quality.color}`}>
                {formatPercentage(params.r_squared)}
              </p>
              <div className="flex-1 h-2 bg-gray-700 rounded-full">
                <div 
                  className={`h-2 rounded-full ${
                    params.r_squared >= 0.8 ? 'bg-green-500' :
                    params.r_squared >= 0.6 ? 'bg-yellow-500' :
                    params.r_squared >= 0.4 ? 'bg-orange-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${params.r_squared * 100}%` }}
                />
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Mean Squared Error</p>
            <p className="text-lg font-bold text-white">{formatNumber(params.mse, 6)}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-900/10 rounded border border-blue-800/50">
        <p className="text-xs text-blue-300">
          <strong>Interpretation:</strong> The HAR model shows that {
            params.monthly > params.weekly && params.monthly > params.daily 
              ? 'long-term (monthly) volatility patterns have the strongest predictive power'
              : params.weekly > params.daily 
                ? 'medium-term (weekly) volatility patterns dominate'
                : 'short-term (daily) volatility drives future volatility'
          } with an R² of {formatPercentage(params.r_squared)}.
        </p>
      </div>
    </div>
  );
};

export default HARModel;
