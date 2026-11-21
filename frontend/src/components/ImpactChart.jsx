import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TreePine } from 'lucide-react';

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-3 text-xs">
      <p className="font-semibold text-slate-900 dark:text-white mb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-500">{entry.name}:</span>
          <span className="font-medium text-slate-900 dark:text-white">
            {entry.value?.toFixed(2)} kg
          </span>
        </div>
      ))}
    </div>
  );
}

function CumulativeTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-3 text-xs">
      <p className="font-semibold text-slate-900 dark:text-white mb-1">{label}</p>
      <p className="text-slate-600 dark:text-slate-400">
        Total: <span className="font-medium text-slate-900 dark:text-white">{payload[0]?.value?.toFixed(2)} kg CO₂</span>
      </p>
    </div>
  );
}

export default function ImpactChart({ impactData }) {
  const weeklyData = impactData?.weekly || [];
  const cumulativeData = impactData?.cumulative || [];
  const totalCO2 = impactData?.total_co2 || 0;

  // 1 tree absorbs ~22 kg CO₂ per year
  const treesEquivalent = (totalCO2 / 22).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Fun equivalency */}
      {totalCO2 > 0 && (
        <div className="card bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-xl">
              <TreePine className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-green-800 dark:text-green-300">
                You&apos;ve saved CO₂ equivalent to
              </p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-200">
                {treesEquivalent} trees absorbing for a year 🌳
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Weekly CO₂ Savings */}
      <div className="card">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
          Weekly CO₂ Savings
        </h3>
        {weeklyData.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
            Start logging actions to see your weekly impact
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="text-slate-100 dark:text-slate-800" stroke="currentColor" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<BarTooltip />} />
              <Bar
                dataKey="co2_saved"
                fill="#6366f1"
                radius={[6, 6, 0, 0]}
                name="CO₂ Saved"
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Cumulative Impact */}
      <div className="card">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
          Cumulative Impact
        </h3>
        {cumulativeData.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
            No cumulative data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={cumulativeData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="cumulativeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="text-slate-100 dark:text-slate-800" stroke="currentColor" />
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
              />
              <Tooltip content={<CumulativeTooltip />} />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 5, fill: '#10b981' }}
                name="Cumulative CO₂"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
