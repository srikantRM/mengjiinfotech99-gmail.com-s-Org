
import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Farmer } from '../types';
import { db } from '../services/db';

interface Props {
  onSelect: (farmer: Farmer) => void;
  onClear: () => void;
  label?: string;
  selectedFarmer?: Farmer | null;
}

export const FarmerSearch: React.FC<Props> = ({ onSelect, onClear, label = "Search Farmer", selectedFarmer }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Farmer[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync query with selected farmer if provided
  useEffect(() => {
    if (selectedFarmer) {
      setQuery(`${selectedFarmer.name} (${selectedFarmer.phone})`);
    } else {
      setQuery('');
    }
  }, [selectedFarmer]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    
    if (val.length > 0) {
      const matches = await db.findFarmer(val);
      setResults(matches);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
      onClear();
    }
  };

  const handleSelect = (f: Farmer) => {
    onSelect(f);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    onClear();
    setResults([]);
  };

  return (
    <div className="w-full" ref={wrapperRef}>
      {label && <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">{label}</label>}
      <div className="relative group">
        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <Search size={14} />
        </div>
        <input
          type="text"
          className={`w-full pl-8 pr-8 h-9 text-sm border rounded outline-none focus:ring-1 focus:ring-green-500 transition-all shadow-sm ${selectedFarmer ? 'bg-green-50 border-green-300 text-green-800 font-semibold' : 'bg-white border-gray-300'}`}
          placeholder="Search..."
          value={query}
          onChange={handleSearch}
          onFocus={() => {
             if(!selectedFarmer && query.length > 0) setIsOpen(true);
          }}
        />
        {query && (
          <button 
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded shadow-lg border border-gray-200 max-h-48 overflow-y-auto text-sm">
          {results.length === 0 ? (
            <div className="p-2 text-center text-gray-400 text-xs">No farmers found</div>
          ) : (
            <ul className="py-0">
              {results.map((f) => (
                <li key={f.id}>
                  <button
                    onClick={() => handleSelect(f)}
                    className="w-full text-left px-3 py-1.5 hover:bg-green-50 border-b border-gray-50 last:border-0 flex justify-between items-center group transition-colors"
                  >
                    <div className="truncate">
                      <span className="font-medium text-gray-800 text-sm group-hover:text-green-700">{f.name}</span>
                      <span className="mx-1 text-gray-300">|</span>
                      <span className="text-[10px] text-gray-500">{f.village} • {f.phone}</span>
                    </div>
                    <div className="text-[10px] bg-gray-100 text-gray-500 px-1.5 rounded group-hover:bg-green-200 group-hover:text-green-800">
                      Select
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
