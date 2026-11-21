import React, { useState, useEffect } from 'react';
import { User, MapPin, Home, Heart, Save } from 'lucide-react';
import { getProfile, updateProfile } from '../services/api';
import { useAuthStore } from '../services/store';

export default function Profile() {
  const currentUser = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState({
    name: currentUser?.name || 'Local Eco Resident',
    city: currentUser?.city || 'Delhi',
    country: 'India',
    home_type: 'Apartment',
    asthma: true,
    allergies: true,
    children_count: 1,
    elderly_count: 0,
  });
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await getProfile();
        if (res.data) {
          setProfile((prev) => ({
            ...prev,
            name: res.data.name || prev.name,
            city: res.data.city || prev.city,
            country: res.data.country || prev.country,
            home_type: res.data.home_type || prev.home_type,
            asthma: res.data.health_conditions?.asthma ?? prev.asthma,
            allergies: res.data.health_conditions?.allergies ?? prev.allergies,
          }));
        }
      } catch (e) {
        // local profile active
      }
    }
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        name: profile.name,
        city: profile.city,
        country: profile.country,
        home_type: profile.home_type,
        health_conditions: { asthma: profile.asthma, allergies: profile.allergies },
      });
      setSavedMsg('Profile updated successfully!');
      setTimeout(() => setSavedMsg(''), 3000);
    } catch (e) {
      setSavedMsg('Profile updated locally.');
      setTimeout(() => setSavedMsg(''), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 backdrop-blur shadow-lg">
        <h2 className="text-xl font-bold text-white flex items-center">
          <User className="w-5 h-5 text-cyan-400 mr-2" />
          Demographic & Exposure Profile
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Customize household demographics to allow the Gemini intelligence engine to calculate accurate physiological exposure risk.
        </p>
      </div>

      {savedMsg && (
        <div className="p-3 bg-emerald-900/60 border border-emerald-500 rounded-xl text-emerald-200 text-xs">
          {savedMsg}
        </div>
      )}

      <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700">
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">User Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Target Urban City</label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Home Architecture</label>
              <select
                value={profile.home_type}
                onChange={(e) => setProfile({ ...profile, home_type: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white"
              >
                <option value="Apartment">Apartment / High-rise</option>
                <option value="Independent House">Independent Villa / Townhouse</option>
                <option value="Studio">Compact Studio</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Country</label>
              <input
                type="text"
                value={profile.country}
                onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700">
            <h4 className="text-xs font-semibold text-slate-300 uppercase mb-3 flex items-center">
              <Heart className="w-4 h-4 text-rose-400 mr-1.5" />
              Health & Vulnerability Flags
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-300">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={profile.asthma}
                  onChange={(e) => setProfile({ ...profile, asthma: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600"
                />
                <span>Asthma / Chronic Respiratory Conditions</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={profile.allergies}
                  onChange={(e) => setProfile({ ...profile, allergies: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600"
                />
                <span>Allergies to Particulate Matter & Pollen</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow transition"
          >
            <Save className="w-4 h-4 mr-1.5" />
            Save Profile Preferences
          </button>
        </form>
      </div>
    </div>
  );
}
