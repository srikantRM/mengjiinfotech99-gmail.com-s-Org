
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { db } from '../services/db';
import { Plus, Save, Trash2, Edit } from 'lucide-react';

export const ProductMaster = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ id: '', name: '', company: '', rate: '' });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const data = await db.getProducts();
    setProducts(data);
  };

  const handleSave = async () => {
    if (!form.name || !form.rate) return;
    const p: Product = {
      id: form.id || Date.now().toString(),
      name: form.name,
      company: form.company,
      rate: parseFloat(form.rate)
    };
    await db.saveProduct(p);
    await loadProducts();
    setForm({ id: '', name: '', company: '', rate: '' });
  };

  const handleEdit = (p: Product) => {
    setForm({
      id: p.id,
      name: p.name,
      company: p.company,
      rate: p.rate.toString()
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if(window.confirm("Delete this product?")) {
      await db.deleteProduct(id);
      await loadProducts();
      if(form.id === id) {
        setForm({ id: '', name: '', company: '', rate: '' });
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded shadow-md border-t-4 border-green-600">
        <h3 className="text-lg font-bold mb-4 text-green-800">{form.id ? 'Update Product' : 'Add New Product'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Product Name</label>
            <input 
                className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 outline-none" 
                placeholder="e.g. Urea" 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Company</label>
            <input 
                className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 outline-none" 
                placeholder="e.g. IFFCO" 
                value={form.company} 
                onChange={e => setForm({...form, company: e.target.value})} 
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Rate (₹)</label>
            <input 
                className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 outline-none" 
                type="number" 
                placeholder="0.00" 
                value={form.rate} 
                onChange={e => setForm({...form, rate: e.target.value})} 
            />
          </div>
          <div>
             <button onClick={handleSave} className={`w-full text-white py-2 px-4 rounded shadow flex justify-center items-center gap-2 ${form.id ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}>
                {form.id ? <Save size={18}/> : <Plus size={18}/>} 
                {form.id ? 'Update' : 'Add Product'}
             </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow-md">
        <h3 className="text-lg font-bold mb-4 text-gray-700 border-b pb-2">Product Inventory</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                <th className="p-3 border-b">Product Name</th>
                <th className="p-3 border-b">Company</th>
                <th className="p-3 border-b">Rate (₹)</th>
                <th className="p-3 border-b text-center">Action</th>
                </tr>
            </thead>
            <tbody>
                {products.length === 0 && (
                    <tr><td colSpan={4} className="p-4 text-center text-gray-400">No products in inventory.</td></tr>
                )}
                {products.map(p => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-800">{p.name}</td>
                    <td className="p-3 text-gray-500">{p.company}</td>
                    <td className="p-3 font-bold text-green-700">₹{p.rate}</td>
                    <td className="p-3 text-center flex justify-center gap-2">
                         <button onClick={() => handleEdit(p)} className="text-blue-500 hover:bg-blue-50 p-2 rounded"><Edit size={16}/></button>
                         <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};
