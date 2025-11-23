
import React, { useState } from 'react';
import { db } from '../services/db';
import { Farmer } from '../types';
import { Search } from 'lucide-react';

export const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }: any) => {
  const base = "px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: any = {
    primary: "bg-green-700 text-white hover:bg-green-800 shadow-sm",
    danger: "bg-white border border-red-200 text-red-600 hover:bg-red-50",
    outline: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-50"
  };
  return <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>{children}</button>;
};

export const Input = ({ label, ...props }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input {...props} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-700 focus:outline-none bg-white" />
  </div>
);

export const SearchSelectFarmer = ({ onSelect }: { onSelect: (f: Farmer) => void }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Farmer[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setSearching(true);
    try {
      const res = await db.findFarmer(query);
      setResults(res);
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200 no-print">
      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Find Farmer</h3>
      <div className="flex gap-2">
        <input 
          type="text" 
          placeholder="Search by Name or Phone..." 
          className="flex-1 p-2 border border-gray-300 rounded-md bg-white outline-none focus:border-green-600"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch}><Search size={18}/> Search</Button>
      </div>
      {results.length > 0 && (
        <div className="mt-2 max-h-40 overflow-y-auto border rounded-md bg-white">
          {results.map(f => (
            <div 
              key={f.id} 
              onClick={() => { onSelect(f); setResults([]); setQuery(''); }}
              className="p-2 hover:bg-green-50 cursor-pointer border-b last:border-0 text-sm text-gray-700"
            >
              {f.name} - {f.phone} ({f.village})
            </div>
          ))}
        </div>
      )}
      {searching && <p className="text-sm text-gray-400 mt-1">Searching...</p>}
    </div>
  );
};
