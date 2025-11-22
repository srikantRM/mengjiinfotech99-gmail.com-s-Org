
import React, { useState, useEffect, ChangeEvent } from 'react';
import { Farmer, SoilHealth } from '../types';
import { db } from '../services/db';
import { FarmerSearch } from './FarmerSearch';
import { Save, Edit, Trash2, Printer, FileText } from 'lucide-react';

const emptySoilTest: SoilHealth = { 
    id: '', farmerId: '', sampleNumber: '', date: new Date().toISOString().split('T')[0], 
    waterSource: '', soilTexture: '', limeTest: '', 
    ph: '', organicCarbon: '', nitrateNitrogen: '', ammoniacalNitrogen: '', 
    phosphorus: '', potassium: '', sulphur: '', zinc: '', iron: '', boron: '', 
    remark: '', recommendation: '' 
};

const nutrientDefinitions = [
    { key: 'ph', label: '4. pH', options: [ {value: 'acidic', label: 'Acidic <6.0'}, {value: 'medium', label: 'Medium 6.0-7.5'}, {value: 'low-alk', label: 'Low alk. 7.6-8.5'}, {value: 'high-alk', label: 'High alk. >8.6'} ] },
    { key: 'organicCarbon', label: '5. Organic carbon', options: [ {value: 'low', label: 'Low <0.5'}, {value: 'medium', label: 'Medium 0.5-0.75'}, {value: 'high', label: 'High >0.75'} ] },
    { key: 'nitrateNitrogen', label: '6. Nitrate nitrogen- kg/acre', options: [ {value: 'low', label: 'Low 2-3'}, {value: 'medium', label: 'Medium 5-15'}, {value: 'high', label: 'High 15-20'} ] },
    { key: 'ammoniacalNitrogen', label: '7. Ammoniacal nitrogen- kg/acre', options: [ {value: 'low', label: 'Low 0-5'}, {value: 'medium', label: 'Medium 20-30'}, {value: 'high', label: 'High >50'} ] },
    { key: 'phosphorus', label: '8. Available P₂O₅- kg/acre', options: [ {value: 'low', label: 'Low <10'}, {value: 'medium', label: 'Medium 10-24'}, {value: 'high', label: 'High >24'} ] },
    { key: 'potassium', label: '9. Available K₂O- kg/acre', options: [ {value: 'low', label: 'Low <58'}, {value: 'medium', label: 'Medium 58-136'}, {value: 'high', label: 'High >136'} ] },
    { key: 'sulphur', label: '10. Available Sulphur (ppm)', options: [ {value: 'low', label: 'Low 0-10'}, {value: 'medium', label: 'Medium 10-15'}, {value: 'high', label: 'High >15'} ] },
    { key: 'zinc', label: '11. Available zinc (ppm)', options: [ {value: 'low', label: 'Low <0.65'}, {value: 'high', label: 'High >0.65'} ] },
    { key: 'iron', label: '12. Available iron (ppm)', options: [ {value: 'low', label: 'Low <5'}, {value: 'medium', label: 'Medium 5-20'}, {value: 'high', label: 'High >20'} ] },
    { key: 'boron', label: '13. Available boron (ppm)', options: [ {value: 'low', label: 'Low <0.5'}, {value: 'medium', label: 'Medium 0.5-2'}, {value: 'high', label: 'High >2'} ] },
];

const SimpleRadioGroup: React.FC<{name: keyof SoilHealth, label: string, options: {value: string, label: string}[], value: string, onChange: (name: keyof SoilHealth, val: string) => void}> = ({name, label, options, value, onChange}) => (
    <div className="border border-gray-200 p-3 rounded-md h-full flex flex-col justify-center bg-white shadow-sm">
        <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">{label}</label>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
            {options.map(opt => (
                 <div key={opt.value} className="flex items-center">
                    <input 
                        id={`${name}-${opt.value}`} 
                        name={name} 
                        type="radio" 
                        className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 cursor-pointer" 
                        checked={value === opt.value} 
                        onChange={() => onChange(name, opt.value)} 
                    />
                    <label htmlFor={`${name}-${opt.value}`} className="ml-2 block text-sm text-gray-800 cursor-pointer">{opt.label}</label>
                </div>
            ))}
        </div>
    </div>
);

