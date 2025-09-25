import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  TooltipItem
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface HistoricalChartProps {
  data: any[];
}

const HistoricalChart: React.FC<HistoricalChartProps> = ({ data }) => {
  const chartRef = useRef<any>(null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4">Historical Price & Volatility</h2>
        <div className="text-center py-8 text-gray-400">
          <p>No historical data available</p>
        </div>
      </div>
    );
  }

  // Sort data by date and take last 30 days
  const sortedData = [...data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30);

  const chartData = {
    labels: sortedData.map(d => {
      const date = new Date(d.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        label: 'Close Price',
        data: sortedData.map(d => d.close),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        yAxisID: 'y',
        tension: 0.1,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 4,
      },
      {
        label: 'Volatility',
        data: sortedData.map(d => d.volatility || 0),
        borderColor: 'rgb(251, 146, 60)',
        backgroundColor: 'rgba(251, 146, 60, 0.1)',
        yAxisID: 'y1',
        tension: 0.1,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 4,
        hidden: false,
      }
    ]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'white',
          font: {
            size: 12
          },
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context: TooltipItem<'line'>) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.dataset.label === 'Close Price') {
                label += '$' + context.parsed.y.toFixed(2);
              } else {
                label += context.parsed.y.toFixed(4);
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.3)'
        },
        border: {
          display: false
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          font: {
            size: 11
          },
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: {
          color: 'rgba(75, 85, 99, 0.3)'
        },
        border: {
          display: false
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          font: {
            size: 11
          },
          callback: function(tickValue: any) {
            return '$' + tickValue.toFixed(0);
          }
        },
        title: {
          display: true,
          text: 'Price ($)',
          color: 'rgb(156, 163, 175)',
          font: {
            size: 12
          }
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false
        },
        border: {
          display: false
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          font: {
            size: 11
          },
          callback: function(tickValue: any) {
            return tickValue.toFixed(2);
          }
        },
        title: {
          display: true,
          text: 'Volatility',
          color: 'rgb(156, 163, 175)',
          font: {
            size: 12
          }
        }
      }
    }
  };

  // Calculate summary statistics
  const prices = sortedData.map(d => d.close);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const lastPrice = prices[prices.length - 1];
  const firstPrice = prices[0];
  const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100;

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Historical Price & Volatility</h2>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Period:</span>
            <span className="text-white font-semibold">30 Days</span>
          </div>
          <div className={`flex items-center space-x-1 ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            <span>{priceChange >= 0 ? '▲' : '▼'}</span>
            <span className="font-semibold">{Math.abs(priceChange).toFixed(2)}%</span>
          </div>
        </div>
      </div>

      <div className="h-64 md:h-80">
        <Line ref={chartRef} options={options} data={chartData} />
      </div>

      <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-700">
        <div className="text-center">
          <p className="text-xs text-gray-400">Min Price</p>
          <p className="text-sm font-bold text-white">${minPrice.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400">Max Price</p>
          <p className="text-sm font-bold text-white">${maxPrice.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400">Avg Price</p>
          <p className="text-sm font-bold text-white">${avgPrice.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400">Current</p>
          <p className="text-sm font-bold text-blue-400">${lastPrice.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default HistoricalChart;
