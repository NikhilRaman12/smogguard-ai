import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  TrendingUp,
  Bell,
  User,
  Menu,
  X,
  Wind,
  ChevronDown,
  Shield,
  Search,
  Moon,
  Sun,
  AlertTriangle,
} from 'lucide-react';
import { useAuthStore, useAQIStore } from '../services/store';
import { getCurrentAQI } from '../services/api';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/assistant', icon: MessageSquare, label: 'AI Assistant' },
  { to: '/planner', icon: Calendar, label: 'Daily Planner' },
  { to: '/impact', icon: TrendingUp, label: 'Impact Tracker' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
  { to: '/profile', icon: User, label: 'Profile' },
];

function getAQIColor(aqi) {
  if (aqi <= 50) return 'bg-emerald-500 text-slate-950';
  if (aqi <= 100) return 'bg-amber-400 text-slate-950';
  if (aqi <= 150) return 'bg-orange-500 text-white';
  if (aqi <= 200) return 'bg-red-500 text-white';
  if (aqi <= 300) return 'bg-purple-600 text-white';
  return 'bg-rose-950 text-white';
}

function getAQILabel(aqi) {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'USG';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

const POPULAR_CITIES = [
  'Delhi',
  'Beijing',
  'Lahore',
  'Dhaka',
  'Mumbai',
  'Kolkata',
  'Chengdu',
  'Cairo',
  'London',
  'New York',
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [citySelectorOpen, setCitySelectorOpen] = useState(false);
  const [cityInput, setCityInput] = useState('');
  const [darkMode, setDarkMode] = useState(true);

  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const currentAQI = useAQIStore((s) => s.currentAQI);
  const setCurrentAQI = useAQIStore((s) => s.setCurrentAQI);

  const activeCity = user?.city || 'Delhi';

  useEffect(() => {
    if (activeCity) {
      getCurrentAQI(activeCity)
        .then((res) => setCurrentAQI(res.data))
        .catch(() => {});
    }
  }, [activeCity]);

  const handleCityChange = (newCity) => {
    if (!newCity || !newCity.trim()) return;
    const clean = newCity.trim();
    setUser({ ...user, city: clean });
    setCitySelectorOpen(false);
    setCityInput('');
    getCurrentAQI(clean)
      .then((res) => setCurrentAQI(res.data))
      .catch(() => {});
  };

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                SmogGuard <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">AI</span>
              </h1>
              <p className="text-[11px] text-slate-400">Urban Pollution Intelligence</p>
            </div>
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setSidebarOpen(false)}
              className="ml-auto lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick city selector pill */}
          <div className="px-4 pt-4">
            <button
              onClick={() => setCitySelectorOpen(!citySelectorOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 transition"
            >
              <div className="flex items-center gap-2 truncate">
                <Wind className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span className="truncate">{activeCity}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            </button>

            {/* City dropdown */}
            {citySelectorOpen && (
              <div className="mt-2 p-2 rounded-xl bg-slate-800 border border-slate-700 shadow-xl space-y-2 z-50 animate-fade-in">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCityChange(cityInput);
                  }}
                  className="flex gap-1"
                >
                  <input
                    type="text"
                    aria-label="Enter city name"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    placeholder="Enter city..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="submit"
                    className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
                  >
                    Go
                  </button>
                </form>
                <div className="text-[10px] uppercase font-semibold text-slate-400 px-1 pt-1">
                  Popular Hubs
                </div>
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto scrollbar-thin">
                  {POPULAR_CITIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => handleCityChange(c)}
                      className={`px-2 py-1 rounded text-[11px] transition ${
                        activeCity.toLowerCase() === c.toLowerCase()
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-slate-900/60 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav aria-label="Primary Navigation" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Inversion indicator in sidebar */}
          <div className="p-3 mx-3 mb-2 rounded-xl bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/30 text-amber-200">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">Winter Stagnation</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Thermal boundary inversion active. High particulate risk 06:00 - 10:00.
            </p>
          </div>

          {/* User card at bottom */}
          <div className="px-3 py-4 border-t border-slate-800">
            <NavLink
              to="/profile"
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800/80 transition"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-semibold text-xs shadow">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Urban Resident'}</p>
                <p className="text-[10px] text-slate-400 truncate">{activeCity} • Household</p>
              </div>
            </NavLink>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 lg:px-6 py-3 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation menu"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* City and AQI badge in header */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCitySelectorOpen(!citySelectorOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 transition"
              >
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                <span>{activeCity}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {currentAQI && (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${getAQIColor(
                    currentAQI.aqi
                  )}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  AQI {currentAQI.aqi} • {currentAQI.health_category || getAQILabel(currentAQI.aqi)}
                </span>
              )}
            </div>
          </div>

          {/* Right Header items */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Toggle theme appearance"
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle theme appearance"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 border border-slate-800 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:inline">{user?.name || 'Resident'}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1.5 w-48 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 py-1.5 z-50 animate-fade-in">
                    <NavLink
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800"
                    >
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      Household Profile
                    </NavLink>
                    <NavLink
                      to="/alerts"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800"
                    >
                      <Bell className="w-3.5 h-3.5 text-amber-400" />
                      Alert Settings
                    </NavLink>
                    <NavLink
                      to="/planner"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800"
                    >
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      Daily Planner
                    </NavLink>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
