
import React, { useState, useEffect } from 'react';
import { Farmer, Plantation as PlantationType } from '../types';
import { db } from '../services/db';
import { Save, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { FarmerSearch } from './FarmerSearch';

export const Plantation = () => {
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [plantation, setPlantation] = useState<PlantationType>({
    id: '',
    farmerId: '',
    landArea: '',
    plantationDate: '',
    lastHarvestDate: '',
    variety: '',
    plantToPlantDistance: '', // Fixed property name from previous interface
    lineToLineDistance: '',
    cropName: 'Sugarcane',
    status: 'Active'
  });
  const [msg, setMsg] = useState('');
  const [savedRecords, setSavedRecords] = useState<PlantationType[]>([]);
  const [allFarmers, setAllFarmers] = useState<Farmer[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [plantations, farmers] = await Promise.all([
        db.getAllPlantations(),
        db.getFarmers()
    ]);
    setSavedRecords(plantations);
    setAllFarmers(farmers);
  };

  const handleFarmerSelect = async (f: Farmer) => {
    setFarmer(f);
    // Check for Bycell dose land info
    const bycell = await db.getBycell(f.id);
    
    // Check if there's already an active plantation for this farmer to edit
    const farmerPlantations = await db.getPlantationsByFarmer(f.id);
    const existing = farmerPlantations.find(p => p.status === 'Active');
    
    if (existing) {
        setPlantation(existing);
    } else {
        setPlantation(prev => ({
          ...prev,
          id: '',
          farmerId: f.id,
          landArea: bycell ? bycell.acres : f.totalLand,
          plantationDate: '',
          lastHarvestDate: '',
          variety: '',
          plantToPlantDistance: '',
          lineToLineDistance: '',
          cropName: 'Sugarcane',
          status: 'Active'
        }));
    }
  };

  const handleFarmerClear = () => {
    setFarmer(null);
    setPlantation({
        id: '',
        farmerId: '',
        landArea: '',
        plantationDate: '',
        lastHarvestDate: '',
        variety: '',
        plantToPlantDistance: '',
        lineToLineDistance: '',
        cropName: 'Sugarcane',
        status: 'Active'
    });
  };

  const handleSave = async () => {
    if (!farmer) return;
    const newRecord = { ...plantation, id: plantation.id || Date.now().toString(), farmerId: farmer.id };
    await db.savePlantation(newRecord);
    
    setMsg('Plantation record saved successfully.');
    setTimeout(() => setMsg(''), 3000);
    
    await loadData();
    setPlantation(newRecord);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (p: PlantationType) => {
    const f = allFarmers.find(fm => fm.id === p.farmerId);
    if (f) {
        setFarmer(f);
        setPlantation(p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this plantation record?")) {
        await db.deletePlantation(id);
        if (plantation.id === id) {
            handleFarmerClear();
        }
        loadData();
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {msg && (
        <div className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-pulse">
          <CheckCircle size={24} />
          <div>
            <h4 className="font-bold text-lg">Success</h4>
            <p>{msg}</p>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-600">
        <h2 className="text-xl font-bold text-green-800 mb-4">Plantation Application</h2>
        <div className="w-full md:w-1/2">
          <FarmerSearch 
            onSelect={handleFarmerSelect} 
            onClear={handleFarmerClear} 
            selectedFarmer={farmer}
            label="Search & Select Farmer"
          />
        </div>
      </div>

      {farmer && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm animate-fade-in">
          <div><span className="text-gray-500">Name:</span> <span className="font-semibold">{farmer.name}</span></div>
          <div><span className="text-gray-500">Phone:</span> <span className="font-semibold">{farmer.phone}</span></div>
          <div><span className="text-gray-500">Village:</span> <span className="font-semibold">{farmer.village}</span></div>
          <div><span className="text-gray-500">Total Land:</span> <span className="font-semibold">{farmer.totalLand} Acres</span></div>
        </div>
      )}

      {farmer && (
        <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
          <h3 className="font-semibold text-lg mb-4 border-b pb-2">Crop Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {[
              { label: 'Plantation Land (Acres)', name: 'landArea' }, 
              { label: 'Plantation Date', name: 'plantationDate', type: 'date' },
              { label: 'Last Harvesting Date', name: 'lastHarvestDate', type: 'date' },
              { label: 'Variety', name: 'variety' },
              { label: 'Plant to Plant Distance', name: 'plantToPlantDistance' },
              { label: 'Line to Line Distance', name: 'lineToLineDistance' },
              { label: 'Crop Name', name: 'cropName' },
             ].map(f => (
               <div key={f.name}>
                 <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                 <input 
                    type={f.type || 'text'}
                    value={(plantation as any)[f.name] || ''}
                    onChange={e => setPlantation({...plantation, [f.name]: e.target.value})}
                    className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-green-500 outline-none"
                 />
               </div>
             ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={handleSave} className="bg-green-700 text-white px-8 py-2 rounded shadow hover:bg-green-800 flex items-center gap-2">
              <Save size={18} /> Save Application
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
         <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="font-bold text-gray-700">Saved Plantation Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Farmer</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Crop</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Variety</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Land (Acres)</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {savedRecords.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center text-gray-500">No plantation records found.</td></tr>
              ) : (
                savedRecords.map(p => {
                  const f = allFarmers.find(af => af.id === p.farmerId);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{f?.name || 'Unknown'}</td>
                      <td className="px-4 py-3">{p.cropName}</td>
                      <td className="px-4 py-3">{p.variety}</td>
                      <td className="px-4 py-3">{p.landArea}</td>
                      <td className="px-4 py-3 text-gray-500">{p.plantationDate}</td>
                      <td className="px-4 py-3 flex justify-center gap-2">
                        <button onClick={() => handleEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
                            <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                            <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
