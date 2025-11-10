import React, { useState, useEffect } from 'react';
import type { TideData, TideAlert, TideAlertConfig } from '../types';
import { IndonesiaMap } from './IndonesiaMap';

// A list of cities for which we will generate tide data
const CITIES_DATA = [
  { name: 'Jakarta', x: 355, y: 460 },
  { name: 'Surabaya', x: 510, y: 465 },
  { name: 'Medan', x: 220, y: 190 },
  { name: 'Makassar', x: 670, y: 400 },
  { name: 'Denpasar', x: 585, y: 472 },
  { name: 'Semarang', x: 440, y: 450 },
];

const CITIES = CITIES_DATA.map(c => c.name);

/**
 * Generates pseudo-random but deterministic tide data for a given city and date.
 * This simulates fetching new data when the user changes the date.
 * @param city The name of the city.
 * @param date The selected date.
 * @returns A TideData object for the city and date.
 */
const generateTideDataForDate = (city: string, date: Date): TideData => {
  // Use date components and city name to create a predictable seed
  const seed = date.getDate() + date.getMonth() * 31 + city.charCodeAt(0) + (city.charCodeAt(1) || 0);

  const statusOptions: TideData['status'][] = ['Rising', 'Falling', 'High', 'Low'];
  const status = statusOptions[seed % 4];

  const height = parseFloat((0.8 + ((seed * 17) % 18) / 10).toFixed(1)); // Height between 0.8 and 2.5m

  const nextHighHour = (seed * 7) % 12 + 12; // PM hours
  const nextHighMin = (seed * 13) % 60;
  const nextHigh = `${String(nextHighHour).padStart(2, '0')}:${String(nextHighMin).padStart(2, '0')}`;

  const nextLowHour = (seed * 3) % 10 + 1; // AM hours
  const nextLowMin = (seed * 19) % 60;
  const nextLow = `${String(nextLowHour).padStart(2, '0')}:${String(nextLowMin).padStart(2, '0')}`;

  // Generate historical data
  const monthlyAvgHigh = parseFloat((2.0 + ((seed * 5) % 8) / 10).toFixed(1));
  const monthlyAvgLow = parseFloat((0.4 + ((seed * 3) % 5) / 10).toFixed(1));
  const past24h = Array.from({ length: 24 }, (_, i) => {
    const base = (monthlyAvgLow + monthlyAvgHigh) / 2;
    const amplitude = (monthlyAvgHigh - monthlyAvgLow) / 2;
    const sineWave = Math.sin(((i + (seed % 24)) / 24) * 2 * Math.PI - Math.PI / 2);
    const noise = (Math.random() - 0.5) * 0.2;
    const value = base + sineWave * amplitude + noise;
    return parseFloat(Math.max(0.1, value).toFixed(1));
  });

  return { city, status, height, nextHigh, nextLow, monthlyAvgHigh, monthlyAvgLow, past24h };
};

const getStatusColor = (status: TideData['status']) => {
  switch (status) {
    case 'High': return 'text-red-400';
    case 'Rising': return 'text-yellow-400';
    case 'Falling': return 'text-blue-400';
    case 'Low': return 'text-green-400';
    default: return 'text-gray-400';
  }
};

const TideChart: React.FC<{ data: number[] }> = ({ data }) => {
  const width = 300;
  const height = 100;
  const padding = 10;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data);
  const minVal = Math.min(...data);
  const valRange = maxVal - minVal > 0 ? maxVal - minVal : 1;

  const getX = (index: number) => padding + (index / (data.length - 1)) * chartWidth;
  const getY = (value: number) => height - padding - ((value - minVal) / valRange) * chartHeight;

  const pathData = data
    .map((val, i) => {
      const x = getX(i);
      const y = getY(val);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
  
  const areaPathData = `${pathData} L ${getX(data.length - 1).toFixed(2)} ${height - padding} L ${getX(0).toFixed(2)} ${height - padding} Z`;

  return (
    <div className="mt-2">
      <div className="relative bg-gray-700/30 dark:bg-gray-800/50 rounded-lg p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" aria-label="24-hour tide chart">
            <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(56, 189, 248, 0.5)" />
                    <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
                </linearGradient>
            </defs>
            <path d={areaPathData} fill="url(#areaGradient)" />
            <path d={pathData} fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
        <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
            <span>24h ago</span>
            <span>Now</span>
        </div>
      </div>
    </div>
  );
};

const AlertIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);


