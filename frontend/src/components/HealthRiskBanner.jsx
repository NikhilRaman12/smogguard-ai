import React, { useState } from 'react';
import { Shield, AlertTriangle, AlertOctagon, ChevronDown, ChevronUp, Heart } from 'lucide-react';

const riskConfig = {
  Low: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-800 dark:text-green-300',
    icon: Shield,
    iconBg: 'bg-green-100 dark:bg-green-900/40',
    iconColor: 'text-green-600 dark:text-green-400',
    pulse: false,
  },
  Moderate: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-800 dark:text-yellow-300',
    icon: AlertTriangle,
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/40',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    pulse: false,
  },
  High: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800',
    text: 'text-orange-800 dark:text-orange-300',
    icon: AlertTriangle,
    iconBg: 'bg-orange-100 dark:bg-orange-900/40',
    iconColor: 'text-orange-600 dark:text-orange-400',
    pulse: true,
  },
  'Very High': {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-800 dark:text-red-300',
    icon: AlertOctagon,
    iconBg: 'bg-red-100 dark:bg-red-900/40',
    iconColor: 'text-red-600 dark:text-red-400',
    pulse: true,
  },
  Severe: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    border: 'border-red-300 dark:border-red-700',
    text: 'text-red-900 dark:text-red-200',
    icon: AlertOctagon,
    iconBg: 'bg-red-200 dark:bg-red-900/50',
    iconColor: 'text-red-700 dark:text-red-300',
    pulse: true,
  },
};

export default function HealthRiskBanner({
  riskLevel = 'Low',
  riskScore = 0,
  description = '',
  recommendations = [],
}) {
  const [expanded, setExpanded] = useState(false);
  const config = riskConfig[riskLevel] || riskConfig.Low;
  const IconComponent = config.icon;

  return (
    <div
      className={`w-full rounded-xl border ${config.bg} ${config.border} p-4 md:p-5 transition-all duration-300 animate-fade-in`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`relative flex-shrink-0 p-2.5 rounded-xl ${config.iconBg}`}>
          <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
          {config.pulse && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className={`text-lg font-bold ${config.text}`}>
              {riskLevel} Health Risk
            </h3>
            <span className={`badge ${config.bg} ${config.text} border ${config.border}`}>
              Score: {riskScore}/100
            </span>
          </div>

          <p className={`text-sm ${config.text} opacity-80 leading-relaxed`}>
            {description || 'No additional health risk information available.'}
          </p>

          {/* Expandable recommendations */}
          {recommendations.length > 0 && (
            <div className="mt-3">
              <button
                onClick={() => setExpanded(!expanded)}
                className={`flex items-center gap-1.5 text-sm font-medium ${config.text} hover:opacity-80 transition-opacity`}
              >
                <Heart className="w-4 h-4" />
                {expanded ? 'Hide' : 'View'} Recommendations ({recommendations.length})
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {expanded && (
                <ul className="mt-2 space-y-1.5 animate-fade-in">
                  {recommendations.map((rec, i) => (
                    <li
                      key={i}
                      className={`flex items-start gap-2 text-sm ${config.text} opacity-90`}
                    >
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
