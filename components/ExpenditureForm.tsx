
import React, { useState } from 'react';
import { db } from '../services/db';
import { Expenditure } from '../types';
import { Save, CheckCircle, PlusCircle } from 'lucide-react';

export const ExpenditureForm = () => {
  const [form, setForm] = useState({ headName: '', particulars: '', date: '', amount: '', paymentType: 'Cash' });
  const [msg, setMsg] = useState('');

  const save = async () => {
    if(!form.amount || !form.headName) {
        alert("Head Name and Amount are required");
        return;
    }
    const newItem: Expenditure = {
        id: Date.now().toString(),
        headName: form.headName,
        particulars: form.particulars,
        date: form.date || new Date().toISOString().split('T')[0],
        amount: parseFloat(form.amount),
        paymentType: form.paymentType as any
    };
    await db.saveExpenditure(newItem);
    
    setMsg("Expenditure Saved Successfully!");
    setTimeout(() => setMsg(''), 3000);
    
    setForm({ headName: '', particulars: '', date: '', amount: '', paymentType: 'Cash' });
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

       <div className="bg-white p-8 rounded-lg shadow-md border-t-4 border-red-600">
         <h3 className="font-bold text-xl mb-6 text-red-800 flex items-center gap-2">
            <PlusCircle /> Record New Expenditure
         </h3>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Head Name</label>
                <input 
                    className="border p-3 rounded w-full focus:ring-2 focus:ring-red-500 outline-none" 
                    placeholder="e.g. Salary, Electricity, Fuel"
                    value={form.headName} 
                    onChange={e=>setForm({...form, headName: e.target.value})} 
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Particulars / Description</label>
                <input 
                    className="border p-3 rounded w-full focus:ring-2 focus:ring-red-500 outline-none" 
                    placeholder="Details about the expense..."
                    value={form.particulars} 
                    onChange={e=>setForm({...form, particulars: e.target.value})} 
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Date</label>
                <input 
                    type="date" 
                    className="border p-3 rounded w-full focus:ring-2 focus:ring-red-500 outline-none" 
                    value={form.date} 
                    onChange={e=>setForm({...form, date: e.target.value})} 
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Amount (₹)</label>
                <input 
                    type="number" 
                    className="border p-3 rounded w-full focus:ring-2 focus:ring-red-500 outline-none" 
                    placeholder="0.00"
                    value={form.amount} 
                    onChange={e=>setForm({...form, amount: e.target.value})} 
                />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Payment Type</label>
              <select 
                className="border p-3 rounded w-full focus:ring-2 focus:ring-red-500 outline-none bg-white" 
                value={form.paymentType} 
                onChange={e=>setForm({...form, paymentType: e.target.value})}
              >
                  <option>Cash</option>
                  <option>Cheque</option>
                  <option>Online</option>
              </select>
            </div>
         </div>
         
         <div className="mt-8 border-t pt-4 flex justify-end">
            <button onClick={save} className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded shadow-lg flex items-center gap-2 transition-all transform active:scale-95">
                <Save size={20} /> Save Expense
            </button>
         </div>
       </div>
       
       <div className="text-center text-sm text-gray-500">
          To view past records, go to the <strong>Expenditure Report</strong> section.
       </div>
    </div>
  );
};
