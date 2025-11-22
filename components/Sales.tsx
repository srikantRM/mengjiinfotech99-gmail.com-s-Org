
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Farmer, Product, Sale } from '../types';
import { Plus, Trash, Printer, ShoppingCart } from 'lucide-react';
import { FarmerSearch } from './FarmerSearch';

// Export for type safety in cart
export interface SaleItem {
  productId: string;
  productName: string;
  rate: number;
  quantity: number;
  amount: number;
}

const SaleBillPrint: React.FC<{ sale: Sale; farmer: Farmer; onNewSale: () => void }> = ({ sale, farmer, onNewSale }) => {
  useEffect(() => {
    setTimeout(() => window.print(), 500);
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <div className="no-print p-4 bg-gray-100 border-b flex justify-between items-center shadow-sm">
        <h2 className="font-bold text-green-800">Sale Completed Successfully</h2>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="bg-gray-800 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-black">
            <Printer size={18}/> Print Bill
          </button>
          <button onClick={onNewSale} className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700 shadow">
            <Plus size={18}/> New Sale
          </button>
        </div>
      </div>

      <div className="printable-area p-8 max-w-3xl mx-auto bg-white">
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-4xl font-extrabold uppercase tracking-tight text-black">XYZ Company</h1>
          <p className="text-lg font-semibold text-gray-800 mt-1">Khuba Plot</p>
          <div className="mt-6 pt-4 border-t border-gray-300 w-2/3 mx-auto">
             <h2 className="text-xl font-bold uppercase tracking-widest">Tax Invoice / Bill</h2>
          </div>
        </div>

        <div className="flex justify-between mb-8">
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold">Bill To:</p>
            <p className="font-bold text-lg">{farmer.name}</p>
            <p className="text-sm">{farmer.village}</p>
            <p className="text-sm">Phone: {farmer.phone}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase font-bold">Invoice Details:</p>
            <p className="font-bold">Ref: #{sale.id.slice(-6)}</p>
            <p className="text-sm">Date: {sale.invoiceDate}</p>
            <p className="text-sm font-bold uppercase mt-1">Mode: {sale.paymentMode}</p>
          </div>
        </div>

        <table className="w-full text-sm border-collapse border border-black mb-6">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-black p-2 text-left">Product</th>
              <th className="border border-black p-2 text-center">Qty</th>
              <th className="border border-black p-2 text-right">Rate</th>
              <th className="border border-black p-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item, idx) => (
              <tr key={idx}>
                <td className="border border-black p-2">{item.productName}</td>
                <td className="border border-black p-2 text-center">{item.quantity}</td>
                <td className="border border-black p-2 text-right">{item.rate.toFixed(2)}</td>
                <td className="border border-black p-2 text-right">{item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-bold text-lg">
              <td colSpan={3} className="border border-black p-2 text-right">Total:</td>
              <td className="border border-black p-2 text-right">₹{sale.totalAmount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-12 flex justify-between text-sm pt-8">
            <div className="text-center">
                <div className="w-40 border-b border-black mb-2"></div>
                <p>Customer Signature</p>
            </div>
            <div className="text-center">
                <div className="w-40 border-b border-black mb-2"></div>
                <p>Authorized Signatory</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export const Sales = () => {
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [selectedPid, setSelectedPid] = useState('');
  const [qty, setQty] = useState(1);

  const [completedSale, setCompletedSale] = useState<{sale: Sale, farmer: Farmer} | null>(null);

  useEffect(() => {
    db.getProducts().then(setProducts);
  }, []);

  const addToCart = () => {
    const prod = products.find(p => p.id === selectedPid);
    if(!prod) return;
    const item: SaleItem = {
      productId: prod.id,
      productName: prod.name,
      rate: prod.rate,
      quantity: qty,
      amount: prod.rate * qty
    };
    setCart([...cart, item]);
    setSelectedPid('');
    setQty(1);
  };

  const total = cart.reduce((sum, item) => sum + item.amount, 0);

  const handleCheckout = async (mode: 'Cash' | 'Credit' | 'UPI') => {
    if(!farmer || cart.length === 0) return;
    
    const saleData: Sale = {
      id: Date.now().toString(),
      farmerId: farmer.id,
      invoiceDate: new Date().toLocaleDateString(),
      items: cart,
      totalAmount: total,
      paymentMode: mode
    };

    await db.saveSale(saleData);
    setCompletedSale({ sale: saleData, farmer: farmer });
  };

  const handleNewSale = () => {
    setCompletedSale(null);
    setCart([]);
    setFarmer(null);
  };

  if (completedSale) {
    return <SaleBillPrint sale={completedSale.sale} farmer={completedSale.farmer} onNewSale={handleNewSale} />;
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="bg-white p-6 rounded shadow-md border-t-4 border-green-600">
        <div className="flex flex-col md:flex-row gap-6">
            
            <div className="flex-1">
                <h3 className="text-lg font-bold text-green-800 mb-4">1. Select Customer</h3>
                <FarmerSearch 
                    onSelect={setFarmer} 
                    onClear={() => setFarmer(null)} 
                    selectedFarmer={farmer}
                    label="Search Farmer"
                />
                {farmer && (
                    <div className="mt-4 bg-green-50 border border-green-200 p-3 rounded text-sm animate-fade-in">
                        <p className="font-bold text-green-800">{farmer.name}</p>
                        <p className="text-gray-600">{farmer.phone} | {farmer.village}</p>
                    </div>
                )}
            </div>

            <div className="flex-1 border-l md:pl-6 border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">2. Add Products</h3>
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Select Product</label>
                        <select 
                            className="border p-2 rounded w-full focus:ring-2 focus:ring-green-500 outline-none bg-white" 
                            value={selectedPid} 
                            onChange={e => setSelectedPid(e.target.value)}
                        >
                        <option value="">-- Choose Product --</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} - ₹{p.rate}</option>)}
                        </select>
                    </div>
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                             <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Quantity</label>
                             <input 
                                type="number" 
                                className="border p-2 rounded w-full focus:ring-2 focus:ring-green-500 outline-none" 
                                value={qty} 
                                min={1} 
                                onChange={e => setQty(parseInt(e.target.value))} 
                                placeholder="Qty"
                            />
                        </div>
                        <button onClick={addToCart} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors flex items-center gap-2 h-10 shadow">
                            <Plus size={18} /> Add
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded shadow-md">
        <div className="border-b pb-4 mb-4 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart size={24}/> Invoice Preview</h2>
          <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b-2 border-gray-200 text-left text-gray-600 uppercase text-xs">
                <th className="py-3">Product</th>
                <th className="py-3 text-center">Quantity</th>
                <th className="py-3 text-right">Rate</th>
                <th className="py-3 text-right">Amount</th>
                <th className="py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {cart.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-gray-400 italic bg-gray-50 rounded">Cart is empty. Add items above.</td></tr>}
              {cart.map((item, idx) => (
                <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 font-medium">{item.productName}</td>
                  <td className="py-3 text-center">{item.quantity}</td>
                  <td className="py-3 text-right text-gray-500">₹{item.rate}</td>
                  <td className="py-3 text-right font-bold text-gray-800">₹{item.amount}</td>
                  <td className="py-3 text-right">
                      <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50">
                          <Trash size={16}/>
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t-2 border-gray-800 pt-4">
          <div className="flex justify-end items-center gap-8 text-2xl font-bold mb-8 text-gray-900">
            <span>Total Payable:</span>
            <span>₹{total}</span>
          </div>
          
          <div className="flex flex-col justify-end items-end">
             <p className="text-xs font-bold text-gray-500 uppercase mb-2">Select Payment Mode to Complete Sale & Print Bill</p>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full md:w-2/3">
                <button onClick={() => handleCheckout('Cash')} disabled={cart.length === 0} className="bg-green-600 disabled:opacity-50 text-white py-3 rounded hover:bg-green-700 shadow font-medium transition-transform active:scale-95">Cash Pay</button>
                <button onClick={() => handleCheckout('UPI')} disabled={cart.length === 0} className="bg-blue-600 disabled:opacity-50 text-white py-3 rounded hover:bg-blue-700 shadow font-medium transition-transform active:scale-95">UPI Pay</button>
                <button onClick={() => handleCheckout('Credit')} disabled={cart.length === 0} className="bg-orange-600 disabled:opacity-50 text-white py-3 rounded hover:bg-orange-700 shadow font-medium transition-transform active:scale-95">Credit</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
