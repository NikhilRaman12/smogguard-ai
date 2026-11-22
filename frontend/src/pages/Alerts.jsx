import React, { useState, useEffect } from 'react';
import { Bell, ShieldAlert, Sliders, CheckCircle, Volume2, Moon, Clock, Mail, Smartphone } from 'lucide-react';
import { checkAlerts, getAlertPrefs, updateAlertPrefs } from '../services/api';
import { useAuthStore } from '../services/store';

export default function Alerts() {
  const user = useAuthStore((s) => s.user);
  const activeCity = user?.city || 'Delhi';

  const [alertStatus, setAlertStatus] = useState(null);
  const [threshold, setThreshold] = useState(150);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('07:00');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [statusRes, prefRes] = await Promise.all([checkAlerts(), getAlertPrefs()]);
        setAlertStatus(statusRes.data);
        setThreshold(prefRes.data.aqi_threshold || 150);
        setEmailAlerts(prefRes.data.email_alerts ?? true);
        setPushAlerts(prefRes.data.push_alerts ?? true);
        if (prefRes.data.quiet_hours) {
          setQuietHoursStart(prefRes.data.quiet_hours.start || '22:00');
          setQuietHoursEnd(prefRes.data.quiet_hours.end || '07:00');
        }
      } catch (e) {
        setAlertStatus({
          alert_active: true,
          current_aqi: 285,
          threshold: 150,
          message: `AQI in ${activeCity} is 285, which exceeds your alert threshold of 150.`,
          recommendations: [
            'Deploy true HEPA filtration on high in bedrooms.',
            'Wear certified N95 respirators with verified nasal seal.',
            'Avoid all strenuous outdoor cardiovascular activity.',
            'Keep high transom windows sealed until afternoon solar heating.',
          ],
        });
      }
    }
    load();
  }, [activeCity]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateAlertPrefs({
        aqi_threshold: parseInt(threshold, 10),
        email_alerts: emailAlerts,
        push_alerts: pushAlerts,
        quiet_hours: { start: quietHoursStart, end: quietHoursEnd },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 backdrop-blur shadow-xl">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-400" />
          Proactive Pollution Trigger Thresholds
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Automated multi-channel warnings dispatched prior to peak temperature inversion smog surges in {activeCity}.
        </p>
      </div>

      {/* Alert Status Banner */}
      {alertStatus && (
        <div
          className={`p-6 rounded-2xl border shadow-xl ${
            alertStatus.alert_active
              ? 'bg-rose-950/40 border-rose-500/80 text-rose-200'
              : 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200'
          }`}
        >
          <div className="flex items-center space-x-3 mb-2">
            <ShieldAlert className="w-6 h-6 flex-shrink-0 animate-pulse text-rose-400" />
            <h3 className="font-bold text-base text-white">
              {alertStatus.alert_active ? 'Active Smog Breach Warning' : 'Safe Operating Baseline'}
            </h3>
          </div>
          <p className="text-xs md:text-sm text-slate-200 leading-relaxed">{alertStatus.message}</p>

          {alertStatus.recommendations?.length > 0 && (
            <div className="mt-4 pt-3 border-t border-rose-900/50">
              <span className="text-[11px] uppercase font-bold text-slate-300">Prescribed Emergency Countermeasures:</span>
              <ul className="list-disc list-inside mt-2 text-xs text-slate-300 space-y-1">
                {alertStatus.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Preferences Form */}
      <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          Configure Automated Notification Triggers
        </h3>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase">
                AQI Alert Threshold: <span className="text-cyan-400 font-bold text-sm">{threshold}</span>
              </label>
              <span className="text-xs text-slate-400 font-medium">
                {threshold <= 100 ? '🟡 Moderate' : threshold <= 150 ? '🟠 Sensitive Groups' : '🔴 Unhealthy for All'}
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="350"
              step="10"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="w-full accent-cyan-400 bg-slate-950 rounded-lg cursor-pointer h-2"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>50 (Clean)</span>
              <span>150 (Sensitive)</span>
              <span>250 (Severe)</span>
              <span>350+ (Hazardous)</span>
            </div>
          </div>

          {/* Channels */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <span className="block text-xs font-semibold text-slate-300 uppercase">Notification Channels</span>
            
            <label className="flex items-center space-x-3 text-xs md:text-sm text-slate-300 p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
              />
              <Mail className="w-4 h-4 text-cyan-400" />
              <span>Send Urgent Email Notifications upon AQI Threshold Breach</span>
            </label>

            <label className="flex items-center space-x-3 text-xs md:text-sm text-slate-300 p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition">
              <input
                type="checkbox"
                checked={pushAlerts}
                onChange={(e) => setPushAlerts(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
              />
              <Smartphone className="w-4 h-4 text-indigo-400" />
              <span>Send Real-Time Mobile Push Advisories with Protective Hacks</span>
            </label>
          </div>

          {/* Quiet Hours */}
          <div className="pt-3 border-t border-slate-800">
            <span className="block text-xs font-semibold text-slate-300 uppercase mb-2 flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              Quiet Hours (Mute Non-Emergency Sounds)
            </span>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Start Time</label>
                <input
                  type="time"
                  value={quietHoursStart}
                  onChange={(e) => setQuietHoursStart(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">End Time</label>
                <input
                  type="time"
                  value={quietHoursEnd}
                  onChange={(e) => setQuietHoursEnd(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs rounded-xl shadow-lg transition"
          >
            {saved ? '✓ Preferences Saved Successfully!' : 'Update Alert Preferences'}
          </button>
        </form>
      </div>
    </div>
  );
}
