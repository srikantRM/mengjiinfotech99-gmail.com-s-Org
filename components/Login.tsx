
import React, { useState } from 'react';
import { User } from '../types';
import { db } from '../services/db';
import { Sprout, Lock, User as UserIcon } from 'lucide-react';

interface Props {
  onLogin: (user: User) => void;
}

export const Login: React.FC<Props> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
        const user = await db.login(username, password);
        if (user) {
          onLogin(user);
        } else {
          setError('Invalid credentials. Try admin/admin');
        }
    } catch (e) {
        setError('Login failed. Server connection error.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="bg-[#1B5E20] p-10 text-center">
          <div className="w-20 h-20 bg-white text-[#1B5E20] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sprout size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-wide mb-1">AgriSmart</h1>
          <p className="text-green-100 text-sm font-medium opacity-90">Farm Management System</p>
        </div>
        
        <div className="p-10 pt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded border border-red-200 text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600 pl-1">Username</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <UserIcon size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1B5E20] focus:border-transparent outline-none transition-all text-sm placeholder-gray-400"
                  placeholder="Enter username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600 pl-1">Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1B5E20] focus:border-transparent outline-none transition-all text-sm placeholder-gray-400"
                  placeholder="Enter password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1B5E20] text-white font-bold py-3.5 rounded-md hover:bg-[#144a19] transition-colors shadow-md hover:shadow-lg transform active:scale-[0.99] mt-4 text-sm uppercase tracking-wide"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-gray-400 leading-relaxed">
            <p className="mb-2">Demo Access:</p>
            <p className="font-mono">admin / admin</p>
          </div>
        </div>
      </div>
    </div>
  );
};
