import React, { useState, useEffect } from 'react';

const CITIES = ['Jakarta', 'Surabaya', 'Medan', 'Makassar', 'Denpasar', 'Semarang'];

/**
 * Generates a pseudo-random but deterministic base water level for a given city and date.
 * @param city The name of the city.
 * @param date The selected date.
 * @returns A base water level percentage.
 */
const generateBaseWaterLevel = (city: string, date: Date): number => {
  // Use date components and city name to create a predictable seed
  const seed = date.getDate() + (date.getMonth() * 31) + date.getFullYear() + city.charCodeAt(0) + (city.charCodeAt(1) || 0);
  // Generate a base level between 10% and 90%
  const baseLevel = 10 + (seed % 81);
  return baseLevel;
};


const WaterLevelIndicator: React.FC<{ level: number }> = ({ level }) => {
  const height = `${level}%`;
  let bgColor = 'bg-cyan-400';
  let statusText = 'Normal';
  let textColor = 'text-cyan-900 dark:text-cyan-200';

  if (level > 75) {
    bgColor = 'bg-red-500 animate-pulse';
    statusText = 'DANGER';
    textColor = 'text-red-100';
  } else if (level > 50) {
    bgColor = 'bg-yellow-400';
    statusText = 'Warning';
    textColor = 'text-yellow-900 dark:text-yellow-200';
  }

  return (
    <div className="relative w-full h-80 rounded-lg bg-gray-700 bg-opacity-50 dark:bg-gray-800/60 border-4 border-gray-400 dark:border-gray-600 overflow-hidden shadow-2xl">
      <div
        className={`absolute bottom-0 left-0 right-0 ${bgColor} transition-all duration-1000 ease-in-out`}
        style={{ height }}
      ></div>
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        <span className={`text-6xl md:text-8xl font-black text-white drop-shadow-lg transition-all duration-500`}>
          {level.toFixed(1)}
          <span className="text-3xl md:text-5xl">%</span>
        </span>
        <span className={`mt-2 text-2xl md:text-4xl font-bold ${textColor} uppercase tracking-widest transition-all duration-500`}>
          {statusText}
        </span>
      </div>
    </div>
  );
};

const StatusLegend: React.FC = () => (
  <div className="w-full max-w-md p-4 bg-black bg-opacity-30 backdrop-blur-md rounded-xl shadow-lg border border-white/20 dark:bg-gray-900/40 dark:border-white/10">
    <h3 className="text-lg font-semibold mb-3 text-center">Status Legend</h3>
    <ul className="space-y-2 text-sm text-gray-200 dark:text-gray-300">
      <li className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full bg-cyan-400 border border-cyan-200"></div>
        <span><strong>Normal (0-50%):</strong> Safe water levels. No immediate action required.</span>
      </li>
      <li className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full bg-yellow-400 border border-yellow-200"></div>
        <span><strong>Warning (51-75%):</strong> Levels are elevated. Stay informed and be prepared.</span>
      </li>
      <li className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full bg-red-500 border border-red-200"></div>
        <span><strong>Danger (76-100%):</strong> Critical levels. Potential for flooding. Follow official advice.</span>
      </li>
    </ul>
  </div>
);

export default function Detector() {
  const [waterLevel, setWaterLevel] = useState(25);
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);

  useEffect(() => {
    // Generate a level based on the current date when city changes.
    const baseLevel = generateBaseWaterLevel(selectedCity, new Date());
    setWaterLevel(baseLevel); // Set initial level for the selected filters

    const interval = setInterval(() => {
      setWaterLevel(prevLevel => {
        // Fluctuate around the base level
        const change = (Math.random() - 0.5) * 4; // Smaller fluctuations for realism
        let newLevel = prevLevel + change;

        // Gently pull the level back towards the base if it strays too far
        if (Math.abs(newLevel - baseLevel) > 15) {
          newLevel = newLevel > baseLevel ? newLevel - 0.5 : newLevel + 0.5;
        }

        const clampedLevel = Math.max(0, Math.min(100, newLevel));
        return clampedLevel;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedCity]);
  
  return (
    <div className="flex flex-col items-center gap-8 animate-fade-in">

      <div className="w-full max-w-md p-4 bg-black bg-opacity-30 backdrop-blur-md rounded-xl shadow-lg border border-white/20 dark:bg-gray-900/40 dark:border-white/10">
        <h2 className="text-xl font-bold text-center mb-4">
          Water Level Detector
        </h2>
        <div>
            <label htmlFor="city-select" className="block text-sm font-medium text-gray-300 dark:text-gray-400 mb-1">City</label>
            <select
              id="city-select"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 bg-opacity-50 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition dark:bg-gray-800 dark:border-gray-600"
            >
              {CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
      </div>


      <div className="w-full max-w-md">
        <WaterLevelIndicator level={waterLevel} />
      </div>
      
      <StatusLegend />

      <div className="w-full max-w-2xl p-6 bg-black bg-opacity-30 backdrop-blur-md rounded-xl shadow-lg border border-white/20 dark:bg-gray-900/40 dark:border-white/10">
        <h2 className="text-2xl font-semibold mb-4 text-center">Detector Details</h2>
        <div className="flex flex-col md:flex-row gap-6 items-center">
            <img 
                src="https://picsum.photos/seed/detector/400/300"
                alt="Water Level Detector"
                className="w-48 h-auto rounded-lg shadow-md object-cover"
            />
            <div className="text-gray-200 dark:text-gray-300 text-center md:text-left text-sm space-y-2">
                <p>
                    This is a real-time simulation of the Aqua Sentinel detector unit. The device uses advanced ultrasonic sensors to accurately measure water levels with a margin of error of less than 2cm.
                </p>
                <p>
                    It is powered by a solar-rechargeable battery, ensuring continuous operation. Data is transmitted every 30 seconds via a secure cellular connection to our central servers, providing the instant updates you see above.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}