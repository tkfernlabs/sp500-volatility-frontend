import React, { useState } from 'react';
import { Signal } from '../types';

interface TradingSignalsProps {
  signals: Signal[];
}

const TradingSignals: React.FC<TradingSignalsProps> = ({ signals }) => {
  const [filter, setFilter] = useState<string>('all');

  const filteredSignals = signals.filter(signal => {
    if (filter === 'all') return true;
    if (filter === 'buy') return signal.type.toLowerCase().includes('buy');
    if (filter === 'sell') return signal.type.toLowerCase().includes('sell');
    if (filter === 'strong') return signal.strength >= 0.7;
    return true;
  });

  const getSignalColor = (type: string, strength: number) => {
    const baseColor = type.toLowerCase().includes('buy') ? 'green' : 
                     type.toLowerCase().includes('sell') ? 'red' : 'blue';
    const intensity = strength >= 0.7 ? '400' : strength >= 0.4 ? '300' : '200';
    return `text-${baseColor}-${intensity}`;
  };

  const getSignalBgColor = (type: string) => {
    if (type.toLowerCase().includes('buy')) return 'bg-green-900/20';
    if (type.toLowerCase().includes('sell')) return 'bg-red-900/20';
    return 'bg-blue-900/20';
  };

  const getStrengthBadge = (strength: number) => {
    if (strength >= 0.7) return { text: 'STRONG', color: 'bg-orange-600' };
    if (strength >= 0.4) return { text: 'MODERATE', color: 'bg-yellow-600' };
    return { text: 'WEAK', color: 'bg-gray-600' };
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Trading Signals</h2>
        <div className="flex space-x-2">
          {['all', 'buy', 'sell', 'strong'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                filter === filterType
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredSignals.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>No signals available for the selected filter</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wider">
                <th className="pb-3">Signal</th>
                <th className="pb-3">Strength</th>
                <th className="pb-3">Indicator</th>
                <th className="pb-3">Price</th>
                <th className="pb-3 hidden md:table-cell">Message</th>
                <th className="pb-3 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredSignals.slice(0, 10).map((signal, index) => {
                const strengthBadge = getStrengthBadge(signal.strength);
                return (
                  <tr key={index} className={`${getSignalBgColor(signal.type)} hover:bg-gray-700/50 transition-colors`}>
                    <td className="py-3">
                      <span className={`font-semibold ${
                        signal.type.toLowerCase().includes('buy') ? 'text-green-400' :
                        signal.type.toLowerCase().includes('sell') ? 'text-red-400' :
                        'text-blue-400'
                      }`}>
                        {signal.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-full max-w-[100px] bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              signal.strength >= 0.7 ? 'bg-orange-500' :
                              signal.strength >= 0.4 ? 'bg-yellow-500' :
                              'bg-gray-500'
                            }`}
                            style={{ width: `${signal.strength * 100}%` }}
                          />
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded ${strengthBadge.color} text-white`}>
                          {strengthBadge.text}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="text-sm text-gray-300">
                        {signal.indicator || 'Multiple'}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="text-sm text-white font-semibold">
                        ${signal.price?.toFixed(2) || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 hidden md:table-cell">
                      <span className="text-sm text-gray-400 line-clamp-2">
                        {signal.message}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-xs text-gray-400">
                        {new Date(signal.timestamp).toLocaleTimeString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filteredSignals.length > 10 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400">
            Showing 10 of {filteredSignals.length} signals
          </p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-green-900/20 rounded p-2">
            <p className="text-xs text-gray-400">Buy Signals</p>
            <p className="text-lg font-bold text-green-400">
              {signals.filter(s => s.type.toLowerCase().includes('buy')).length}
            </p>
          </div>
          <div className="bg-red-900/20 rounded p-2">
            <p className="text-xs text-gray-400">Sell Signals</p>
            <p className="text-lg font-bold text-red-400">
              {signals.filter(s => s.type.toLowerCase().includes('sell')).length}
            </p>
          </div>
          <div className="bg-orange-900/20 rounded p-2">
            <p className="text-xs text-gray-400">Strong Signals</p>
            <p className="text-lg font-bold text-orange-400">
              {signals.filter(s => s.strength >= 0.7).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingSignals;
