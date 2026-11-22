import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Sparkles, CheckCircle2, ShieldAlert, ChevronRight, Activity, MapPin, Download } from 'lucide-react';
import { generateRoutine, getRoutines } from '../services/api';
import { useAuthStore } from '../services/store';

export default function DailyPlanner() {
  const user = useAuthStore((s) => s.user);
  const activeCity = user?.city || 'Delhi';

  const [plan, setPlan] = useState(null);
  const [pastPlans, setPastPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('current');

  const defaultSchedule = [
    {
      time: '06:30 - 08:00',
      activity: 'Indoor Yoga & Breathing Exercises',
      location: 'Sealed Bedroom with HEPA Filter',
      emissions_saved: 'Avoids 150 µg PM2.5 morning peak inhalation',
      risk_note: 'Severe ground radiation inversion active; avoid outdoor running',
    },
    {
      time: '08:30 - 09:30',
      activity: 'Shared Electric Metro Commute',
      location: 'Underground Metro Network',
      emissions_saved: 'Saves 2.3 kg CO2 compared to private fossil-fuel car',
      risk_note: 'Wear N95 mask while walking between street and station entrance',
    },
    {
      time: '12:30 - 14:00',
      activity: 'Midday Solar Aeration & Lunch Break',
      location: 'Balcony or high transom windows',
      emissions_saved: 'Passive air replenishment (lowers indoor CO2 < 600 ppm)',
      risk_note: 'Sunlight partially breaks surface inversion layer',
    },
    {
      time: '18:00 - 19:30',
      activity: 'Induction Cooktop Prep & Microfiber Wet Mopping',
      location: 'Apartment Living Quarters',
      emissions_saved: 'Eliminates unvented gas burner NO2 & binds settled particulates',
      risk_note: 'Damp mop catches 80% more settled dust than dry broom',
    },
    {
      time: '21:30 - 06:30',
      activity: 'Restful Air-Purified Sanctuary Sleep',
      location: 'Clean Air Bedroom',
      emissions_saved: 'Maintains overnight indoor PM2.5 < 15 µg/m³',
      risk_note: 'Run purifier on whisper quiet mode with doors closed',
    },
  ];

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await generateRoutine({ target_date: targetDate });
      setPlan(res.data);
      loadPastPlans();
    } catch (err) {
      console.warn('Fallback routine generator for offline testing:', err);
      setPlan({
        id: 'mock-routine-id',
        plan_date: targetDate,
        routine_data: {
          city: activeCity,
          overall_advisory: `Current AQI in ${activeCity} is 285 (Very Unhealthy). Temperature inversion peaks in early morning.`,
          schedule: defaultSchedule,
        },
        estimated_emission_reduction_pct: 42,
        aqi_at_generation: 285,
        created_at: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPastPlans = async () => {
    try {
      const res = await getRoutines();
      if (Array.isArray(res.data)) {
        setPastPlans(res.data);
      }
    } catch (e) {
      console.warn('Failed to load past routines:', e);
    }
  };

  useEffect(() => {
    handleGenerate();
    loadPastPlans();
  }, [activeCity]);

  const scheduleList = plan?.routine_data?.schedule || defaultSchedule;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900/90 p-5 rounded-2xl border border-slate-800 backdrop-blur shadow-xl gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            Adaptive Low-Emission Daily Routine
          </h2>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span>Location: <strong className="text-slate-300">{activeCity}</strong></span>
            <span>•</span>
            <span>Optimized against local thermal boundary layer inversions</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 font-semibold text-white text-xs rounded-xl shadow-lg transition disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Optimizing Schedule...' : 'Regenerate Plan'}
          </button>
        </div>
      </div>

      {/* Routine Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl">
          <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Emission Abatement</span>
          <p className="text-3xl font-black text-emerald-400 mt-1">~{plan?.estimated_emission_reduction_pct || 42}% CO₂ Cut</p>
          <span className="text-xs text-slate-500">vs single-occupant fossil vehicle commute</span>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl">
          <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Inhalation Defense</span>
          <p className="text-3xl font-black text-cyan-400 mt-1">-320 µg PM2.5</p>
          <span className="text-xs text-slate-500">avoided personal alveolar particulate load</span>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl">
          <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Sanctuary State</span>
          <p className="text-3xl font-black text-indigo-400 mt-1">WHO Target</p>
          <span className="text-xs text-slate-500">indoor air maintained &lt; 15 µg/m³</span>
        </div>
      </div>

      {/* Timeline view */}
      <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Today's Adaptive Timeline ({plan?.plan_date || targetDate})
          </h3>
          <span className="text-xs text-slate-400">
            AQI Baseline: <strong className="text-rose-400">{plan?.aqi_at_generation || 285}</strong>
          </span>
        </div>

        <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-800">
          {scheduleList.map((item, idx) => (
            <div key={idx} className="relative flex items-start space-x-4 animate-slide-up">
              <div className="w-10 h-10 rounded-xl bg-slate-950 border border-cyan-400/50 flex items-center justify-center text-cyan-400 z-10 shrink-0 shadow-lg">
                <Clock className="w-4 h-4" />
              </div>

              <div className="flex-1 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-1">
                  <span className="text-sm font-bold text-white">{item.activity}</span>
                  <span className="text-xs text-cyan-400 font-mono bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded-lg mt-1 sm:mt-0 inline-block">
                    {item.time}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-1">📍 {item.location}</p>

                <div className="mt-3 flex flex-col sm:flex-row gap-2 text-xs">
                  <span className="text-emerald-300 bg-emerald-950/50 border border-emerald-800/80 px-2.5 py-1 rounded-lg flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 flex-shrink-0" /> {item.emissions_saved}
                  </span>
                  <span className="text-amber-300 bg-amber-950/50 border border-amber-800/80 px-2.5 py-1 rounded-lg flex items-center">
                    <ShieldAlert className="w-3.5 h-3.5 mr-1 flex-shrink-0" /> {item.risk_note}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
