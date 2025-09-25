export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: string;
  marketCap?: number;
  pe_ratio?: number;
  week52High?: number;
  week52Low?: number;
}

export interface VolatilityData {
  realizedVolatility: number;
  impliedVolatility?: number;
  volatilityTrend: string;
  atr14: number;
  parkinsonEstimator: number;
  garmanKlassEstimator: number;
  garchForecast: number;
  timestamp: string;
}

export interface Signal {
  id?: number;
  type: string;
  strength: number;
  message: string;
  timestamp: string;
  price?: number;
  indicator?: string;
}

export interface HARParams {
  daily: number;
  weekly: number;
  monthly: number;
  intercept: number;
  r_squared: number;
  mse: number;
  forecast_1d: number;
  forecast_5d: number;
  forecast_22d: number;
  timestamp: string;
}

export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  volatility?: number;
}
