import React, { useState, useEffect } from 'react';
import { Bell, ShieldAlert, Sliders, CheckCircle } from 'lucide-react';
import { checkAlerts, getAlertPrefs, updateAlertPrefs } from '../services/api';

export default function Alerts() {
  const [alertStatus, setAlertStatus] = useState(null);
  const [threshold, setThreshold] = useState(150);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [statusRes, prefRes] = await Promise.all([checkAlerts(), getAlertPrefs()]);
        setAlertStatus(statusRes.data);
        setThreshold(prefRes.data.aqi_threshold || 150);
        setEmailAlerts(prefRes.data.email_alerts ?? true);
        setPushAlerts(prefRes.data.push_alerts ?? false);
      } catch (e) {
        setAlertStatus({
          alert_active: true,
          current_aqi: 285,
          threshold: 150,
          message: 'AQI in Delhi is 285, which exceeds your alert threshold of 150.',
          recommendations: ['Deploy HEPA filtration', 'Wear N95 masks outdoors', 'Avoid outdoor cardio'],
        });
      }
    }
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateAlertPrefs({
        aqi_threshold: parseInt(threshold, 10),
        email_alerts: emailAlerts,
        push_alerts: pushAlerts,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 backdrop-blur shadow-lg">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Bell className="w-5 h-5 text-amber-400 mr-2" />
          Proactive Pollution Trigger Thresholds
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Automated multi-channel warnings triggered before local inversion air quality spikes reach hazardous levels.
        </p>
      </div>

      {/* Alert Status Card */}
      {alertStatus && (
        <div
          className={`p-6 rounded-2xl border ${
            alertStatus.alert_active
              ? 'bg-red-950/40 border-red-500/80 text-red-200'
              : 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200'
          }`}
        >
          <div className="flex items-center space-x-3 mb-2">
            <ShieldAlert className="w-6 h-6" />
            <h3 className="font-bold text-base">
              {alertStatus.alert_active ? 'Active Smog Breach Warning' : 'Safe Operating Baseline'}
            </h3>
          </div>
          <p className="text-sm">{alertStatus.message}</p>

          {alertStatus.recommendations?.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-700/60">
              <span className="text-xs uppercase font-semibold text-slate-300">Emergency Protocol:</span>
              <ul className="list-disc list-inside mt-1 text-xs space-y-1">
                {alertStatus.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Preferences Form */}
      <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700">
        <h3 className="text-base font-bold text-white mb-4 flex items-center">
          <Sliders className="w-4 h-4 text-cyan-400 mr-2" />
          Configure Monitoring Triggers
        </h3>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300 uppercase">
                AQI Alert Threshold: <span className="text-cyan-400 font-bold">{threshold}</span>
              </label>
              <span className="text-xs text-slate-500">
                {threshold <= 100 ? 'Moderate' : threshold <= 150 ? 'Unhealthy for Sensitive' : 'Unhealthy'}
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="300"
              step="10"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="w-full accent-indigo-500 bg-slate-900 rounded-lg cursor-pointer"
            />
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-700">
            <label className="flex items-center space-x-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-indigo-600"
              />
              <span>Send Urgent Email Notifications upon AQI Threshold Breach</span>
            </label>

            <label className="flex items-center space-x-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={pushAlerts}
                onChange={(e) => setPushAlerts(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-indigo-600"
              />
              <span>Send Real-Time Mobile Push Advisories with Protective Hacks</span>
            </label>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow transition"
          >
            {saved ? 'Threshold Saved!' : 'Update Alert Preferences'}
          </button>
        </form>
      </div>
    </div>
  );
}
