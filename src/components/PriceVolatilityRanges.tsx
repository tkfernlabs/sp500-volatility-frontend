import React from 'react';

interface PriceVolatilityRangesProps {
  currentPrice: number;
  openPrice?: number;
  volatility: {
    realized: number;
    garchForecast: number;
    harDaily?: number;
    harWeekly?: number;
    harMonthly?: number;
  };
}

const PriceVolatilityRanges: React.FC<PriceVolatilityRangesProps> = ({ currentPrice, openPrice, volatility }) => {
  // Calculate price ranges using 2-sigma (95% confidence interval)
  const calculatePriceRange = (vol: number, days: number, basePrice?: number) => {
    // Ensure vol is a proper decimal (if it's > 1, assume it's a percentage)
    const normalizedVol = vol > 1 ? vol / 100 : vol;
    
    // For S&P 500, typical annualized volatility is 15-20%
    // Daily volatility = Annual volatility / sqrt(252)
    const dailyVol = normalizedVol / Math.sqrt(252);
    
    // Period volatility = Daily volatility * sqrt(days)
    const periodVol = dailyVol * Math.sqrt(days);
    
    // 2-sigma gives ~95% confidence interval
    const priceToUse = basePrice || currentPrice;
    const priceMove = priceToUse * periodVol * 2;
    
    return {
      upper: priceToUse + priceMove,
      lower: priceToUse - priceMove,
      move: priceMove
    };
  };

  // Use GARCH for short-term, realized for medium-term
  // For today's range, use opening price as the base
  const ranges = {
    intraday: calculatePriceRange(volatility.garchForecast || 15, 0.25, openPrice), // Use opening price for today's range
    oneDay: calculatePriceRange(volatility.garchForecast || 15, 1),
    fiveDay: calculatePriceRange(volatility.garchForecast || 15, 5),
    oneMonth: calculatePriceRange(volatility.realized || 18, 22),
  };

  const formatPrice = (price: number) => `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center">
        <span className="mr-2">📊</span>
        Expected Price Ranges (95% Confidence)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Today's Range */}
        <div className="bg-orange-900/20 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-orange-400 mb-2">Today's Range</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">High</span>
              <span className="text-sm font-bold text-green-400">{formatPrice(ranges.intraday.upper)}</span>
            </div>
            <div className="relative h-8 bg-gray-700 rounded">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full mx-2 h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded"></div>
                <div className="absolute w-1 h-4 bg-white" style={{
                  left: '50%',
                  transform: 'translateX(-50%)'
                }}></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Low</span>
              <span className="text-sm font-bold text-red-400">{formatPrice(ranges.intraday.lower)}</span>
            </div>
            <div className="text-center mt-2 pt-2 border-t border-gray-700">
              <span className="text-xs text-gray-400">Expected Range: </span>
              <span className="text-sm font-bold text-yellow-400">±{formatPrice(ranges.intraday.move)}</span>
            </div>
          </div>
        </div>

        {/* 1-Day Range */}
        <div className="bg-blue-900/20 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-400 mb-2">Tomorrow</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Upper</span>
              <span className="text-sm font-bold text-green-400">{formatPrice(ranges.oneDay.upper)}</span>
            </div>
            <div className="relative h-8 bg-gray-700 rounded">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full mx-2 h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded"></div>
                <div className="absolute w-1 h-4 bg-white" style={{
                  left: '50%',
                  transform: 'translateX(-50%)'
                }}></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Lower</span>
              <span className="text-sm font-bold text-red-400">{formatPrice(ranges.oneDay.lower)}</span>
            </div>
            <div className="text-center mt-2 pt-2 border-t border-gray-700">
              <span className="text-xs text-gray-400">Expected Move: </span>
              <span className="text-sm font-bold text-yellow-400">±{formatPrice(ranges.oneDay.move)}</span>
            </div>
          </div>
        </div>

        {/* 5-Day Range */}
        <div className="bg-green-900/20 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-green-400 mb-2">Next Week</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Upper</span>
              <span className="text-sm font-bold text-green-400">{formatPrice(ranges.fiveDay.upper)}</span>
            </div>
            <div className="relative h-8 bg-gray-700 rounded">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full mx-2 h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded"></div>
                <div className="absolute w-1 h-4 bg-white" style={{
                  left: '50%',
                  transform: 'translateX(-50%)'
                }}></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Lower</span>
              <span className="text-sm font-bold text-red-400">{formatPrice(ranges.fiveDay.lower)}</span>
            </div>
            <div className="text-center mt-2 pt-2 border-t border-gray-700">
              <span className="text-xs text-gray-400">Expected Move: </span>
              <span className="text-sm font-bold text-yellow-400">±{formatPrice(ranges.fiveDay.move)}</span>
            </div>
          </div>
        </div>

        {/* Monthly Range */}
        <div className="bg-purple-900/20 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-purple-400 mb-2">Next Month</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Upper</span>
              <span className="text-sm font-bold text-green-400">{formatPrice(ranges.oneMonth.upper)}</span>
            </div>
            <div className="relative h-8 bg-gray-700 rounded">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full mx-2 h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded"></div>
                <div className="absolute w-1 h-4 bg-white" style={{
                  left: '50%',
                  transform: 'translateX(-50%)'
                }}></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Lower</span>
              <span className="text-sm font-bold text-red-400">{formatPrice(ranges.oneMonth.lower)}</span>
            </div>
            <div className="text-center mt-2 pt-2 border-t border-gray-700">
              <span className="text-xs text-gray-400">Expected Move: </span>
              <span className="text-sm font-bold text-yellow-400">±{formatPrice(ranges.oneMonth.move)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-700/30 rounded">
        <p className="text-xs text-gray-400">
          <span className="font-semibold">Note:</span> Price ranges are calculated using 2-sigma (95% confidence interval) 
          based on current volatility forecasts. Today's range is calculated from the opening price to show expected intraday movement. 
          Actual prices may move beyond these ranges during extreme market conditions.
        </p>
      </div>
    </div>
  );
};

export default PriceVolatilityRanges;
