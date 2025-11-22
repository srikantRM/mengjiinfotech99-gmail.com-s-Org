
import { Farmer, BycellDose, Plantation, ServiceTask, Expenditure, SoilTest, Product, Sale, User, UserRole } from '../types';

// Utility functions for images
export const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxWidth = 800; 
        const scale = maxWidth / img.width;
        const width = maxWidth;
        const height = img.height * scale;
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          } else {
            reject(new Error('Canvas to Blob failed'));
          }
        }, 'image/jpeg', 0.7); 
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// API Client
const API_URL = '/api'; // Relative path for production

async function request<T>(endpoint: string, method = 'GET', body?: any): Promise<T> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  const config: RequestInit = { method, headers };
  if (body) config.body = JSON.stringify(body);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    // Return empty arrays for lists to prevent UI crashes during offline/error
    if (method === 'GET') return [] as any;
    throw error;
  }
}

export const db = {
  // Auth
  login: async (username: string, password?: string): Promise<User | null> => {
    try {
      // Attempt to login via API
      const res = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("API Login failed or not reachable, checking local demo credentials...");
    }

    // Fallback: Check hardcoded demo credentials if API fails
    // This ensures you can still login to test the UI even if the DB isn't connected yet.
    if (username === 'admin' && password === 'admin') {
      return { 
        id: '1', 
        username: 'admin', 
        role: UserRole.ADMIN, 
        allowedModules: ['all'] 
      };
    }
    if (username === 'field' && password === '123') {
      return { 
        id: '2', 
        username: 'field', 
        role: UserRole.FIELD_OFFICER, 
        allowedModules: ['service', 'ledger'] 
      };
    }
    
    return null;
  },

  // Farmers
  getFarmers: () => request<Farmer[]>('/farmers'),
  findFarmer: async (query: string) => {
      const lowerQ = query.toLowerCase();
      const all = await request<Farmer[]>('/farmers');
      return all.filter(f => 
        f.name.toLowerCase().includes(lowerQ) || 
        f.phone.includes(lowerQ) ||
        f.serialNumber.toLowerCase().includes(lowerQ)
      );
  },
  saveFarmer: (data: Farmer) => request('/farmers', 'POST', data),
  deleteFarmer: (id: string) => request(`/farmers/${id}`, 'DELETE'),

  // Bycell
  getAllBycell: () => request<BycellDose[]>('/bycell'),
  getBycell: async (farmerId: string) => {
      const list = await request<BycellDose[]>('/bycell');
      return list.find(d => d.farmerId === farmerId);
  },
  saveBycell: (data: BycellDose) => request('/bycell', 'POST', data),
  deleteBycell: (id: string) => request(`/bycell/${id}`, 'DELETE'),

  // Plantations
  getAllPlantations: () => request<Plantation[]>('/plantations'),
  getPlantations: (farmerId: string) => request<Plantation[]>(`/plantations?farmerId=${farmerId}`), 
  getPlantationsByFarmer: async (farmerId: string) => {
      const all = await request<Plantation[]>('/plantations');
      return all.filter(p => p.farmerId === farmerId);
  },
  savePlantation: (data: Plantation) => request('/plantations', 'POST', data),
  deletePlantation: (id: string) => request(`/plantations/${id}`, 'DELETE'),

  // Services
  getServices: async (plantationId: string) => {
      const all = await request<ServiceTask[]>('/services');
      return all.filter(s => s.plantationId === plantationId);
  },
  saveServices: (records: ServiceTask[]) => request('/services/batch', 'POST', { records }),
  updateService: (task: ServiceTask) => request(`/services/${task.id}`, 'PUT', task),

  // Expenditure
  getExpenditure: () => request<Expenditure[]>('/expenditures'),
  saveExpenditure: (data: Expenditure) => request('/expenditures', 'POST', data),

  // Soil Health
  getSoil: () => request<SoilTest[]>('/soil-tests'),
  getSoilTests: async (farmerId: string) => {
      const all = await request<SoilTest[]>('/soil-tests');
      return all.filter(t => t.farmerId === farmerId);
  },
  saveSoil: (data: SoilTest) => request('/soil-tests', 'POST', data),
  deleteSoil: (id: string) => request(`/soil-tests/${id}`, 'DELETE'),

  // Products
  getProducts: () => request<Product[]>('/products'),
  saveProduct: (data: Product) => request('/products', 'POST', data),
  deleteProduct: (id: string) => request(`/products/${id}`, 'DELETE'),

  // Sales
  getSales: async (farmerId: string) => {
      const all = await request<Sale[]>('/sales');
      return all.filter(s => s.farmerId === farmerId);
  },
  saveSale: (data: Sale) => request('/sales', 'POST', data),
};
