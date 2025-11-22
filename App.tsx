
import React, { useState, useEffect } from 'react';
import { User, UserRole, Farmer } from './types';
import { 
  Users, Sprout, FileSpreadsheet, 
  ClipboardList, ShoppingCart, BadgeDollarSign, 
  LogOut, Menu, FlaskConical, Droplets, Printer, LayoutDashboard
} from 'lucide-react';

// Components
import { Login } from './components/Login';
import { FarmerRegistration } from './components/FarmerRegistration';
import { Plantation } from './components/Plantation';
import { ServiceSchedule } from './components/ServiceSchedule';
import { SoilHealthForm } from './components/SoilHealthForm';
import { Ledger } from './components/Ledger';
import { Sales } from './components/Sales';
import { ProductMaster } from './components/ProductMaster';
import { ExpenditureForm } from './components/ExpenditureForm';
import { ExpenditureReport } from './components/ExpenditureReport';
import { BycellForm } from './components/BycellForm';

type View = 'HOME' | 'FARMERS' | 'BYCELL' | 'PLANTATION' | 'SOIL' | 'SERVICE' | 'LEDGER' | 'PRODUCTS' | 'SALES' | 'EXPENDITURE' | 'EXPENDITURE_REPORT';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  
  // Initialize view from storage or default to HOME
  const [currentView, setCurrentView] = useState<View>(() => {
    return (localStorage.getItem('agri_current_view') as View) || 'HOME';
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Check session
  useEffect(() => {
    const saved = localStorage.getItem('agri_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  // Persist view change
  useEffect(() => {
    localStorage.setItem('agri_current_view', currentView);
  }, [currentView]);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('agri_user', JSON.stringify(u));
    setCurrentView('HOME'); // Default to Home screen on login
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('agri_user');
    localStorage.removeItem('agri_current_view');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Sidebar Navigation Item
  const NavItem = ({ view, icon: Icon, label, roleReq }: { view: View, icon: any, label: string, roleReq?: string[] }) => {
    if (roleReq && !roleReq.includes(user.role) && user.role !== UserRole.ADMIN) return null;
    
    return (
      <button
        onClick={() => { setCurrentView(view); if(window.innerWidth < 768) setIsSidebarOpen(false); }}
        className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${currentView === view ? 'bg-green-700 text-white' : 'text-gray-600 hover:bg-green-50'}`}
      >
        <Icon size={20} />
        <span className={`${!isSidebarOpen && 'md:hidden'} whitespace-nowrap`}>{label}</span>
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 text-gray-900 flex-shrink-0 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-16'} flex flex-col shadow-xl z-20 print:hidden`}>
        <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
          <div className={`flex items-center gap-2 ${!isSidebarOpen && 'md:hidden'}`}>
            <Sprout className="text-green-700" />
            <h1 className="font-bold text-lg text-green-800">AgriSmart</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 rounded hover:bg-gray-100 text-gray-600">
            <Menu size={20} />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-2 text-xs text-gray-400 font-bold uppercase hidden md:block">MAIN</div>
          <NavItem view="HOME" icon={LayoutDashboard} label="Dashboard" />

          <div className="mt-4 px-4 mb-2 text-xs text-gray-400 font-bold uppercase hidden md:block">Farmer & Field</div>
          <NavItem view="FARMERS" icon={Users} label="Farmer Registration" />
          <NavItem view="SOIL" icon={FlaskConical} label="Soil Testing" />
          <NavItem view="BYCELL" icon={Droplets} label="ByCell Dose Application" roleReq={[UserRole.ADMIN]} />
          <NavItem view="PLANTATION" icon={Sprout} label="Plantation" />
          <NavItem view="SERVICE" icon={ClipboardList} label="Crop Activity Log" roleReq={[UserRole.ADMIN, UserRole.FIELD_OFFICER]} />
          
          <div className="mt-4 px-4 mb-2 text-xs text-gray-400 font-bold uppercase hidden md:block">Finance & Inventory</div>
          <NavItem view="LEDGER" icon={FileSpreadsheet} label="Ledger" />
          <NavItem view="PRODUCTS" icon={ShoppingCart} label="Product Master" />
          <NavItem view="SALES" icon={BadgeDollarSign} label="Sale Form" />
          <NavItem view="EXPENDITURE" icon={BadgeDollarSign} label="Expenditure Entry" roleReq={[UserRole.ADMIN]} />
          <NavItem view="EXPENDITURE_REPORT" icon={Printer} label="Expenditure Report" roleReq={[UserRole.ADMIN]} />
        </nav>

        <div className="p-4 border-t border-gray-200 bg-white">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-sm font-bold text-white">
              {user.username[0].toUpperCase()}
            </div>
            <div className={`${!isSidebarOpen && 'hidden'} overflow-hidden`}>
              <p className="text-sm font-medium truncate text-gray-800">{user.username}</p>
              <p className="text-xs text-gray-500 truncate">{user.role}</p>
            </div>
            <button onClick={handleLogout} className="ml-auto text-gray-400 hover:text-red-500">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white shadow h-16 flex items-center px-6 justify-between print:hidden z-10 relative border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {currentView === 'HOME' && 'Dashboard'}
            {currentView === 'FARMERS' && 'Farmer Registration'}
            {currentView === 'BYCELL' && 'ByCell Dose Application'}
            {currentView === 'PLANTATION' && 'Plantation Application'}
            {currentView === 'SOIL' && 'Soil Health Card'}
            {currentView === 'SERVICE' && 'Crop Activity Log'}
            {currentView === 'LEDGER' && 'Farmer Ledger'}
            {currentView === 'PRODUCTS' && 'Product Master'}
            {currentView === 'SALES' && 'Sale Form'}
            {currentView === 'EXPENDITURE' && 'Expenditure Management'}
            {currentView === 'EXPENDITURE_REPORT' && 'Expenditure Report'}
          </h2>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString()}
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-white relative">
            {currentView === 'HOME' ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white">
                {/* Conditional Render based on Image State */}
                {!imageError ? (
                   <img 
                    src="/dashboard-logo.png" 
                    onError={() => setImageError(true)}
                    alt="Saisharan Krishi Kendra" 
                    className="max-w-[80%] max-h-[70%] object-contain"
                  />
                ) : (
                  <div className="text-gray-800 text-center p-10">
                    <h1 className="text-6xl font-bold text-green-800 mb-4">SK</h1>
                    <p className="text-2xl text-gray-600 tracking-widest font-serif">SAISHARAN KRISHI KENDRA</p>
                    <p className="text-xs mt-4 text-gray-400">(Image failed to load. Check public/dashboard-logo.png)</p>
                  </div>
                )}
                
                {/* Bottom Left Credit */}
                <div className="absolute bottom-6 left-6 text-left font-sans">
                   <p className="text-green-600 font-semibold text-sm mb-0 leading-tight">Developed by</p>
                   <p className="text-gray-800 text-2xl font-bold tracking-wide">Mengji Infotech</p>
                   <p className="text-gray-500 text-xs tracking-widest mt-1 font-medium">7026200016 / 9343444666</p>
                </div>
              </div>
            ) : (
              <div className="p-6 min-h-full">
                <div className="max-w-7xl mx-auto h-full">
                  {currentView === 'FARMERS' && <FarmerRegistration />}
                  {currentView === 'BYCELL' && <BycellForm />}
                  {currentView === 'PLANTATION' && <Plantation />}
                  {currentView === 'SOIL' && <SoilHealthForm />}
                  {currentView === 'SERVICE' && <ServiceSchedule />}
                  {currentView === 'LEDGER' && <Ledger />}
                  {currentView === 'PRODUCTS' && <ProductMaster />}
                  {currentView === 'SALES' && <Sales />}
                  {currentView === 'EXPENDITURE' && <ExpenditureForm />}
                  {currentView === 'EXPENDITURE_REPORT' && <ExpenditureReport />}
                </div>
              </div>
            )}
        </main>
      </div>
    </div>
  );
}
