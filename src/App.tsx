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

      // Fetch all data in parallel
      const [marketRes, volatilityRes, signalsRes, harRes, historicalRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/market/summary`),
        axios.get(`${API_BASE_URL}/volatility/indicators`),
        axios.get(`${API_BASE_URL}/signals/latest`),
        axios.get(`${API_BASE_URL}/models/har/SPY`),
        axios.get(`${API_BASE_URL}/market/historical`)
      ]);

      setMarketData(marketRes.data);
      setVolatilityData(volatilityRes.data);
      setSignals(signalsRes.data.signals || []);
      setHarParams(harRes.data);
      setHistoricalData(historicalRes.data.data || []);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
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
          <p className="text-sm text-gray-400 mt-2">Fetching real-time data from Alpha Vantage API</p>
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
            <span className="text-green-400">● LIVE DATA</span> - Powered by Alpha Vantage API | 
            Database: PostgreSQL (Neon) | Updates every 30 seconds during market hours
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
