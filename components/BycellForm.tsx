
import React, { useState, useEffect } from 'react';
import { db, compressImage, fileToBase64 } from '../services/db';
import { Farmer, BycellActivity, BycellDose } from '../types';
import { Save, Camera, Upload, Trash2, Plus, Eye, CheckCircle, Edit, ChevronDown, ChevronUp, Printer, ArrowLeft } from 'lucide-react';
import { FarmerSearch } from './FarmerSearch';
import { CameraModal } from './CameraModal';

export const DEFAULT_DOSE = [
  { day: 1, type: "DRENCHING", activity: "ICU POLYSULPHATE", qty: "50 KG - 1 BAG" },
  { day: 1, type: "DRENCHING", activity: "SSP (SINGLE SUPER PHOSPHATE)", qty: "50 KG - 3 BAGS" },
  { day: 1, type: "DRENCHING", activity: "UREA", qty: "45 KG - 1 BAG" },
  { day: 1, type: "DRENCHING", activity: "PLANTO GR (ORGANIC)", qty: "50 KG - 1 BAG" }
];

const BycellPrintView: React.FC<{ dose: BycellDose, farmer: Farmer, onBack: () => void }> = ({ dose, farmer, onBack }) => {
  useEffect(() => {
    window.print();
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <div className="no-print p-4 bg-gray-100 border-b flex justify-between items-center">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-700 hover:text-black font-semibold">
          <ArrowLeft size={20} /> Back to Form
        </button>
        <button onClick={() => window.print()} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700">
          <Printer size={18} /> Print Report
        </button>
      </div>

      <div className="p-8 max-w-5xl mx-auto printable-area">
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-3xl font-bold uppercase">Bycell Dose Application Report</h1>
          <p className="text-gray-600">Farm Management System</p>
        </div>

        <div className="flex justify-between mb-6 border p-4 rounded bg-gray-50">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Farmer Name</p>
            <p className="font-bold text-lg">{farmer.name}</p>
            <p className="text-sm">{farmer.village} | {farmer.phone}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-sm text-gray-500">Plantation Area</p>
            <p className="font-bold text-lg">{dose.acres} Acres</p>
            <p className="text-sm text-gray-500">Date: {new Date(dose.date).toLocaleDateString()}</p>
          </div>
        </div>

        {dose.remarks && (
          <div className="mb-6">
            <p className="font-bold text-sm mb-1">Remarks:</p>
            <p className="border p-2 rounded bg-gray-50 text-sm">{dose.remarks}</p>
          </div>
        )}

        <table className="w-full text-sm border-collapse border border-black">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black p-2">Day</th>
              <th className="border border-black p-2">Type</th>
              <th className="border border-black p-2 text-left">Activity</th>
              <th className="border border-black p-2">Qty/Acre</th>
              <th className="border border-black p-2">Total Qty</th>
              <th className="border border-black p-2">Total Bags</th>
              <th className="border border-black p-2">Status</th>
              <th className="border border-black p-2">Completion Date</th>
            </tr>
          </thead>
          <tbody>
            {dose.activities.map((act, idx) => (
              <tr key={idx}>
                <td className="border border-black p-2 text-center">{act.day}</td>
                <td className="border border-black p-2 text-center">{act.type}</td>
                <td className="border border-black p-2 font-medium">{act.activity}</td>
                <td className="border border-black p-2 text-center">{act.qty}</td>
                <td className="border border-black p-2 text-center font-bold">{act.appliedQty || '-'}</td>
                <td className="border border-black p-2 text-center font-bold">{act.appliedBags || '-'}</td>
                <td className="border border-black p-2 text-center">
                   {act.isDone ? '✅ DONE' : 'PENDING'}
                </td>
                <td className="border border-black p-2 text-center">{act.doneDate || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="mt-12 flex justify-between text-sm pt-8 border-t border-gray-300">
            <div>
                <p className="font-bold mb-8">Farmer Signature</p>
                <div className="w-48 border-b border-black"></div>
            </div>
            <div>
                <p className="font-bold mb-8">Field Officer Signature</p>
                <div className="w-48 border-b border-black"></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export const BycellForm = () => {
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [acres, setAcres] = useState('');
  const [remarks, setRemarks] = useState('');
  const [activities, setActivities] = useState<BycellActivity[]>([]);
  const [msg, setMsg] = useState('');
  
  const [savedDoses, setSavedDoses] = useState<BycellDose[]>([]);
  const [allFarmers, setAllFarmers] = useState<Farmer[]>([]);
  const [expandedDoseId, setExpandedDoseId] = useState<string | null>(null);

  const [printMode, setPrintMode] = useState(false);
  const [printData, setPrintData] = useState<{dose: BycellDose, farmer: Farmer} | null>(null);

  const [showCamera, setShowCamera] = useState(false);
  const [activeActivityId, setActiveActivityId] = useState<string | null>(null);
  const [viewPhoto, setViewPhoto] = useState<string | null>(null);

  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    setSavedDoses(await db.getAllBycell());
    setAllFarmers(await db.getFarmers());
  };

  const calculateAppliedQty = (qtyStr: string, currentAcres: string) => {
    const q = parseFloat(qtyStr);
    const a = parseFloat(currentAcres);
    if (!isNaN(q) && !isNaN(a) && a > 0) {
      const result = (q * a).toFixed(2);
      return result.endsWith('.00') ? result.slice(0, -3) : result;
    }
    return '-';
  };

  const calculateBags = (qtyStr: string, currentAcres: string) => {
    const a = parseFloat(currentAcres);
    if (isNaN(a) || a <= 0) return '-';

    const match = qtyStr.match(/(\d+(\.\d+)?)\s*BAG/i);
    if (match && match[1]) {
        const bagsPerAcre = parseFloat(match[1]);
        const total = bagsPerAcre * a;
        return total % 1 === 0 ? total.toString() : total.toFixed(1);
    }
    return '-';
  };

  useEffect(() => {
    if (farmer) {
      const fetchExisting = async () => {
        const existing = await db.getBycell(farmer.id);
        if (existing) {
            setAcres(existing.acres);
            setRemarks(existing.remarks);
            if (existing.activities && existing.activities.length > 0) {
            const fixedActivities = existing.activities.map(a => ({
                ...a,
                appliedQty: a.appliedQty || calculateAppliedQty(a.qty, existing.acres),
                appliedBags: a.appliedBags || calculateBags(a.qty, existing.acres)
            }));
            setActivities(fixedActivities);
            } else {
            loadTemplate(existing.acres);
            }
        } else {
            setAcres('');
            setRemarks('');
            loadTemplate('');
        }
      }
      fetchExisting();
    } else {
      setActivities([]);
      setAcres('');
    }
  }, [farmer]);

  const loadTemplate = (currentAcres: string) => {
    const template: BycellActivity[] = DEFAULT_DOSE.map((d, i) => ({
      id: `BA_${Date.now()}_${i}`,
      day: d.day,
      type: d.type,
      activity: d.activity,
      qty: d.qty,
      appliedQty: calculateAppliedQty(d.qty, currentAcres),
      appliedBags: calculateBags(d.qty, currentAcres),
      isDone: false,
      doneDate: '',
      time: '',
      photo: ''
    }));
    setActivities(template);
  };

  const handleAcresChange = (val: string) => {
    setAcres(val);
    setActivities(prev => prev.map(a => ({
        ...a,
        appliedQty: calculateAppliedQty(a.qty, val),
        appliedBags: calculateBags(a.qty, val)
    })));
  };

  const handleSave = async () => {
    if (!farmer) return;
    try {
        await db.saveBycell({
            id: farmer.id + '_bycell',
            farmerId: farmer.id,
            acres,
            remarks,
            date: new Date().toISOString(),
            activities
        });
        
        setMsg("Bycell Dose Application Saved Successfully!");
        loadSavedData();
        setTimeout(() => setMsg(''), 3000);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
        setMsg("Error: Data not saved.");
        setTimeout(() => setMsg(''), 5000);
    }
  };

  const updateActivity = (id: string, field: keyof BycellActivity, value: any) => {
    setActivities(prev => prev.map(a => {
      if (a.id !== id) return a;
      const updated = { ...a, [field]: value };
      
      if (field === 'qty') {
        updated.appliedQty = calculateAppliedQty(value, acres);
        updated.appliedBags = calculateBags(value, acres);
      }

      if (field === 'isDone') {
        if (value === true) {
            updated.doneDate = new Date().toISOString().split('T')[0];
            updated.time = new Date().toLocaleTimeString();
        } else {
            updated.doneDate = '';
            updated.time = '';
        }
      }
      return updated;
    }));
  };

  const addRow = () => {
    const newRow: BycellActivity = {
      id: `BA_${Date.now()}`,
      day: '',
      type: '',
      activity: '',
      qty: '',
      appliedQty: '-',
      appliedBags: '-',
      isDone: false,
      doneDate: '',
      time: '',
      photo: ''
    };
    setActivities([...activities, newRow]);
  };

  const deleteRow = (id: string) => {
    setActivities(activities.filter(a => a.id !== id));
  };

  const handlePhotoCapture = (base64: string) => {
    if (activeActivityId) {
      updateActivity(activeActivityId, 'photo', base64);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
          const compressed = await compressImage(file);
          const base64 = await fileToBase64(compressed);
          updateActivity(id, 'photo', base64);
      } catch (err) {
          console.error("Image compression failed", err);
          alert("Failed to process image. Try a smaller file.");
      }
    }
  };

  const handleEditDose = (dose: BycellDose) => {
    const f = allFarmers.find(fm => fm.id === dose.farmerId);
    if (f) {
      setFarmer(null); 
      setTimeout(() => {
        setFarmer(f);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    }
  };

  const handleDeleteDose = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this application?")) {
        await db.deleteBycell(id);
        if (farmer && id.includes(farmer.id)) {
            setAcres('');
            setRemarks('');
            loadTemplate('');
        }
        loadSavedData();
    }
  };

  const handlePrint = (dose: BycellDose) => {
    const f = allFarmers.find(fm => fm.id === dose.farmerId);
    if (f) {
      setPrintData({ dose, farmer: f });
      setPrintMode(true);
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedDoseId === id) setExpandedDoseId(null);
    else setExpandedDoseId(id);
  };

  if (printMode && printData) {
    return <BycellPrintView dose={printData.dose} farmer={printData.farmer} onBack={() => setPrintMode(false)} />;
  }

  return (
    <div className="space-y-6 pb-10">
      {showCamera && (
        <CameraModal 
          onClose={() => setShowCamera(false)} 
          onCapture={handlePhotoCapture} 
        />
      )}
      
      {viewPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setViewPhoto(null)}>
          <img src={viewPhoto} className="max-w-full max-h-full rounded" alt="Proof" />
        </div>
      )}

      {msg && (
        <div className={`px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-pulse text-white ${msg.includes("Error") ? "bg-red-600" : "bg-green-600"}`}>
          <CheckCircle size={24} />
          <div>
            <h4 className="font-bold text-lg">{msg.includes("Error") ? "Failed" : "Success"}</h4>
            <p>{msg}</p>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded shadow-md border-t-4 border-green-600">
        <h2 className="text-xl font-bold text-green-800 mb-4">Bycell Dose Application</h2>
        <div className="flex flex-col gap-4">
          <div className="w-full md:w-1/2">
            <FarmerSearch 
              onSelect={setFarmer} 
              onClear={() => setFarmer(null)} 
              selectedFarmer={farmer}
              label="Select Farmer"
            />
          </div>
          {farmer && (
             <div className="w-full md:w-1/2">
               <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Plantation Acres</label>
               <input 
                 type="text" 
                 value={acres} 
                 onChange={(e) => handleAcresChange(e.target.value)}
                 placeholder="Enter Plantation Acres"
                 className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-green-500"
               />
             </div>
          )}
        </div>
      </div>

      {farmer && (
        <div className="bg-white p-6 rounded shadow-md animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-700">Activity Schedule</h3>
            <button onClick={addRow} className="bg-green-100 text-green-700 px-3 py-1.5 rounded text-sm font-medium hover:bg-green-200 flex items-center gap-1">
              <Plus size={16}/> Add Row
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse text-left">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 border-b min-w-[60px]">Day</th>
                  <th className="p-3 border-b min-w-[100px]">Type</th>
                  <th className="p-3 border-b min-w-[200px]">Activity</th>
                  <th className="p-3 border-b min-w-[120px]">Qty (Per Acre)</th>
                  <th className="p-3 border-b min-w-[100px] bg-green-50">Applied Qty</th>
                  <th className="p-3 border-b min-w-[100px] bg-blue-50">Applied Bags</th>
                  <th className="p-3 border-b text-center">Done</th>
                  <th className="p-3 border-b min-w-[100px]">Date</th>
                  <th className="p-3 border-b min-w-[100px]">Time</th>
                  <th className="p-3 border-b text-center min-w-[120px]">Photo</th>
                  <th className="p-3 border-b text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activities.map((act) => (
                  <tr key={act.id} className={act.isDone ? 'bg-green-50/30' : ''}>
                    <td className="p-2 border-r border-gray-50">
                      <input 
                        className="w-full bg-transparent outline-none" 
                        value={act.day} 
                        onChange={(e) => updateActivity(act.id, 'day', e.target.value)}
                      />
                    </td>
                    <td className="p-2 border-r border-gray-50">
                       <input 
                        className="w-full bg-transparent outline-none" 
                        value={act.type} 
                        onChange={(e) => updateActivity(act.id, 'type', e.target.value)}
                      />
                    </td>
                    <td className="p-2 border-r border-gray-50">
                      <input 
                        className="w-full bg-transparent outline-none font-medium" 
                        value={act.activity} 
                        onChange={(e) => updateActivity(act.id, 'activity', e.target.value)}
                      />
                    </td>
                    <td className="p-2 border-r border-gray-50">
                      <input 
                        className="w-full bg-transparent outline-none" 
                        value={act.qty} 
                        onChange={(e) => updateActivity(act.id, 'qty', e.target.value)}
                      />
                    </td>
                    <td className="p-2 border-r border-gray-50 bg-green-50/50 font-bold text-green-800">
                      {act.appliedQty || '-'}
                    </td>
                    <td className="p-2 border-r border-gray-50 bg-blue-50/50 font-bold text-blue-800">
                      {act.appliedBags || '-'}
                    </td>
                    <td className="p-2 border-r border-gray-50 text-center">
                      <input 
                        type="checkbox" 
                        checked={act.isDone} 
                        onChange={(e) => updateActivity(act.id, 'isDone', e.target.checked)}
                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      />
                    </td>
                    <td className="p-2 border-r border-gray-50 text-xs text-gray-600">
                       <input 
                        type="date"
                        className="w-full bg-transparent outline-none"
                        value={act.doneDate}
                        onChange={(e) => updateActivity(act.id, 'doneDate', e.target.value)}
                      />
                    </td>
                    <td className="p-2 border-r border-gray-50 text-xs text-gray-600">
                      {act.time}
                    </td>
                    <td className="p-2 border-r border-gray-50">
                      <div className="flex justify-center items-center gap-2">
                         {act.photo ? (
                           <div className="relative group">
                             <img src={act.photo} className="w-8 h-8 rounded object-cover border" alt="Mini" />
                             <button onClick={() => setViewPhoto(act.photo)} className="absolute inset-0 bg-black/30 hidden group-hover:flex items-center justify-center text-white rounded">
                               <Eye size={12}/>
                             </button>
                           </div>
                         ) : (
                           <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-[10px] text-gray-400">N/A</div>
                         )}
                         
                         <button onClick={() => {setActiveActivityId(act.id); setShowCamera(true);}} className="text-blue-500 hover:bg-blue-50 p-1 rounded">
                           <Camera size={16}/>
                         </button>
                         <label className="text-purple-500 hover:bg-purple-50 p-1 rounded cursor-pointer">
                           <Upload size={16}/>
                           <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, act.id)} />
                         </label>
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <button onClick={() => deleteRow(act.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <button onClick={handleSave} className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 flex items-center gap-2">
              <Save size={18}/> Save All Changes
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="font-bold text-gray-700">Saved Bycell Applications</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Farmer Name</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Village</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Acres</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Last Updated</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {savedDoses.length === 0 ? (
                  <tr><td colSpan={5} className="p-6 text-center text-gray-500">No saved applications found.</td></tr>
              ) : (
                  savedDoses.map(dose => {
                      const f = allFarmers.find(af => af.id === dose.farmerId);
                      const isExpanded = expandedDoseId === dose.id;
                      
                      return (
                          <React.Fragment key={dose.id}>
                            <tr className="hover:bg-gray-50 bg-white border-t">
                                <td className="px-4 py-3 font-medium">{f?.name || 'Unknown'}</td>
                                <td className="px-4 py-3 text-gray-600">{f?.village || '-'}</td>
                                <td className="px-4 py-3">{dose.acres}</td>
                                <td className="px-4 py-3 text-gray-500">{new Date(dose.date).toLocaleDateString()}</td>
                                <td className="px-4 py-3 flex justify-center gap-2">
                                    <button onClick={() => toggleExpand(dose.id)} className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors" title={isExpanded ? "Hide Details" : "View Details"}>
                                        {isExpanded ? <ChevronUp size={16}/> : <Eye size={16}/>}
                                    </button>
                                    <button onClick={() => handlePrint(dose)} className="p-2 text-purple-600 hover:bg-purple-50 rounded transition-colors" title="Print">
                                        <Printer size={16} />
                                    </button>
                                    <button onClick={() => handleEditDose(dose)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => handleDeleteDose(dose.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                            {isExpanded && (
                              <tr className="bg-gray-50">
                                <td colSpan={5} className="p-4 shadow-inner">
                                  <div className="border rounded bg-white overflow-hidden">
                                    <div className="bg-gray-100 px-4 py-2 text-xs font-bold text-gray-600 uppercase border-b">Activity Schedule Details</div>
                                    <table className="w-full text-xs text-left">
                                      <thead className="bg-gray-50 text-gray-500">
                                        <tr>
                                          <th className="p-2 border-b">Day</th>
                                          <th className="p-2 border-b">Type</th>
                                          <th className="p-2 border-b">Activity</th>
                                          <th className="p-2 border-b">Qty</th>
                                          <th className="p-2 border-b text-green-700">Applied Qty</th>
                                          <th className="p-2 border-b text-blue-700">Applied Bags</th>
                                          <th className="p-2 border-b">Status</th>
                                          <th className="p-2 border-b">Done Date</th>
                                          <th className="p-2 border-b text-center">Photo</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {dose.activities && dose.activities.map((act, idx) => (
                                          <tr key={idx} className="border-b last:border-0">
                                            <td className="p-2">{act.day}</td>
                                            <td className="p-2">{act.type}</td>
                                            <td className="p-2 font-medium">{act.activity}</td>
                                            <td className="p-2">{act.qty}</td>
                                            <td className="p-2 font-bold text-green-700">{act.appliedQty || '-'}</td>
                                            <td className="p-2 font-bold text-blue-700">{act.appliedBags || '-'}</td>
                                            <td className="p-2">
                                              {act.isDone ? 
                                                <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle size={12}/> Done</span> : 
                                                <span className="text-gray-400">Pending</span>
                                              }
                                            </td>
                                            <td className="p-2">{act.doneDate || '-'}</td>
                                            <td className="p-2 text-center">
                                              {act.photo ? (
                                                <img 
                                                  src={act.photo} 
                                                  className="w-8 h-8 object-cover rounded border cursor-zoom-in hover:scale-150 transition-transform" 
                                                  onClick={() => setViewPhoto(act.photo)}
                                                  alt="proof"
                                                />
                                              ) : (
                                                <span className="text-gray-300 text-[10px]">No Img</span>
                                              )}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
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
