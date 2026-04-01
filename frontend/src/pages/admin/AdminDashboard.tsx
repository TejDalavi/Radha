import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Users, Settings2, CheckCircle2 } from 'lucide-react';

export const AdminDashboard = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [config, setConfig] = useState({ provider_name: '', model_name: '', api_key: '', temperature: 0.7 });
  const [activeTab, setActiveTab] = useState('users');
  const [savingConfig, setSavingConfig] = useState(false);
  const [message, setMessage] = useState('');
  
  const role = useAuthStore((state) => state.role);
  const navigate = useNavigate();

  useEffect(() => {
    if (role !== 'admin') {
      navigate('/');
      return;
    }
    
    fetchUsers();
    fetchConfig();
  }, [role]);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (e: any) {
      console.error(e);
    }
  };

  const fetchConfig = async () => {
    try {
      const { data } = await api.get('/admin/llm-config');
      setConfig(data);
    } catch (e: any) {
      console.error(e);
    }
  };

  const toggleApproval = async (userId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}/approve`, { is_approved: !currentStatus });
      await fetchUsers();
    } catch (e) {
      console.error("Failed to update approval");
    }
  };

  const toggleRole = async (userId: string, currentRole: string) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      await fetchUsers();
    } catch (e) {
      console.error("Failed to update role");
    }
  };

  const saveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    setMessage('');
    try {
      await api.post('/admin/llm-config', config);
      setMessage("Global LLM Configuration saved successfully!");
      setTimeout(() => setMessage(''), 3000);
    } catch (e: any) {
      setMessage("Failed to save config: " + (e.response?.data?.detail || e.message));
    } finally {
      setSavingConfig(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <ShieldCheck className="w-10 h-10 text-emerald-600" />
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Admin Dashboard</h1>
      </div>

      {message && <div className="p-3 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium border border-slate-200">{message}</div>}

      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('users')}
          className={`pb-4 px-2 font-semibold flex items-center gap-2 transition-all ${activeTab === 'users' ? 'border-b-2 border-emerald-600 text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Users className="w-5 h-5" /> Pending Approvals
        </button>
        <button 
          onClick={() => setActiveTab('config')}
          className={`pb-4 px-2 font-semibold flex items-center gap-2 transition-all ${activeTab === 'config' ? 'border-b-2 border-emerald-600 text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Settings2 className="w-5 h-5" /> Global LLM Settings
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="glass p-6 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-sm">
                <th className="p-3 font-semibold text-slate-600">Email</th>
                <th className="p-3 font-semibold text-slate-600">Role</th>
                <th className="p-3 font-semibold text-slate-600">Joined Date</th>
                <th className="p-3 font-semibold text-slate-600">Status</th>
                <th className="p-3 font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 font-medium text-slate-800">{u.email}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded-md font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>{u.role.toUpperCase()}</span>
                  </td>
                  <td className="p-3 text-slate-500 text-sm">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    <span className={`flex items-center gap-1 text-sm font-semibold ${u.is_approved ? 'text-green-600' : 'text-amber-500'}`}>
                      {u.is_approved ? <CheckCircle2 className="w-4 h-4"/> : <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"/>}
                      {u.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                        {u.role !== 'admin' && (
                          <button 
                            onClick={() => toggleApproval(u.id, u.is_approved)}
                            className={`text-sm font-bold px-4 py-1.5 rounded-lg transition-all shadow-sm ${u.is_approved ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                          >
                            {u.is_approved ? 'Revoke Access' : 'Approve Now'}
                          </button>
                        )}
                        <button 
                          onClick={() => toggleRole(u.id, u.role)}
                          className={`text-sm font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm ${u.role === 'admin' ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
                        >
                          {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'config' && (
        <div className="glass p-8 max-w-2xl">
          <h2 className="text-xl font-bold text-slate-800 mb-6">AI Model Provider Configuration</h2>
          <p className="text-slate-500 mb-6 text-sm">Set the global API key and select the AI model that the agents will use.</p>
          
          {message && <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-lg font-bold border border-emerald-200">{message}</div>}

          <form onSubmit={saveConfig} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Provider Platform</label>
              <select 
                value={config.provider_name} 
                onChange={(e) => setConfig({...config, provider_name: e.target.value})}
                className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="openrouter">OpenRouter (Supports ALL Models)</option>
                <option value="openai">OpenAI (Native)</option>
                <option value="anthropic">Anthropic (Native)</option>
                <option value="gemini">Google Gemini (Native)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">API Key</label>
              <input 
                type="password" 
                value={config.api_key} 
                onChange={(e) => setConfig({...config, api_key: e.target.value})}
                className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                placeholder="sk-or-v1-..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Model Name string</label>
              <input 
                type="text" 
                value={config.model_name} 
                onChange={(e) => setConfig({...config, model_name: e.target.value})}
                className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                placeholder="google/gemini-2.0-flash-001 or openai/gpt-4o"
              />
              <p className="text-xs text-slate-400 mt-2">Example OpenRouter models: <strong>google/gemini-2.0-flash-001</strong>, <strong>anthropic/claude-3-opus</strong>, <strong>openai/gpt-4o</strong></p>
            </div>

            <div className="pt-4 border-t border-slate-100">
               <button type="submit" disabled={savingConfig} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all">
                 {savingConfig ? 'Saving...' : 'Save Configuration'}
               </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
