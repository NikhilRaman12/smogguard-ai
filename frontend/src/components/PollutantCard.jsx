import React, { useState } from 'react';

function getBarColor(value, safeLimit) {
  const ratio = value / safeLimit;
  if (ratio <= 0.5) return 'bg-green-500';
  if (ratio <= 0.75) return 'bg-yellow-500';
  if (ratio <= 1) return 'bg-orange-500';
  return 'bg-red-500';
}

function getBarColorHex(value, safeLimit) {
  const ratio = value / safeLimit;
  if (ratio <= 0.5) return '#22c55e';
  if (ratio <= 0.75) return '#eab308';
  if (ratio <= 1) return '#f97316';
  return '#ef4444';
}

const healthInfo = {
  'PM2.5': 'Fine particulate matter. Penetrates deep into lungs and bloodstream. Major cause of respiratory and cardiovascular diseases.',
  'PM10': 'Coarse particulate matter. Irritates eyes, nose, and throat. Aggravates asthma and bronchitis.',
  'NO₂': 'Nitrogen dioxide. Inflames airways. High exposure increases susceptibility to respiratory infections.',
  'SO₂': 'Sulfur dioxide. Causes breathing difficulty, especially for those with asthma. Contributes to acid rain.',
  'O₃': 'Ground-level ozone. Triggers chest pain, coughing, and throat irritation. Worsens chronic lung diseases.',
  'CO': 'Carbon monoxide. Reduces oxygen delivery to organs. High concentrations cause dizziness and confusion.',
};

export default function PollutantCard({ name, value, unit = 'μg/m³', safeLimit, icon: Icon }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const fillPct = Math.min((value / safeLimit) * 100, 100);
  const isOver = value > safeLimit;

  return (
    <div
      className="card relative animate-fade-in"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Tooltip */}
      {showTooltip && healthInfo[name] && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-lg shadow-xl z-30">
          <div className="font-semibold mb-1">{name} Health Impact</div>
          <p className="text-slate-300 leading-relaxed">{healthInfo[name]}</p>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-700 rotate-45" />
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-slate-400" />}
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{name}</h3>
        </div>
        {isOver && (
          <span className="badge bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            Exceeds Limit
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-2xl font-bold text-slate-900 dark:text-white">
          {typeof value === 'number' ? value.toFixed(1) : value}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">{unit}</span>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
        Safe limit: {safeLimit} {unit}
      </p>

      {/* Bar */}
      <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor(value, safeLimit)}`}
          style={{ width: `${fillPct}%` }}
        />
      </div>

      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-slate-400">0</span>
        <span className="text-[10px] text-slate-400">{safeLimit}</span>
      </div>
    </div>
  );
}
