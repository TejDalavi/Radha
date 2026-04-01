import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { UserPlus } from 'lucide-react';

export const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
       setError("Passwords do not match");
       return;
    }
    
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const { data } = await api.post('/auth/register', { email, password });
      
      if (data.role === 'admin') {
         setSuccess("You are the first user and have been granted Admin rights! Redirecting to login...");
      } else {
         setSuccess("Registration successful! Your account is pending admin approval. Redirecting to login...");
      }
      
      setTimeout(() => navigate('/login'), 4000);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 glass flex flex-col items-center">
      <div className="bg-indigo-100 p-4 rounded-full mb-4">
        <UserPlus className="w-8 h-8 text-indigo-600" />
      </div>
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Create an Account</h2>
      
      {error && <div className="w-full bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center font-medium border border-red-200">{error}</div>}
      {success && <div className="w-full bg-green-50 text-green-700 p-4 rounded-lg mb-4 text-sm text-center font-bold border border-green-200">{success}</div>}
      
      <form onSubmit={handleRegister} className="w-full space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
          <input 
            type="email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" 
            placeholder="founder@startup.box"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" 
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm Password</label>
          <input 
            type="password" 
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" 
            placeholder="••••••••"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading || !!success}
          className="w-full py-3 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-black hover:to-black text-white rounded-xl font-semibold shadow-md transition-all disabled:opacity-70"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
      
      <p className="mt-6 text-sm text-slate-500">
        Already have an account? <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Log in</Link>
      </p>
    </div>
  );
};
