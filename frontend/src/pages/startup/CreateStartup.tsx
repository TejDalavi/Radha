import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useStartupStore } from '../../store/startupStore';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const CreateStartup = () => {
  const navigate = useNavigate();
  const setProjectInfo = useStartupStore(s => s.setProjectInfo);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    idea: '',
    industry: 'Technology',
    audience: ''
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/startup/create', {
        idea_description: form.idea,
        industry: form.industry,
        target_audience: form.audience
      });
      setProjectInfo(data.id, data.status);
      navigate(`/results/${data.id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to initialize AI. Is the FastAPI backend running on port 8000?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto mt-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
          Turn your idea into a <span className="gradient-text">Startup</span>
        </h1>
        <p className="text-lg text-slate-600">
          Our specialized team of AI Agents will research the market, analyze competitors, write landing page copy, and generate ads in literal minutes.
        </p>
      </div>

      <form onSubmit={onSubmit} className="glass p-8 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">What's your startup idea?</label>
          <textarea
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none shadow-sm"
            rows={4}
            placeholder="e.g. A marketplace for local artisanal coffee roasters..."
            value={form.idea}
            onChange={(e) => setForm({ ...form, idea: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Industry Sector</label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 shadow-sm outline-none"
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
            >
              {['Technology', 'E-Commerce', 'Healthcare', 'Finance', 'Education', 'Other'].map(i => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Target Audience</label>
            <input
              required
              type="text"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 shadow-sm outline-none"
              placeholder="e.g. Millennial remote workers"
              value={form.audience}
              onChange={(e) => setForm({ ...form, audience: e.target.value })}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {loading ? 'Initializing Agents...' : 'Generate Assets'}
          {!loading && <ArrowRight className="w-5 h-5 ml-1" />}
        </button>
      </form>
    </motion.div>
  );
};
