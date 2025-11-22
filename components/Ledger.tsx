
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Farmer, Plantation, ServiceTask, Sale } from '../types';
import { Printer, ArrowLeft, UserCircle } from 'lucide-react';
import { FarmerSearch } from './FarmerSearch';

const LedgerPrintView: React.FC<{ 
  data: { farmer: Farmer, plantations: Plantation[], services: ServiceTask[], sales: Sale[] }, 
  user: { username: string, role: string } | null,
  onBack: () => void 
}> = ({ data, user, onBack }) => {
  
  useEffect(() => {
    const timer = setTimeout(() => {
        window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white min-h-screen text-black font-serif">
      <div className="no-print bg-gray-100 p-4 border-b flex justify-between items-center mb-8 shadow-sm">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-700 hover:text-black font-semibold bg-white px-4 py-2 rounded border">
            <ArrowLeft size={20} /> Back to Ledger
        </button>
        <button onClick={() => window.print()} className="bg-gray-800 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-black shadow">
            <Printer size={18} /> Print Now
        </button>
      </div>

      <div className="printable-area max-w-[210mm] mx-auto p-8 bg-white">
        <div className="text-center border-b-2 border-black pb-4 mb-6">
            <h1 className="text-3xl font-bold uppercase tracking-wider">Farmer General Ledger</h1>
            <p className="text-gray-600 text-sm mt-1">AgriSmart Farm Management System</p>
        </div>

        <div className="mb-8 p-4 border border-black rounded bg-gray-50">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Farmer Profile</p>
                    <p className="text-xl font-bold">{data.farmer.name}</p>
                    <p>{data.farmer.village} | {data.farmer.phone}</p>
                    <p className="text-sm">NSL Code: <span className="font-mono font-bold">{data.farmer.nslCode}</span></p>
                </div>
                <div className="text-right space-y-1">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Land Details</p>
                    <p className="text-xl font-bold">{data.farmer.totalLand} Acres</p>
                    <p className="text-sm">Survey No: {data.farmer.surveyNo}</p>
                </div>
            </div>
        </div>

        <div className="mb-8">
            <h3 className="font-bold text-lg mb-2 border-b border-black pb-1 flex justify-between items-center">
                <span>1. Completed Crop Activities</span>
                <span className="text-xs font-normal bg-gray-200 px-2 rounded">Total: {data.services.length}</span>
            </h3>
            <table className="w-full text-sm border-collapse border border-black">
                <thead className="bg-gray-200 text-xs uppercase">
                    <tr>
                        <th className="border border-black p-2 text-left w-32">Date</th>
                        <th className="border border-black p-2 text-left">Activity</th>
                        <th className="border border-black p-2 text-left">Details</th>
                    </tr>
                </thead>
                <tbody>
                    {data.services.length === 0 && <tr><td colSpan={3} className="p-4 text-center italic text-gray-500">No records found.</td></tr>}
                    {data.services.map(s => (
                        <tr key={s.id}>
                            <td className="border border-black p-2 text-xs">
                                {s.doneDate}
                            </td>
                            <td className="border border-black p-2 font-medium">{s.activityName}</td>
                            <td className="border border-black p-2 text-xs">{s.details}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <div className="mb-8">
            <h3 className="font-bold text-lg mb-2 border-b border-black pb-1 flex justify-between items-center">
                <span>2. Purchase History (Inputs)</span>
                <span className="text-xs font-normal bg-gray-200 px-2 rounded">Total: {data.sales.length}</span>
            </h3>
            <table className="w-full text-sm border-collapse border border-black">
                <thead className="bg-gray-200 text-xs uppercase">
                    <tr>
                        <th className="border border-black p-2 text-left w-24">Date</th>
                        <th className="border border-black p-2 text-left">Items Purchased</th>
                        <th className="border border-black p-2 text-center w-20">Mode</th>
                        <th className="border border-black p-2 text-right w-24">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {data.sales.length === 0 && <tr><td colSpan={4} className="p-4 text-center italic text-gray-500">No purchases found.</td></tr>}
                    {data.sales.map(s => (
                        <tr key={s.id}>
                            <td className="border border-black p-2">{s.invoiceDate}</td>
                            <td className="border border-black p-2">
                                {s.items.map(i => <div key={i.productId}>• {i.productName} ({i.quantity})</div>)}
                            </td>
                            <td className="border border-black p-2 text-center uppercase text-xs">{s.paymentMode}</td>
                            <td className="border border-black p-2 text-right font-bold">₹{s.totalAmount}</td>
                        </tr>
                    ))}
                    {data.sales.length > 0 && (
                        <tr className="bg-gray-100 font-bold">
                            <td colSpan={3} className="border border-black p-2 text-right">Total Expenditure:</td>
                            <td className="border border-black p-2 text-right">
                                ₹{data.sales.reduce((sum, s) => sum + s.totalAmount, 0)}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        <div className="mt-16 flex justify-between text-sm pt-8">
            <div className="text-center">
                <div className="w-48 border-b border-black mb-2"></div>
                <p className="font-semibold">Farmer Signature</p>
            </div>
            <div className="text-center">
                <div className="w-48 border-b border-black mb-2"></div>
                <p className="font-semibold">Field Officer Signature</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export const Ledger = () => {
  const [data, setData] = useState<{
    farmer: Farmer | null,
    plantations: Plantation[],
    services: ServiceTask[],
    sales: Sale[]
  } | null>(null);
  
  const [zoomImg, setZoomImg] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [currentUser, setCurrentUser] = useState<{username: string, role: string} | null>(null);

  useEffect(() => {
      const userStr = localStorage.getItem('agri_user');
      if (userStr) {
          setCurrentUser(JSON.parse(userStr));
      }
  }, []);

  const handleSelect = async (f: Farmer) => {
    const plantations = await db.getPlantationsByFarmer(f.id);
    
    const servicesNested = await Promise.all(plantations.map(p => db.getServices(p.id)));
    const services = servicesNested.flat().filter(s => s.isDone);
      
    const sales = await db.getSales(f.id);
    
    setData({ farmer: f, plantations, services, sales });
  };

  const handleClear = () => {
    setData(null);
  };

  if (isPrinting && data && data.farmer) {
      return <LedgerPrintView data={data as any} user={currentUser} onBack={() => setIsPrinting(false)} />;
  }

  return (
    <div className="space-y-6 pb-10">
      {zoomImg && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setZoomImg(null)}>
          <img src={zoomImg} className="max-w-full max-h-full rounded shadow-2xl" alt="Enlarged" />
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-600 no-print flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full md:max-w-xl">
            <FarmerSearch 
                onSelect={handleSelect} 
                onClear={handleClear} 
                selectedFarmer={data?.farmer}
                label="Search Farmer for Ledger"
            />
        </div>
        {data && (
            <button onClick={() => setIsPrinting(true)} className="bg-gray-800 text-white px-6 py-2 rounded flex items-center gap-2 mt-4 md:mt-0 hover:bg-black shadow-lg transition-colors">
                <Printer size={18}/> Print Ledger
            </button>
        )}
      </div>

      {data && data.farmer && (
        <div className="bg-white p-8 rounded-lg shadow-md animate-fade-in">
          <div className="text-center border-b pb-4 mb-6 relative">
            <h2 className="text-2xl font-bold text-gray-800">Farmer General Ledger</h2>
            <p className="text-gray-500">Consolidated Report</p>
            <div className="absolute right-0 top-0 text-xs text-gray-400 flex items-center gap-1">
                <UserCircle size={12} />
                {currentUser?.username}
            </div>
          </div>

          <div className="mb-8 p-4 bg-gray-50 rounded border border-gray-200">
            <h3 className="font-bold text-lg mb-2 text-green-700 border-b border-gray-200 pb-2">Farmer Profile</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><span className="text-gray-500 block text-xs uppercase">Name</span><span className="font-semibold">{data.farmer.name}</span></div>
              <div><span className="text-gray-500 block text-xs uppercase">Phone</span><span className="font-semibold">{data.farmer.phone}</span></div>
              <div><span className="text-gray-500 block text-xs uppercase">Village</span><span className="font-semibold">{data.farmer.village}</span></div>
              <div><span className="text-gray-500 block text-xs uppercase">Total Land</span><span className="font-semibold">{data.farmer.totalLand} Acres</span></div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-bold text-lg mb-4 text-blue-700 border-b pb-1 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{data.services.length}</span>
                Completed Field Activities
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                    <th className="border p-2 text-left w-48">Date</th>
                    <th className="border p-2 text-left">Activity</th>
                    <th className="border p-2 text-left">Details</th>
                    <th className="border p-2 text-center">Photo</th>
                    </tr>
                </thead>
                <tbody>
                    {data.services.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-500">No completed activities recorded.</td></tr>}
                    {data.services.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                        <td className="border p-2">
                            <div className="font-medium">{s.doneDate}</div>
                        </td>
                        <td className="border p-2 font-medium text-gray-800">{s.activityName}</td>
                        <td className="border p-2 text-xs text-gray-500">{s.details}</td>
                        <td className="border p-2 text-center">
                        {s.photoUrl ? (
                            <img 
                            src={s.photoUrl} 
                            alt="Proof" 
                            className="h-10 w-10 object-cover mx-auto cursor-zoom-in border rounded-md shadow-sm hover:scale-150 transition-transform bg-white"
                            onClick={() => setZoomImg(s.photoUrl || null)} 
                            />
                        ) : <span className="text-gray-300 text-xs">-</span>}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-purple-700 border-b pb-1 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">{data.sales.length}</span>
                Purchase History
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                    <th className="border p-2 text-left w-32">Date</th>
                    <th className="border p-2 text-left">Items</th>
                    <th className="border p-2 text-right w-32">Total Amount</th>
                    <th className="border p-2 text-center w-24">Mode</th>
                    </tr>
                </thead>
                <tbody>
                    {data.sales.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-500">No purchases found.</td></tr>}
                    {data.sales.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                        <td className="border p-2">{s.invoiceDate}</td>
                        <td className="border p-2">
                        {s.items.map(i => <div key={i.productId} className="flex items-center gap-2"><span className="w-1 h-1 bg-gray-400 rounded-full"></span> {i.productName} <span className="text-xs text-gray-500">(x{i.quantity})</span></div>)}
                        </td>
                        <td className="border p-2 text-right font-mono">₹{s.totalAmount}</td>
                        <td className="border p-2 text-center"><span className="px-2 py-1 rounded bg-gray-200 text-xs font-medium uppercase">{s.paymentMode}</span></td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
