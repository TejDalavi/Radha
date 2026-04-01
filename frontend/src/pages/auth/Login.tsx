import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Rocket } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const formData = new URLSearchParams();
      formData.append('username', email); // OAuth2 expects 'username'
      formData.append('password', password);
      
      const { data } = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      setAuth(data.access_token, data.user_id, data.role, data.is_approved);
      
      if (!data.is_approved) {
         setError('Your account is pending Admin approval. Please check back later.');
         return;
      }
      
      navigate('/');
    } catch (err: any) {
      if (err.response?.status === 403) {
         setError('Your account is pending Admin approval. You cannot log in yet.');
      } else {
         setError(err.response?.data?.detail || 'Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 glass flex flex-col items-center">
      <div className="bg-blue-100 p-4 rounded-full mb-4">
        <Rocket className="w-8 h-8 text-blue-600" />
      </div>
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Welcome Back</h2>
      
      {error && <div className="w-full bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center font-medium border border-red-200">{error}</div>}
      
      <form onSubmit={handleLogin} className="w-full space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
          <input 
            type="email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="you@startup.box"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="••••••••"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-md transition-all disabled:opacity-70"
        >
          {loading ? 'Logging in...' : 'Sign In'}
        </button>
      </form>
      
      <p className="mt-6 text-sm text-slate-500">
        Don't have an account? <Link to="/register" className="text-blue-600 font-semibold hover:underline">Register here</Link>
      </p>
    </div>
  );
};
