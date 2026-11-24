import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Droplet, 
  Volume2, 
  Flame, 
  MapPin, 
  ShieldAlert, 
  TrendingDown, 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  Sliders,
  DollarSign
} from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

export default function MunicipalIntelligence({ activeCity = 'Hyderabad' }) {
  const [wards, setWards] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [waterBodies, setWaterBodies] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('wards'); // wards | hotspots | water | interventions
  const [domainFilter, setDomainFilter] = useState('all');

  const fetchMunicipalData = async () => {
    setLoading(true);
    try {
      const [wardsRes, hotRes, waterRes, intRes] = await Promise.all([
        axios.get(`${API_BASE}/municipal/wards?city=${activeCity}`),
        axios.get(`${API_BASE}/municipal/hotspots?city=${activeCity}&domain=${domainFilter}`),
        axios.get(`${API_BASE}/municipal/water?city=${activeCity}`),
        axios.get(`${API_BASE}/municipal/interventions?city=${activeCity}`),
      ]);
      setWards(wardsRes.data.wards || []);
      setHotspots(hotRes.data.hotspots || []);
      setWaterBodies(waterRes.data.readings || []);
      setInterventions(intRes.data.programs || []);
    } catch (err) {
      console.warn('Failed to fetch live municipal intelligence, using resilient fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMunicipalData();
  }, [activeCity, domainFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Enterprise Municipal Command Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 p-6 md:p-8 backdrop-blur-2xl shadow-2xl">
        <div className="absolute top-0 right-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Urban Environmental Command Hub (India-First)
              </span>
              <span className="text-xs text-slate-400 font-mono">
                CPCB · TSPCB · India-WRIS · IMD
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Building2 className="w-7 h-7 text-cyan-400" />
              <span>{activeCity} Urban Environmental Intelligence</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Cross-domain environmental decision support for municipal corporations, industrial zones, hospital corridors, and residential ward associations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchMunicipalData}
              disabled={loading}
              className="flex items-center text-xs font-bold px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-xl shadow-lg shadow-cyan-500/20 transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Auditing...' : 'Refresh Telemetry'}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="relative z-10 flex flex-wrap gap-2 mt-6">
          {[
            { id: 'wards', label: 'Ward Vulnerability Index', icon: Layers, count: wards.length },
            { id: 'hotspots', label: 'Environmental Hotspots', icon: ShieldAlert, count: hotspots.length },
            { id: 'water', label: 'Lakes & Hydrological Quality', icon: Droplet, count: waterBodies.length },
            { id: 'interventions', label: 'Action Programs & CAPEX', icon: TrendingDown, count: interventions.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  active 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10' 
                    : 'bg-slate-950/40 text-slate-400 border border-white/5 hover:text-white hover:border-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                  active ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-white/10 text-slate-300'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: WARDS & ZONAL VULNERABILITY */}
      {activeTab === 'wards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          {wards.map((ward) => (
            <div 
              key={ward.ward_number}
              className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Ward #{ward.ward_number}
                    </span>
                    <span className="text-xs text-slate-400">{ward.zone_name} Zone</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">Vulnerability:</span>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                      ward.vulnerability_index > 0.7 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      ward.vulnerability_index > 0.4 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {Math.round(ward.vulnerability_index * 100)}%
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-1">
                  {ward.ward_name}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Primary Local Stressor: <strong className="text-slate-200">{ward.primary_stressor}</strong>
                </p>

                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/60 border border-white/5 mb-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Zonal AQI</span>
                    <span className="text-base font-bold text-cyan-400">{ward.aqi_index}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Active Hotspots</span>
                    <span className="text-base font-bold text-amber-400">{ward.active_hotspots}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span>Exposure: <strong className="text-slate-300">{ward.population_exposure}</strong></span>
                <span className="text-[11px] font-mono text-cyan-400">{ward.sensors.length} CAAQMS Nodes</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: HOTSPOTS */}
      {activeTab === 'hotspots' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Filter by Stress Domain:</span>
            {['all', 'air', 'water', 'noise', 'heat'].map((dom) => (
              <button
                key={dom}
                onClick={() => setDomainFilter(dom)}
                className={`text-xs px-3 py-1 rounded-lg uppercase font-bold transition ${
                  domainFilter === dom 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {dom}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hotspots.map((spot) => (
              <div 
                key={spot.id}
                className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider ${
                      spot.severity === 'critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      spot.severity === 'high' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}>
                      {spot.severity} {spot.domain} hotspot
                    </span>
                    <span className="text-xs font-mono text-slate-400">{spot.id}</span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2">
                    {spot.location_name}
                  </h3>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-2 mb-4 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Observed {spot.primary_pollutant}:</span>
                      <strong className="text-rose-400 font-mono text-sm">{spot.observed_value}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Regulatory Safe Limit:</span>
                      <strong className="text-emerald-400 font-mono">{spot.regulatory_limit}</strong>
                    </div>
                    <div className="pt-2 border-t border-white/5 text-slate-400">
                      <span>Source: <strong className="text-slate-200">{spot.source_origin}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-cyan-200 text-xs">
                  <strong className="block font-bold mb-1">Recommended Municipal Action:</strong>
                  {spot.recommended_action}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: WATER BODIES */}
      {activeTab === 'water' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
          {waterBodies.map((body, idx) => (
            <div 
              key={idx}
              className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {body.cpcb_class}
                  </span>
                  <span className="text-xs text-slate-400">{body.body_type}</span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">
                  {body.water_body_name}
                </h3>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-2 mb-4 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Water Quality Index:</span>
                    <strong className="text-cyan-400 text-sm font-bold">{body.water_quality_index} / 100</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Dissolved Oxygen (DO):</span>
                    <strong className="text-slate-200">{body.dissolved_oxygen_mgl} mg/L</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Bio Oxygen Demand (BOD):</span>
                    <strong className="text-amber-400">{body.bod_mgl} mg/L</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">pH:</span>
                    <strong className="text-slate-200">{body.ph}</strong>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/20 text-rose-300 text-xs mb-4">
                  <strong>Eutrophication Risk:</strong> {body.eutrophication_risk}
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 text-[11px] text-slate-500 flex justify-between">
                <span>{body.source}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: INTERVENTION ACTION PROGRAMS */}
      {activeTab === 'interventions' && (
        <div className="space-y-4 animate-fade-in">
          {interventions.map((prog) => (
            <div 
              key={prog.id}
              className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {prog.domain} program
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{prog.id}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300">
                    Status: {prog.status} ({prog.completion_pct}%)
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  {prog.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Target Zone: <strong className="text-slate-200">{prog.target_zone}</strong> · Objective: <strong className="text-emerald-400">-{prog.projected_reduction_pct}% {prog.target_metric}</strong>
                </p>
                <p className="text-xs text-slate-500 italic">
                  Evidence Base: {prog.evidence_base}
                </p>
              </div>

              <div className="flex items-center gap-6 text-right bg-slate-950/70 border border-white/5 px-5 py-4 rounded-2xl shrink-0 font-mono">
                <div>
                  <div className="text-sm font-bold text-white">₹{prog.capex_inr_lakhs} Lakhs</div>
                  <div className="text-[10px] uppercase text-slate-400 font-sans">CAPEX Budget</div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <div className="text-sm font-bold text-cyan-400">₹{prog.opex_inr_lakhs} Lakhs/yr</div>
                  <div className="text-[10px] uppercase text-slate-400 font-sans">OPEX Run-Rate</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
