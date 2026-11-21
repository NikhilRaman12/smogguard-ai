import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Area,
  AreaChart,
} from 'recharts';
import { format, parseISO } from 'date-fns';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-3 text-xs">
      <p className="font-semibold text-slate-900 dark:text-white mb-1">
        {label}
      </p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-500 dark:text-slate-400">{entry.name}:</span>
          <span className="font-medium text-slate-900 dark:text-white">
            {entry.value?.toFixed(1)} μg/m³
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ForecastChart({ forecastData = [] }) {
  const data = forecastData.map((d) => ({
    ...d,
    date: typeof d.date === 'string' && d.date.includes('T')
      ? format(parseISO(d.date), 'MMM d')
      : d.date,
  }));

  if (data.length === 0) {
    return (
      <div className="card flex items-center justify-center h-64 text-slate-400 dark:text-slate-500">
        <p className="text-sm">No forecast data available</p>
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.max || d.avg || 0), 100);

  return (
    <div className="card animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          PM2.5 Forecast
        </h3>
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            Good
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            Moderate
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            Unhealthy
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-slate-800" />

          {/* AQI zones */}
          <ReferenceArea y1={0} y2={50} fill="#00e400" fillOpacity={0.05} />
          <ReferenceArea y1={50} y2={100} fill="#ffff00" fillOpacity={0.05} />
          <ReferenceArea y1={100} y2={maxVal + 20} fill="#ff0000" fillOpacity={0.05} />

          {/* WHO guideline */}
          <ReferenceLine
            y={15}
            stroke="#10b981"
            strokeDasharray="6 3"
            strokeWidth={1.5}
            label={{
              value: 'WHO Guideline (15)',
              position: 'insideTopRight',
              style: { fontSize: 10, fill: '#10b981', fontWeight: 600 },
            }}
          />

          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            domain={[0, maxVal + 20]}
          />
          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey="max"
            stroke="transparent"
            fill="#6366f1"
            fillOpacity={0.08}
            name="Max"
          />
          <Area
            type="monotone"
            dataKey="avg"
            stroke="#6366f1"
            strokeWidth={2.5}
            fill="url(#forecastGradient)"
            name="Average"
            dot={{ r: 4, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="min"
            stroke="#94a3b8"
            strokeWidth={1}
            strokeDasharray="4 4"
            dot={false}
            name="Min"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