const SoilHealthCard: React.FC<{ test: SoilHealth; farmer: Farmer | undefined, onBack: () => void }> = ({ test, farmer, onBack }) => {
    const Checkbox = ({ checked }: {checked: boolean}) => (
        <div className="w-5 h-5 border border-gray-600 flex items-center justify-center mr-1 text-xs">
            {checked && <span className="font-bold text-black">✓</span>}
        </div>
    );
    
    const renderOptions = (options: {value: string, label: string}[], value: string) => (
        <div className="flex flex-wrap gap-3 items-center">
            {options.map(opt => (
                <div key={opt.value} className="flex items-center">
                    <Checkbox checked={opt.value === value} />
                    <span className="text-sm">{opt.label}</span>
                </div>
            ))}
        </div>
    );

    return (
        <div className="bg-white p-8 max-w-4xl mx-auto">
            <div className="no-print mb-4 flex justify-between">
                <button onClick={onBack} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Back</button>
                <button onClick={() => window.print()} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"><Printer size={16}/> Print</button>
            </div>

            <div className="printable-area border-2 border-black p-6">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold uppercase border-b-2 border-black pb-2 inline-block">Soil Health Card</h1>
                    <p className="font-semibold mt-1">Soil Fertility Health Status</p>
                </div>
                <div className="flex justify-between mb-4 text-sm border border-black p-2">
                    <div className="space-y-1">
                        <p><strong>Farmer's name:</strong> {farmer?.name}</p>
                        <p><strong>Region/Area:</strong> {farmer?.village}</p>
                    </div>
                    <div className="space-y-1 text-right">
                        <p><strong>Sample no:</strong> {test.sampleNumber}</p>
                        <p><strong>Date:</strong> {test.date}</p>
                    </div>
                </div>

                <div className="space-y-3 mb-6 text-sm border border-black p-2">
                    <div className="flex items-center border-b border-dotted border-gray-400 pb-2">
                        <span className="w-48 font-bold">1. Water source:</span>
                        {renderOptions([{value:'rain-fed', label:'Rain-fed'}, {value:'canal', label:'Canal'}, {value:'pond', label:'Pond'}, {value:'well', label:'Well'}, {value:'bore-well', label:'Bore-well'}], test.waterSource)}
                    </div>
                    <div className="flex items-center border-b border-dotted border-gray-400 pb-2">
                        <span className="w-48 font-bold">2. Soil texture:</span>
                         {renderOptions([{value:'light', label:'Light (Sand)'}, {value:'medium', label:'Medium (Loam)'}, {value:'heavy', label:'Heavy (Clay)'}], test.soilTexture)}
                    </div>
                    <div className="flex items-center">
                        <span className="w-48 font-bold">3. Lime test:</span>
                         {renderOptions([{value:'less', label:'Less'}, {value:'moderate', label:'Moderate'}, {value:'high',label:'High'}], test.limeTest)}
                    </div>
                </div>

                <table className="w-full border-collapse border border-black text-sm">
                     <tbody>
                        {nutrientDefinitions.map(def => {
                            if (def.key === 'ph') {
                                return (
                                    <tr key="ph">
                                        <td className="border border-black p-2 font-bold w-48">4. pH</td>
                                        <td colSpan={4} className="border border-black p-2">
                                            {renderOptions(def.options, test.ph)}
                                        </td>
                                    </tr>
                                )
                            }
                            return (
                               <tr key={def.key}>
                                    <td className="border border-black p-2 font-bold">{def.label}</td>
                                    {def.options.map((opt:any) => (
                                        <td key={opt.value} className="border border-black p-2">
                                            <div className="flex items-center">
                                                <Checkbox checked={test[def.key as keyof SoilHealth] === opt.value} />
                                                <span>{opt.label}</span>
                                            </div>
                                        </td>
                                    ))}
                                    { def.key === 'zinc' && <td className="border border-black p-2 bg-gray-100"></td> }
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                
                <table className="w-full border-collapse border border-black text-sm mt-6">
                    <thead><tr><th className="border border-black p-2 text-left w-1/2 bg-gray-100">Remark</th><th className="border border-black p-2 text-left w-1/2 bg-gray-100">Recommendation</th></tr></thead>
                    <tbody>
                        <tr>
                            <td className="border border-black p-2 align-top h-32 whitespace-pre-wrap">{test.remark}</td>
                            <td className="border border-black p-2 align-top h-32 whitespace-pre-wrap">{test.recommendation}</td>
                        </tr>
                    </tbody>
                </table>
                <div className="mt-8 text-center text-xs text-gray-500">Generated by AgriSmart Farm Management System</div>
            </div>
        </div>
    );
};

const SoilTestList: React.FC<{ soilTests: SoilHealth[], farmers: Farmer[], onEdit: (t: SoilHealth) => void, onDelete: (id: string) => void, onPrint: (t: SoilHealth) => void }> = ({ soilTests, farmers, onEdit, onDelete, onPrint }) => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="font-bold text-gray-700">Saved Soil Tests</h3>
        </div>
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Farmer</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Sample #</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">pH</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Org. C</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {soilTests.length === 0 && (
                    <tr><td colSpan={6} className="p-6 text-center text-gray-500">No soil tests recorded yet.</td></tr>
                )}
                {soilTests.map(test => {
                    const farmer = farmers.find(f => f.id === test.farmerId);
                    return (
                        <tr key={test.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">{farmer?.name || 'Unknown'}</td>
                            <td className="px-4 py-3">{test.sampleNumber}</td>
                            <td className="px-4 py-3">{test.date}</td>
                            <td className="px-4 py-3 capitalize">{test.ph}</td>
                            <td className="px-4 py-3 capitalize">{test.organicCarbon}</td>
                            <td className="px-4 py-3 space-x-2">
                                <button onClick={() => onEdit(test)} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Edit size={16}/></button>
                                <button onClick={() => onDelete(test.id)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={16}/></button>
                                <button onClick={() => onPrint(test)} className="text-purple-600 hover:bg-purple-50 p-1 rounded"><Printer size={16}/></button>
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
        </div>
    </div>
);

export const SoilHealthForm = () => {
    const [test, setTest] = useState<SoilHealth>(emptySoilTest);
    const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
    const [view, setView] = useState<'FORM' | 'PRINT'>('FORM');
    const [printData, setPrintData] = useState<SoilHealth | null>(null);
    const [allTests, setAllTests] = useState<SoilHealth[]>([]);
    const [farmers, setFarmers] = useState<Farmer[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [tests, farms] = await Promise.all([db.getSoil(), db.getFarmers()]);
        setAllTests(tests);
        setFarmers(farms);
    };

    const handleSelectFarmer = (farmer: Farmer) => {
        setSelectedFarmer(farmer);
        setTest(prev => ({ ...prev, farmerId: farmer.id }));
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTest(prev => ({ ...prev, [name]: value }));
    };
    
    const handleRadioChange = (name: keyof SoilHealth, value: string) => {
        setTest(prev => ({...prev, [name]: value}));
    };

    const handleSave = async () => {
        if (!selectedFarmer) {
            alert('Please select a farmer first.');
            return;
        }
        const testToSave = { ...test, farmerId: selectedFarmer.id };
        if (!testToSave.id) {
            testToSave.id = `ST${Date.now()}`;
        }
        await db.saveSoil(testToSave);
        await loadData();
        setTest(emptySoilTest);
        setSelectedFarmer(null);
        alert('Soil Test Saved!');
    };

    const handleEdit = (t: SoilHealth) => {
        setTest(t);
        const f = farmers.find(farmer => farmer.id === t.farmerId);
        setSelectedFarmer(f || null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if(window.confirm('Delete this soil test?')) {
            await db.deleteSoil(id);
            loadData();
        }
    };

    const handlePrint = (t: SoilHealth) => {
        setPrintData(t);
        setView('PRINT');
    };

    if (view === 'PRINT' && printData) {
        const f = farmers.find(farmer => farmer.id === printData.farmerId);
        return <SoilHealthCard test={printData} farmer={f} onBack={() => setView('FORM')} />;
    }
    
    return (
        <div className="space-y-8 pb-10">
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-600">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FileText size={24} className="text-green-600"/>
                        {test.id ? 'Edit Soil Test' : 'New Soil Test'}
                    </h2>
                </div>

                <div className="mb-6 w-full md:w-1/2">
                    <FarmerSearch 
                        onSelect={handleSelectFarmer} 
                        onClear={() => {setSelectedFarmer(null); setTest(emptySoilTest);}} 
                        selectedFarmer={selectedFarmer}
                        label="Select Farmer"
                    />
                </div>
                
                {selectedFarmer && (
                    <div className="animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sample Number</label>
                                <input name="sampleNumber" value={test.sampleNumber} onChange={handleChange} className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Test Date</label>
                                <input name="date" type="date" value={test.date} onChange={handleChange} className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 outline-none" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <SimpleRadioGroup name="waterSource" label="1. Water Source" options={[{value:'rain-fed', label:'Rain-fed'}, {value:'canal', label:'Canal'}, {value:'pond', label:'Pond'}, {value:'well', label:'Well'}, {value:'bore-well', label:'Bore-well'}]} value={test.waterSource} onChange={handleRadioChange} />
                            <SimpleRadioGroup name="soilTexture" label="2. Soil Texture" options={[{value:'light', label:'Light (Sand)'}, {value:'medium', label:'Medium (Loam)'}, {value:'heavy', label:'Heavy (Clay)'}]} value={test.soilTexture} onChange={handleRadioChange} />
                            <SimpleRadioGroup name="limeTest" label="3. Lime Test" options={[{value:'less', label:'Less'}, {value:'moderate', label:'Moderate'}, {value:'high', label:'High'}]} value={test.limeTest} onChange={handleRadioChange} />
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2 mt-8">Nutrient Analysis</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {nutrientDefinitions.map(def => (
                                <SimpleRadioGroup 
                                    key={def.key}
                                    name={def.key as keyof SoilHealth}
                                    label={def.label}
                                    options={def.options}
                                    value={test[def.key as keyof SoilHealth] as string}
                                    onChange={handleRadioChange}
                                />
                            ))}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            <div>
                                <label htmlFor="remark" className="block text-sm font-bold text-gray-700 mb-2">Remark</label>
                                <textarea id="remark" name="remark" rows={4} value={test.remark} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"></textarea>
                            </div>
                            <div>
                                <label htmlFor="recommendation" className="block text-sm font-bold text-gray-700 mb-2">Recommendation</label>
                                <textarea id="recommendation" name="recommendation" rows={4} value={test.recommendation} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"></textarea>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end space-x-3 border-t pt-4">
                            {test.id && <button className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200" onClick={() => {setTest(emptySoilTest); setSelectedFarmer(null);}}>Cancel</button>}
                            <button onClick={handleSave} className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 flex items-center gap-2">
                                <Save size={20}/> {test.id ? 'Update Test' : 'Save Test'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <SoilTestList 
                soilTests={allTests} 
                farmers={farmers} 
                onEdit={handleEdit} 
                onDelete={handleDelete}
                onPrint={handlePrint}
            />
        </div>
    );
};
