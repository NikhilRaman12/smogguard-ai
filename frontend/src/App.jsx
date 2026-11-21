import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AIAssistant from './pages/AIAssistant';
import DailyPlanner from './pages/DailyPlanner';
import ImpactTracker from './pages/ImpactTracker';
import Alerts from './pages/Alerts';
import Profile from './pages/Profile';

export default function App() {
  return (
    <Routes>
      {/* Open-Access Direct App Layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="assistant" element={<AIAssistant />} />
        <Route path="planner" element={<DailyPlanner />} />
        <Route path="impact" element={<ImpactTracker />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Catch-all redirect to Dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
