
import React, { useState, useEffect } from 'react';
import { Farmer } from '../types';
import { db } from '../services/db';
import { Save, Plus, Search, Edit, Trash2, CheckCircle } from 'lucide-react';

export const FarmerRegistration = () => {
  const emptyForm: Farmer = {
    id: '',
    serialNumber: '',
    nslCode: '',
    name: '',
    aadhar: '',
    phone: '',
    totalLand: '',
    surveyNo: '',
    village: '',
    hobli: '',
    taluka: ''
  };

  const [form, setForm] = useState<Farmer>(emptyForm);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [msg, setMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadFarmers();
  }, []);

  const getNextSerial = (list: Farmer[]) => {
    const max = list.reduce((acc, f) => {
      const num = parseInt(f.serialNumber);
      return !isNaN(num) && num > acc ? num : acc;
    }, 0);
    return (max + 1).toString();
  };

  const loadFarmers = async () => {
    const list = await db.getFarmers();
    setFarmers(list);
    if(!form.id) setForm(prev => ({ ...prev, serialNumber: getNextSerial(list) }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!form.name || !form.phone) {
      alert("Name and Phone are required");
      return;
    }
    
    const newFarmer = { ...form, id: form.id || Date.now().toString() };
    await db.saveFarmer(newFarmer);
    
    setMsg("Farmer Saved Successfully!");
    setTimeout(() => setMsg(''), 3000);
    
    await loadFarmers();
    setForm({ ...emptyForm }); // Serial gets updated in loadFarmers
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (farmer: Farmer) => {
    setForm(farmer);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNew = async () => {
    await loadFarmers();
    setForm(emptyForm);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this farmer?")) {
      await db.deleteFarmer(id);
      await loadFarmers();
      if (form.id === id) {
        setForm(emptyForm);
      }
    }
  };

  const filteredFarmers = farmers.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.phone.includes(searchTerm) ||
    f.village.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold text-green-800">Farmer Registration</h2>
          {form.id && <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">Editing Mode</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Serial Number', name: 'serialNumber' },
            { label: 'NSL Sugar Code', name: 'nslCode' },
            { label: 'Farmer Name', name: 'name' },
            { label: 'Aadhar Number', name: 'aadhar' },
            { label: 'Phone No', name: 'phone' },
            { label: 'Total Land (Acres)', name: 'totalLand' },
            { label: 'Survey No', name: 'surveyNo' },
            { label: 'Village', name: 'village' },
            { label: 'Hobli', name: 'hobli' },
            { label: 'Taluka', name: 'taluka' },
          ].map((field) => (
            <div key={field.name} className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">{field.label}</label>
              <input
                type="text"
                name={field.name}
                value={(form as any)[field.name]}
                onChange={handleChange}
                readOnly={field.name === 'serialNumber'}
                className={`border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-green-500 outline-none ${field.name === 'serialNumber' ? 'bg-gray-100 cursor-not-allowed font-bold text-gray-500' : ''}`}
              />
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-4">
          <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md flex items-center gap-2 shadow transition-colors">
            <Save size={18} /> {form.id ? 'Update Farmer' : 'Save Farmer'}
          </button>
          <button onClick={handleNew} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md flex items-center gap-2 shadow transition-colors">
            <Plus size={18} /> New
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-gray-800">Registered Farmers List</h3>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Name, Phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-green-50 text-green-900 uppercase text-xs font-bold">
              <tr>
                <th className="p-3 border-b border-green-100">Serial</th>
                <th className="p-3 border-b border-green-100">Name</th>
                <th className="p-3 border-b border-green-100">Phone</th>
                <th className="p-3 border-b border-green-100">Village</th>
                <th className="p-3 border-b border-green-100">Land (Acres)</th>
                <th className="p-3 border-b border-green-100 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredFarmers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No farmers found. Add a new farmer to get started.
                  </td>
                </tr>
              ) : (
                filteredFarmers.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-semibold text-gray-700">{f.serialNumber || '-'}</td>
                    <td className="p-3 font-medium text-gray-900">{f.name}</td>
                    <td className="p-3 text-gray-600">{f.phone}</td>
                    <td className="p-3 text-gray-600">{f.village}</td>
                    <td className="p-3 text-gray-600">{f.totalLand}</td>
                    <td className="p-3 flex justify-center gap-2">
                      <button 
                        onClick={() => handleEdit(f)} 
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(f.id)} 
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
