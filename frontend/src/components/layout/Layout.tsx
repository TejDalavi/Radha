import React from 'react';
import { Rocket } from 'lucide-react';

import { useAuthStore } from '../../store/authStore';
import { Link, useNavigate } from 'react-router-dom';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { token, role, isApproved, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/20 rounded-full blur-[100px] pointer-events-none" />
      
      <header className="w-full glass !border-b-0 rounded-none z-10 sticky top-0 py-4 px-6 md:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg shadow-lg shadow-blue-500/30">
            <Rocket className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            Startup<span className="text-blue-600">Box</span> AI
          </h1>
        </Link>
        <nav className="hidden md:flex gap-6 text-sm font-semibold text-slate-600 items-center">
           {token && isApproved && <Link to="/" className="hover:text-blue-600 transition-colors">Create Pitch</Link>}
           {role === 'admin' && <Link to="/admin" className="text-emerald-700 hover:text-emerald-500 transition-colors">Admin Dashboard</Link>}
           {token ? (
              <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 transition-colors">Logout</button>
           ) : (
              <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-bold">Sign In</Link>
           )}
        </nav>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-12 z-10">
        {children}
      </main>
    </div>
  );
};
