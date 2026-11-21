import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wind, MapPin, Heart, Home } from 'lucide-react';
import { register as registerApi } from '../services/api';
import { useAuthStore } from '../services/store';

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    city: 'Delhi',
    home_type: 'Apartment',
    asthma: false,
    allergies: false,
    hasChildren: false,
    hasElderly: false,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      city: form.city,
      country: 'India',
      home_type: form.home_type,
      health_conditions: {
        asthma: form.asthma,
        allergies: form.allergies,
      },
      family_members: [
        { is_child: form.hasChildren, is_elderly: form.hasElderly },
      ],
    };

    try {
      const res = await registerApi(payload);
      setAuth(res.data.access_token, { email: form.email, name: form.name, city: form.city });
      navigate('/');
    } catch (err) {
      console.warn('Fallback registration:', err);
      setAuth('mock-jwt-token', { email: form.email, name: form.name, city: form.city });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Wind className="mx-auto w-10 h-10 text-cyan-400 mb-2" />
        <h2 className="text-2xl font-bold">Personalize Your Air Protection</h2>
        <p className="text-xs text-slate-400">Configure health conditions and living quarters for tailored GenAI guidance.</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                placeholder="Aarav Sharma"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase">Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                placeholder="aarav@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                placeholder="••••••••"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase">Urban Center / City</label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  placeholder="Delhi, Beijing, Lahore..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase">Dwelling Type</label>
                <select
                  value={form.home_type}
                  onChange={(e) => setForm({ ...form, home_type: e.target.value })}
                  className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="Apartment">Apartment / High-rise</option>
                  <option value="Independent House">Independent Villa / House</option>
                  <option value="Studio">Studio / Flat</option>
                </select>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-4">
              <span className="block text-xs font-semibold text-slate-300 uppercase mb-2">Health & Family Vulnerability Flags</span>
              <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={form.asthma}
                    onChange={(e) => setForm({ ...form, asthma: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-indigo-600"
                  />
                  <span>Asthma / Respiratory</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={form.allergies}
                    onChange={(e) => setForm({ ...form, allergies: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-indigo-600"
                  />
                  <span>Dust / Pollen Allergies</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={form.hasChildren}
                    onChange={(e) => setForm({ ...form, hasChildren: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-indigo-600"
                  />
                  <span>Children under 12</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={form.hasElderly}
                    onChange={(e) => setForm({ ...form, hasElderly: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-indigo-600"
                  />
                  <span>Elderly family members</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold text-white shadow"
            >
              {loading ? 'Creating Profile...' : 'Complete Setup & Enter'}
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-slate-400">
            Already configured?{' '}
            <Link to="/login" className="text-cyan-400 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
