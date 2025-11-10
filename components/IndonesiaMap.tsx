import React, { useState, useRef, WheelEvent, MouseEvent } from 'react';

interface City {
  name: string;
  x: number;
  y: number;
}

interface IndonesiaMapProps {
  cities: City[];
  selectedCity: string | null;
  onCitySelect: (city: string) => void;
}

const MapMarker: React.FC<{ city: City; isSelected: boolean; onClick: () => void }> = ({ city, isSelected, onClick }) => {
  const markerClasses = isSelected
    ? 'fill-cyan-400 stroke-white'
    : 'fill-white/50 hover:fill-cyan-300 stroke-cyan-500/50 dark:fill-white/30 dark:hover:fill-cyan-400 dark:stroke-cyan-500/30';

  return (
    <g
      key={city.name}
      transform={`translate(${city.x}, ${city.y})`}
      onClick={onClick}
      className="cursor-pointer group"
      aria-label={`Select ${city.name}`}
    >
      <circle
        r={isSelected ? '10' : '7'}
        className={`transition-all duration-300 origin-center ${markerClasses} ${isSelected ? 'stroke-[3px]' : 'stroke-2 group-hover:scale-[1.2]'}`}
      />
      {isSelected && (
        <circle
          r="10"
          strokeWidth="1"
          className="fill-cyan-400 stroke-cyan-200 animate-pulse"
        />
      )}
      <text
        y="-15"
        textAnchor="middle"
        className={`text-sm fill-white font-semibold pointer-events-none transition-opacity duration-300 drop-shadow-lg ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
      >
        {city.name}
      </text>
    </g>
  );
};

const ResetIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
);

export const IndonesiaMap: React.FC<IndonesiaMapProps> = ({ cities, selectedCity, onCitySelect }) => {
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const startPointRef = useRef({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const MIN_SCALE = 1;
  const MAX_SCALE = 5;

  const handleResetView = () => {
    setTransform({ scale: 1, x: 0, y: 0 });
  };

  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

  const handleWheel = (e: WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    if (!svgRef.current) return;

    const svgRect = svgRef.current.getBoundingClientRect();
    const { deltaY } = e;
    const zoomFactor = deltaY < 0 ? 1.1 : 1 / 1.1;
    const newScale = clamp(transform.scale * zoomFactor, MIN_SCALE, MAX_SCALE);
    
    if (newScale === transform.scale) return;

    const mouseX = e.clientX - svgRect.left;
    const mouseY = e.clientY - svgRect.top;

    const svgPoint = {
      x: (mouseX - transform.x) / transform.scale,
      y: (mouseY - transform.y) / transform.scale,
    };
    
    const newX = mouseX - svgPoint.x * newScale;
    const newY = mouseY - svgPoint.y * newScale;

    // Bounding
    const boundXMin = Math.min(0, svgRect.width - 1000 * newScale);
    const boundYMin = Math.min(0, svgRect.height - 500 * newScale);
    
    const clampedX = clamp(newX, boundXMin, 0);
    const clampedY = clamp(newY, boundYMin, 0);

    setTransform({ scale: newScale, x: clampedX, y: clampedY });
  };

  const handleMouseDown = (e: MouseEvent<SVGSVGElement>) => {
    e.preventDefault();
    setIsPanning(true);
    startPointRef.current = {
      x: e.clientX - transform.x,
      y: e.clientY - transform.y,
    };
  };

  const handleMouseMove = (e: MouseEvent<SVGSVGElement>) => {
    if (!isPanning || !svgRef.current) return;
    e.preventDefault();
    
    const svgRect = svgRef.current.getBoundingClientRect();
    const newX = e.clientX - startPointRef.current.x;
    const newY = e.clientY - startPointRef.current.y;
    
    // Bounding
    const boundXMin = Math.min(0, svgRect.width - 1000 * transform.scale);
    const boundYMin = Math.min(0, svgRect.height - 500 * transform.scale);

    const clampedX = clamp(newX, boundXMin, 0);
    const clampedY = clamp(newY, boundYMin, 0);

    setTransform(prev => ({ ...prev, x: clampedX, y: clampedY }));
  };

  const handleMouseUpOrLeave = () => {
    setIsPanning(false);
  };

  return (
    <div className="relative w-full p-4 mb-6 bg-black bg-opacity-30 backdrop-blur-md rounded-xl shadow-lg border border-white/20 dark:bg-gray-900/40 dark:border-white/10 overflow-hidden">
      <h3 className="text-xl font-bold text-center mb-4">City Map (Scroll to Zoom, Drag to Pan)</h3>
      <button 
        onClick={handleResetView}
        className="absolute top-6 right-6 z-10 p-2 bg-black/40 rounded-full text-white hover:bg-black/60 hover:text-cyan-300 transition-colors"
        aria-label="Reset map view"
      >
        <ResetIcon className="w-6 h-6" />
      </button>
      <svg
        ref={svgRef}
        viewBox="0 0 1000 500"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-auto ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        aria-label="Map of Indonesia"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
      >
        <g transform={`translate(${transform.x} ${transform.y}) scale(${transform.scale})`}>
            <g className="fill-cyan-900 stroke-cyan-400 dark:fill-gray-700 dark:stroke-gray-500" strokeWidth={1 / transform.scale}>
                {/* Sumatra */}
                <path d="M85,305 C110,250 160,180 210,140 S260,100 280,70 L305,90 C280,140 235,210 180,260 L130,335 z">
                    <title>Sumatra</title>
                </path>
                {/* Java */}
                <path d="M315,455 C365,440 435,435 505,445 S565,460 575,465 L555,480 C485,470 385,465 325,470 z">
                    <title>Java</title>
                </path>
                {/* Bali */}
                <path d="M580,463 l10,2 l-2,10 l-10,-2 z">
                    <title>Bali</title>
                </path>
                {/* Lombok, Sumbawa, Flores (Lesser Sunda Islands) */}
                <path d="M595,467 l25,3 l-3,12 l-25,-3 z">
                    <title>Lombok</title>
                </path>
                <path d="M625,472 l30,2 l-4,15 l-30,-2 z">
                    <title>Sumbawa</title>
                </path>
                <path d="M660,475 l40,0 l-5,15 l-40,0 z">
                    <title>Flores</title>
                </path>
                {/* Kalimantan (Borneo) */}
                <path d="M320,370 C310,290 380,180 480,160 S610,170 630,230 L610,340 C560,390 430,410 370,390 z">
                    <title>Kalimantan (Borneo)</title>
                </path>
                {/* Sulawesi */}
                <path d="M640,410 L650,370 C670,330 670,290 650,260 L670,240 C710,240 740,270 750,310 L720,340 C740,370 730,400 700,410z M750,230 C770,190 810,170 840,190 L830,240z">
                    <title>Sulawesi</title>
                </path>
                {/* Maluku Islands */}
                <path d="M810,340 a10,15 0 1,1 0,1 Z"><title>Maluku Islands</title></path>
                <path d="M790,380 a15,20 0 1,1 0,1 Z"><title>Maluku Islands</title></path>
                <path d="M850,290 a12,8 0 1,1 0,1 Z"><title>Maluku Islands</title></path>
                {/* Papua */}
                <path d="M840,410 C840,340 870,270 970,240 L980,190 L890,170 C850,190 830,240 830,270 L870,340 z">
                    <title>Papua</title>
                </path>
            </g>

            {cities.map((city) => (
              <MapMarker
                key={city.name}
                city={city}
                isSelected={selectedCity === city.name}
                onClick={() => onCitySelect(city.name)}
              />
            ))}
        </g>
      </svg>
    </div>
  );
};