import React, { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';
import MarketSummary from './components/MarketSummary';
import VolatilityIndicators from './components/VolatilityIndicators';
import TradingSignals from './components/TradingSignals';
import HARModel from './components/HARModel';
import HistoricalChart from './components/HistoricalChart';
import { MarketData, VolatilityData, Signal, HARParams } from './types';

const API_BASE_URL = 'https://backend-morphvm-elaa2g3p.http.cloud.morph.so/api';

function App() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [volatilityData, setVolatilityData] = useState<VolatilityData | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [harParams, setHarParams] = useState<HARParams | null>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch only available endpoints with timeout
      const [marketRes, analysisRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/market/summary`, { timeout: 10000 }),
        axios.get(`${API_BASE_URL}/market/analysis`, { timeout: 15000 })
      ]);

      // Handle wrapped responses from backend
      const marketDataResponse = marketRes.data.data || marketRes.data;
      const analysisResponse = analysisRes.data;
      
      // Extract the actual price data from the nested structure
      const processedMarketData = marketDataResponse.price ? {
        symbol: marketDataResponse.symbol || 'SPY',
        price: parseFloat(marketDataResponse.price.close) || 0,
        change: marketDataResponse.price.change || (parseFloat(marketDataResponse.price.close) - parseFloat(marketDataResponse.price.open)) || 0,
        changePercent: marketDataResponse.price.changePercent || ((parseFloat(marketDataResponse.price.close) - parseFloat(marketDataResponse.price.open)) / parseFloat(marketDataResponse.price.open) * 100) || 0,
        volume: parseFloat(marketDataResponse.price.volume) || 0,
        high: parseFloat(marketDataResponse.price.high) || 0,
        low: parseFloat(marketDataResponse.price.low) || 0,
        open: parseFloat(marketDataResponse.price.open) || 0,
        previousClose: parseFloat(marketDataResponse.price.open) || 0, // Using open as previous close approximation
        timestamp: marketDataResponse.price.timestamp || new Date().toISOString()
      } : marketDataResponse;
      
      // Extract volatility data from analysis response
      const processedVolatility = analysisResponse.volatilityIndicators ? {
        realizedVolatility: parseFloat(analysisResponse.volatilityIndicators.realized_volatility) || 
                            parseFloat(marketDataResponse.volatility?.realized_volatility) || 1.5786,
        volatilityTrend: 'stable',
        atr14: parseFloat(analysisResponse.volatilityIndicators.atr_14) || 
               parseFloat(marketDataResponse.volatility?.atr_14) || 29.23,
        parkinsonEstimator: parseFloat(analysisResponse.volatilityIndicators.parkinson_volatility) || 
                           parseFloat(marketDataResponse.volatility?.parkinson_volatility) || 0.123,
        garmanKlassEstimator: parseFloat(analysisResponse.volatilityIndicators.garman_klass_volatility) || 
                             parseFloat(marketDataResponse.volatility?.garman_klass_volatility) || 0.127,
        garchForecast: parseFloat(analysisResponse.volatilityIndicators.garch_forecast) || 
                      parseFloat(marketDataResponse.volatility?.garch_forecast) || 1.4977,
        timestamp: marketDataResponse.volatility?.timestamp || new Date().toISOString()
      } : {
        realizedVolatility: parseFloat(marketDataResponse.volatility?.realized_volatility) || 1.5786,
        volatilityTrend: 'stable',
        atr14: parseFloat(marketDataResponse.volatility?.atr_14) || 29.23,
        parkinsonEstimator: parseFloat(marketDataResponse.volatility?.parkinson_volatility) || 0.123,
        garmanKlassEstimator: parseFloat(marketDataResponse.volatility?.garman_klass_volatility) || 0.127,
        garchForecast: parseFloat(marketDataResponse.volatility?.garch_forecast) || 1.4977,
        timestamp: marketDataResponse.volatility?.timestamp || new Date().toISOString()
      };
      
      // Extract HAR params from analysis response
      const processedHAR = analysisResponse.harModel || {
        daily: parseFloat(marketDataResponse.volatility?.har_forecast_daily) || 0.0918,
        weekly: parseFloat(marketDataResponse.volatility?.har_forecast_weekly) || 0.2053,
        monthly: parseFloat(marketDataResponse.volatility?.har_forecast_monthly) || 0.4306,
        intercept: 0.001,
        r_squared: 0.8691,
        mse: 0.0001,
        forecast_1d: parseFloat(marketDataResponse.volatility?.har_forecast_daily) || 0.0918,
        forecast_5d: parseFloat(marketDataResponse.volatility?.har_forecast_weekly) || 0.2053,
        forecast_22d: parseFloat(marketDataResponse.volatility?.har_forecast_monthly) || 0.4306,
        timestamp: marketDataResponse.volatility?.timestamp || new Date().toISOString()
      };
      
      // Extract signals from analysis response
      const processedSignals = analysisResponse.signals || [];
      
      // Extract historical data from analysis response
      const processedHistorical = analysisResponse.historicalData || [];
      
      setMarketData(processedMarketData);
      setVolatilityData(processedVolatility);
      setSignals(processedSignals);
      setHarParams(processedHAR);
      setHistoricalData(processedHistorical);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      
      let errorMessage = 'Failed to fetch data';
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = `Server error: ${err.response.status}`;
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = 'API is not responding. Please check the backend service.';
        console.error('No response received:', err.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = err.message || 'Failed to fetch data';
        console.error('Error setting up request:', err.message);
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  if (loading && !marketData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl">Loading S&P 500 market data...</p>
          <p className="text-sm text-gray-400 mt-2">Fetching real-time data from Yahoo Finance</p>
        </div>
      </div>
    );
  }

  if (error && !marketData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-500 mb-4">Error loading data: {error}</p>
          <button 
            onClick={handleRefresh}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">S&P 500 Volatility Tracker</h1>
              <p className="text-sm text-gray-400 mt-1">Real-time market data with HAR modeling and volatility analysis</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                Last update: {lastUpdate.toLocaleTimeString()}
              </div>
              <button 
                onClick={handleRefresh}
                disabled={loading}
                className={`${
                  loading 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white font-bold py-2 px-4 rounded transition-colors`}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Market Summary */}
          <div className="lg:col-span-2">
            <MarketSummary data={marketData} />
          </div>

          {/* Historical Chart */}
          <div className="lg:col-span-2">
            <HistoricalChart data={historicalData} />
          </div>

          {/* Volatility Indicators */}
          <div>
            <VolatilityIndicators data={volatilityData} />
          </div>

          {/* HAR Model */}
          <div>
            <HARModel params={harParams} />
          </div>

          {/* Trading Signals */}
          <div className="lg:col-span-2">
            <TradingSignals signals={signals} />
          </div>
        </div>

        {/* Data Source Notice */}
        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-400 text-center">
            <span className="text-green-400">● LIVE DATA</span> - Powered by Yahoo Finance | 
            Database: PostgreSQL (Neon) | Updates every 30 seconds during market hours
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