const TideCard: React.FC<{ 
  data: TideData; 
  isSelected: boolean; 
  onClick: () => void;
  alertConfig?: TideAlert;
  onAlertChange: (newAlert: TideAlert) => void;
  isAlertTriggered: boolean;
}> = ({ data, isSelected, onClick, alertConfig, onAlertChange, isAlertTriggered }) => {
  const isAlertEnabled = alertConfig?.enabled ?? false;
  const alertLevel = alertConfig?.level ?? 2.0;

  const handleEnabledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAlertChange({ enabled: e.target.checked, level: alertLevel });
  };

  const handleLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newLevel = parseFloat(e.target.value) || 0;
      onAlertChange({ enabled: isAlertEnabled, level: newLevel });
  };

  return (
    <div className={`bg-black bg-opacity-30 backdrop-blur-md rounded-xl shadow-lg border dark:bg-gray-900/40 transition-all duration-300 ${isAlertTriggered ? 'border-red-500 ring-2 ring-red-500 ring-opacity-75 animate-pulse' : 'border-white/20 dark:border-white/10'}`}>
      <button onClick={onClick} className="w-full p-4 text-left" aria-expanded={isSelected}>
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold flex items-center gap-2">
            {data.city}
            {isAlertEnabled && <AlertIcon className="w-5 h-5 text-yellow-400" title="Alert enabled"/>}
          </h3>
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${getStatusColor(data.status)}`}>{data.status}</span>
            <svg className={`w-6 h-6 transition-transform duration-300 ${isSelected ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>
      {isSelected && (
        <div className="px-4 pb-4 border-t border-white/10 dark:border-white/5 animate-fade-in-fast">
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-cyan-300">Current Height:</p>
              <p className="text-lg text-gray-200 dark:text-gray-300">{data.height} m</p>
            </div>
            <div>
              <p className="font-semibold text-cyan-300">Next High Tide:</p>
              <p className="text-lg text-gray-200 dark:text-gray-300">{data.nextHigh}</p>
            </div>
            <div>
              <p className="font-semibold text-cyan-300">Next Low Tide:</p>
              <p className="text-lg text-gray-200 dark:text-gray-300">{data.nextLow}</p>
            </div>
          </div>
          <hr className="my-4 border-white/10 dark:border-white/5" />
          <div>
            <h4 className="text-md font-semibold text-cyan-300 mb-2">Historical Overview</h4>
            <div className="grid grid-cols-2 gap-4 text-sm mb-2">
              <div>
                <p className="font-semibold text-gray-300 dark:text-gray-400">Monthly Avg High:</p>
                <p className="text-lg text-gray-200 dark:text-gray-300">{data.monthlyAvgHigh} m</p>
              </div>
              <div>
                <p className="font-semibold text-gray-300 dark:text-gray-400">Monthly Avg Low:</p>
                <p className="text-lg text-gray-200 dark:text-gray-300">{data.monthlyAvgLow} m</p>
              </div>
            </div>
            <p className="font-semibold text-gray-300 dark:text-gray-400 text-sm">Past 24 Hours:</p>
            <TideChart data={data.past24h} />
          </div>

          <hr className="my-4 border-white/10 dark:border-white/5" />

          <div>
            <h4 className="text-md font-semibold text-cyan-300 mb-3">Tide Level Alert</h4>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 bg-gray-700/30 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`alert-toggle-${data.city}`}
                    className="sr-only peer"
                    checked={isAlertEnabled}
                    onChange={handleEnabledChange}
                  />
                  <label
                    htmlFor={`alert-toggle-${data.city}`}
                    className="relative w-11 h-6 bg-gray-600 rounded-full cursor-pointer transition-colors peer-checked:bg-cyan-500"
                  >
                    <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></span>
                  </label>
                  <label htmlFor={`alert-toggle-${data.city}`} className="font-medium text-gray-200 dark:text-gray-300 cursor-pointer">
                      Enable Alert
                  </label>
              </div>
              <div className={`flex items-center gap-2 transition-opacity duration-300 ${isAlertEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                  <label htmlFor={`alert-level-${data.city}`} className="text-gray-300 dark:text-gray-400">
                      at
                  </label>
                  <input
                      type="number"
                      id={`alert-level-${data.city}`}
                      value={alertLevel}
                      onChange={handleLevelChange}
                      step="0.1"
                      min="0"
                      max="5"
                      disabled={!isAlertEnabled}
                      className="w-24 px-2 py-1 bg-gray-800 border border-gray-600 rounded-md text-white text-center focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:bg-gray-700"
                  />
                  <span className="text-gray-300 dark:text-gray-400">m</span>
              </div>
            </div>
            {isAlertTriggered && (
                <p className="mt-3 text-center text-red-400 font-bold text-sm animate-fade-in-fast">
                    ALERT: Critical tide level reached!
                </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function Tides() {
  const [selectedCity, setSelectedCity] = useState<string | null>(CITIES[0]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tideInfo, setTideInfo] = useState<TideData[]>([]);
  const [alerts, setAlerts] = useState<TideAlertConfig>({});

  useEffect(() => {
    try {
      const storedAlerts = localStorage.getItem('tideAlerts');
      if (storedAlerts) {
        setAlerts(JSON.parse(storedAlerts));
      }
    } catch (error) {
      console.error("Failed to parse tide alerts from localStorage", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tideAlerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    const newData = CITIES.map(city => generateTideDataForDate(city, selectedDate));
    setTideInfo(newData);
  }, [selectedDate]);

  const handleAlertChange = (city: string, newAlert: TideAlert) => {
    setAlerts(prev => ({
      ...prev,
      [city]: newAlert,
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Adding 'T00:00:00' ensures the date is parsed in the local timezone, preventing off-by-one day errors.
    const newDate = new Date(e.target.value + 'T00:00:00');
    setSelectedDate(newDate);
  };

  const handleSelectCity = (city: string) => {
    setSelectedCity(prev => (prev === city ? null : city));
  };
  
  // Formats a Date object into 'YYYY-MM-DD' string for the date input's value
  const dateToInputValue = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="p-4 mb-6 bg-black bg-opacity-30 backdrop-blur-md rounded-xl shadow-lg border border-white/20 dark:bg-gray-900/40 dark:border-white/10 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Tide Forecast for <span className="text-cyan-300 block sm:inline mt-1 sm:mt-0">{formatFullDate(selectedDate)}</span>
        </h2>
        <div>
            <label htmlFor="tide-date" className="sr-only">Change Date</label>
            <input
                type="date"
                id="tide-date"
                value={dateToInputValue(selectedDate)}
                onChange={handleDateChange}
                className="px-4 py-2 bg-gray-700 bg-opacity-50 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition dark:bg-gray-800 dark:border-gray-600"
            />
        </div>
      </div>

      <IndonesiaMap
        cities={CITIES_DATA}
        selectedCity={selectedCity}
        onCitySelect={handleSelectCity}
      />

      <div className="space-y-4">
        {tideInfo.map(data => {
            const alertConfig = alerts[data.city];
            const isAlertTriggered = alertConfig?.enabled && data.height >= alertConfig.level;
            
            return (
              <TideCard 
                key={data.city} 
                data={data} 
                isSelected={selectedCity === data.city}
                onClick={() => handleSelectCity(data.city)}
                alertConfig={alertConfig}
                onAlertChange={(newAlert) => handleAlertChange(data.city, newAlert)}
                isAlertTriggered={isAlertTriggered}
              />
            )
        })}
      </div>
    </div>
  );
}