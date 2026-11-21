import React from 'react';
import {
  Thermometer,
  Droplets,
  Wind,
  CloudFog,
  AlertTriangle,
  Sun,
  Cloud,
  CloudRain,
} from 'lucide-react';

function getWeatherIcon(description) {
  const desc = (description || '').toLowerCase();
  if (desc.includes('rain')) return CloudRain;
  if (desc.includes('cloud') || desc.includes('overcast')) return Cloud;
  if (desc.includes('fog') || desc.includes('mist') || desc.includes('haze')) return CloudFog;
  return Sun;
}

function getSmogRiskColor(risk) {
  const r = (risk || '').toLowerCase();
  if (r === 'low') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  if (r === 'medium') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
  return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
}

export default function WeatherWidget({
  temperature,
  humidity,
  windSpeed,
  description,
  smogRisk,
  inversionWarning,
}) {
  const WeatherIcon = getWeatherIcon(description);

  return (
    <div className="card animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Weather
        </h3>
        {smogRisk && (
          <span className={`badge ${getSmogRiskColor(smogRisk)}`}>
            <CloudFog className="w-3 h-3 mr-1" />
            Smog: {smogRisk}
          </span>
        )}
      </div>

      {/* Temperature + Icon */}
      <div className="flex items-center gap-4 mb-4">
        <WeatherIcon className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
        <div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {temperature != null ? `${Math.round(temperature)}°C` : '—'}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
            {description || 'No data'}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 text-sm">
          <Droplets className="w-4 h-4 text-blue-500" />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Humidity</p>
            <p className="font-semibold text-slate-900 dark:text-white">
              {humidity != null ? `${humidity}%` : '—'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Wind className="w-4 h-4 text-teal-500" />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Wind</p>
            <p className="font-semibold text-slate-900 dark:text-white">
              {windSpeed != null ? `${windSpeed} m/s` : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Inversion warning */}
      {inversionWarning && (
        <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
            Temperature inversion detected — pollutants may be trapped near ground level
          </p>
        </div>
      )}
    </div>
  );
}
