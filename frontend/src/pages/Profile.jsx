import React, { useState, useEffect } from 'react';
import { User, MapPin, Home, Heart, Save, Baby, Users, ShieldCheck } from 'lucide-react';
import { getProfile, updateProfile } from '../services/api';
import { useAuthStore } from '../services/store';

export default function Profile() {
  const currentUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [profile, setProfile] = useState({
    name: currentUser?.name || 'Local Eco Resident',
    city: currentUser?.city || 'Delhi',
    country: currentUser?.country || 'India',
    home_type: currentUser?.home_type || 'Apartment',
    asthma: true,
    allergies: true,
    heart_disease: false,
    has_children: true,
    has_elderly: false,
  });
  const [savedMsg, setSavedMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await getProfile();
        if (res.data) {
          const conditions = res.data.health_conditions || {};
          const family = res.data.family_members || [];
          setProfile({
            name: res.data.name || currentUser?.name || 'Local Eco Resident',
            city: res.data.city || currentUser?.city || 'Delhi',
            country: res.data.country || 'India',
            home_type: res.data.home_type || 'Apartment',
            asthma: conditions.asthma ?? true,
            allergies: conditions.allergies ?? true,
            heart_disease: conditions.heart_disease ?? false,
            has_children: family.some((m) => m.is_child) ?? true,
            has_elderly: family.some((m) => m.is_elderly) ?? false,
          });
        }
      } catch (e) {
        console.warn('Profile load fallback for offline mode:', e);
      }
    }
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: profile.name,
      city: profile.city,
      country: profile.country,
      home_type: profile.home_type,
      health_conditions: {
        asthma: profile.asthma,
        allergies: profile.allergies,
        heart_disease: profile.heart_disease,
      },
      family_members: [
        { is_child: profile.has_children, is_elderly: profile.has_elderly },
      ],
    };

    try {
      await updateProfile(payload);
      setUser({
        ...currentUser,
        name: profile.name,
        city: profile.city,
        country: profile.country,
        home_type: profile.home_type,
      });
      setSavedMsg('Profile and exposure risk factors updated successfully!');
      setTimeout(() => setSavedMsg(''), 4000);
    } catch (e) {
      setUser({
        ...currentUser,
        name: profile.name,
        city: profile.city,
        country: profile.country,
        home_type: profile.home_type,
      });
      setSavedMsg('Profile updated locally.');
      setTimeout(() => setSavedMsg(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 backdrop-blur shadow-xl">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-cyan-400" />
          Demographic & Physiological Vulnerability Profile
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Customize household demographics so the Gemini intelligence engine accurately evaluates pulmonary and cardiovascular exposure risk.
        </p>
      </div>

      {savedMsg && (
        <div className="p-3.5 bg-emerald-950/70 border border-emerald-500 rounded-xl text-emerald-200 text-xs font-semibold flex items-center justify-between animate-fade-in">
          <span>✅ {savedMsg}</span>
        </div>
      )}

      <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Basic info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs md:text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Target Urban City</label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs md:text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Dwelling Architecture</label>
              <select
                value={profile.home_type}
                onChange={(e) => setProfile({ ...profile, home_type: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs md:text-sm text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="Apartment">High-rise Apartment (Floor 5+)</option>
                <option value="Low-rise Flat">Low-rise Ground Flat (Higher street dust)</option>
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs md:text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Section 2: Clinical Vulnerability Flags */}
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-semibold text-slate-300 uppercase mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              Clinical Health & Pulmonary Vulnerability Flags
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs md:text-sm text-slate-300">
              <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={profile.asthma}
                  onChange={(e) => setProfile({ ...profile, asthma: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                />
                <span>Asthma / Bronchitis</span>
              </label>

              <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={profile.allergies}
                  onChange={(e) => setProfile({ ...profile, allergies: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                />
                <span>Dust & Aerosol Allergies</span>
              </label>

              <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={profile.heart_disease}
                  onChange={(e) => setProfile({ ...profile, heart_disease: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                />
                <span>Cardiovascular Condition</span>
              </label>
            </div>
          </div>

          {/* Section 3: Household composition */}
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-semibold text-slate-300 uppercase mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              Family Member Demographics
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs md:text-sm text-slate-300">
              <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={profile.has_children}
                  onChange={(e) => setProfile({ ...profile, has_children: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                />
                <Baby className="w-4 h-4 text-amber-400" />
                <span>Infants or Children under 12 years</span>
              </label>

              <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={profile.has_elderly}
                  onChange={(e) => setProfile({ ...profile, has_elderly: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                />
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Elderly family members (65+ years)</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs rounded-xl shadow-lg transition disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Persisting Factors...' : 'Save Household Exposure Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
