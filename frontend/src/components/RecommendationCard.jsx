import React, { useState } from 'react';
import { Leaf, Car, Home, Zap, CheckCircle, Loader2 } from 'lucide-react';
import { logImpact } from '../services/api';

const categoryConfig = {
  health: { color: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800', iconColor: 'text-green-600', badgeColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  transport: { color: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800', iconColor: 'text-blue-600', badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  indoor: { color: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800', iconColor: 'text-amber-600', badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  energy: { color: 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800', iconColor: 'text-purple-600', badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
};

const categoryIcons = {
  health: Leaf,
  transport: Car,
  indoor: Home,
  energy: Zap,
};

export default function RecommendationCard({
  icon,
  title,
  description,
  impactEstimate,
  category = 'health',
  actionType,
  co2Saved,
}) {
  const [logged, setLogged] = useState(false);
  const [logging, setLogging] = useState(false);

  const config = categoryConfig[category] || categoryConfig.health;
  const FallbackIcon = categoryIcons[category] || Leaf;
  const IconComponent = icon || FallbackIcon;

  const handleLogAction = async () => {
    setLogging(true);
    try {
      await logImpact({
        action_type: actionType || title.toLowerCase().replace(/\s+/g, '_'),
        description: title,
        co2_saved_kg: co2Saved || 0,
        pm25_avoided_ug: 0,
      });
      setLogged(true);
    } catch (err) {
      console.error('Failed to log action:', err);
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className={`rounded-xl border p-4 ${config.color} transition-all duration-200 hover:shadow-md animate-fade-in`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${config.badgeColor}`}>
          <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{title}</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>

          {impactEstimate && (
            <span className={`inline-block mt-2 badge ${config.badgeColor}`}>
              🌍 {impactEstimate}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-600/30">
        {logged ? (
          <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-xs font-medium">
            <CheckCircle className="w-4 h-4" />
            Action logged!
          </div>
        ) : (
          <button
            onClick={handleLogAction}
            disabled={logging}
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors disabled:opacity-50"
          >
            {logging ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Logging...
              </>
            ) : (
              'Log this action →'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
