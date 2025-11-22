
import { Farmer, Plantation, SoilTest, ServiceTask, Product, Sale, Expenditure, User, UserRole, ByCellDose } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const seedUsers: User[] = [
  { id: '1', username: 'admin123', role: UserRole.ADMIN, allowedModules: ['all'] },
  { id: '2', username: 'staff01', role: UserRole.FIELD_OFFICER, allowedModules: ['service', 'ledger'] },
  { id: '3', username: 'user', role: UserRole.STAFF, allowedModules: ['service'] }
];

const SCHEDULE_TEMPLATE = [
  { day: 30, activity: 'First Drenching', details: 'Humic Acid 500ml' },
  { day: 60, activity: 'Fertilizer Application', details: 'Urea 50kg' },
  { day: 90, activity: 'Micronutrient Spray', details: 'Zinc + Boron' },
  { day: 149, activity: 'Drip Irrigation', details: 'CN + Boron 3KG' },
  { day: 152, activity: 'Drip Irrigation', details: 'CN + Boron 1KG' },
  { day: 173, activity: 'Add Drip', details: 'KMS 5KG' },
  { day: 201, activity: 'Herbicide Spray', details: 'Basta 1L' },
  { day: 203, activity: 'Drip Irrigation 15:5:30', details: '1 KG + Fertisol 1KG' },
  { day: 221, activity: 'Drip Irrigation 15:5:30', details: '1 KG + Fertisol 1KG' },
];

const KEYS = {
  USERS: 'agri_users',
  FARMERS: 'agri_farmers',
  PLANTATIONS: 'agri_plantations',
  SOIL_TESTS: 'agri_soil_tests',
  TASKS: 'agri_tasks',
  PRODUCTS: 'agri_products',
  SALES: 'agri_sales',
  EXPENSES: 'agri_expenses',
  BYCELL: 'agri_bycell'
};

const get = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const set = (key: string, data: any[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const api = {
  auth: {
    login: async (username: string) => {
      await delay(300);
      let users = get<User>(KEYS.USERS);
      if (users.length === 0) {
        users = seedUsers;
        set(KEYS.USERS, users);
      }
      // Simple mapping for demo credentials mentioned in prompt
      if (username === 'admin') return users.find(u => u.username === 'admin123');
      if (username === 'field') return users.find(u => u.role === UserRole.FIELD_OFFICER);
      
      return users.find(u => u.username === username);
    },
    addUser: async (user: User) => {
      const users = get<User>(KEYS.USERS);
      users.push(user);
      set(KEYS.USERS, users);
    }
  },

  farmers: {
    getAll: async () => { await delay(200); return get<Farmer>(KEYS.FARMERS); },
    add: async (data: Farmer) => {
      const list = get<Farmer>(KEYS.FARMERS);
      list.push({ ...data, id: Date.now().toString() });
      set(KEYS.FARMERS, list);
    },
    search: async (query: string) => {
        const list = get<Farmer>(KEYS.FARMERS);
        const lowerQ = query.toLowerCase();
        return list.filter(f => f.name.toLowerCase().includes(lowerQ) || f.phone.includes(lowerQ));
    }
  },

  plantations: {
    getAll: async () => { return get<Plantation>(KEYS.PLANTATIONS); },
    getByFarmer: async (farmerId: string) => {
      const list = get<Plantation>(KEYS.PLANTATIONS);
      return list.filter(p => p.farmerId === farmerId);
    },
    add: async (data: Plantation) => {
      const list = get<Plantation>(KEYS.PLANTATIONS);
      const newPlantationId = Date.now().toString();
      const newPlantation = { ...data, id: newPlantationId };
      list.push(newPlantation);
      set(KEYS.PLANTATIONS, list);

      const tasks = get<ServiceTask>(KEYS.TASKS);
      const startDate = new Date(data.plantationDate);
      
      SCHEDULE_TEMPLATE.forEach(item => {
        const taskDate = new Date(startDate);
        taskDate.setDate(startDate.getDate() + item.day);
        
        tasks.push({
          id: Math.random().toString(36).substr(2, 9),
          plantationId: newPlantationId,
          dayNumber: item.day,
          activityName: item.activity,
          details: item.details,
          scheduledDate: taskDate.toISOString().split('T')[0],
          isDone: false
        });
      });
      set(KEYS.TASKS, tasks);
    }
  },

  soilTests: {
    getByFarmer: async (farmerId: string) => {
      const list = get<SoilTest>(KEYS.SOIL_TESTS);
      return list.filter(t => t.farmerId === farmerId);
    },
    add: async (data: SoilTest) => {
      const list = get<SoilTest>(KEYS.SOIL_TESTS);
      list.push({ ...data, id: Date.now().toString() });
      set(KEYS.SOIL_TESTS, list);
    },
    delete: async (id: string) => {
      const list = get<SoilTest>(KEYS.SOIL_TESTS);
      set(KEYS.SOIL_TESTS, list.filter(x => x.id !== id));
    }
  },

  tasks: {
    getByPlantation: async (plantationId: string) => {
      const list = get<ServiceTask>(KEYS.TASKS);
      return list.filter(t => t.plantationId === plantationId).sort((a, b) => a.dayNumber - b.dayNumber);
    },
    update: async (task: ServiceTask) => {
      const list = get<ServiceTask>(KEYS.TASKS);
      const index = list.findIndex(t => t.id === task.id);
      if (index !== -1) {
        list[index] = task;
        set(KEYS.TASKS, list);
      }
    }
  },

  products: {
    getAll: async () => get<Product>(KEYS.PRODUCTS),
    add: async (data: Product) => {
      const list = get<Product>(KEYS.PRODUCTS);
      list.push({ ...data, id: Date.now().toString() });
      set(KEYS.PRODUCTS, list);
    }
  },

  sales: {
    getByFarmer: async (farmerId: string) => {
        const list = get<Sale>(KEYS.SALES);
        return list.filter(s => s.farmerId === farmerId);
    },
    add: async (data: Sale) => {
      const list = get<Sale>(KEYS.SALES);
      list.push({ ...data, id: Date.now().toString() });
      set(KEYS.SALES, list);
    }
  },

  expenditure: {
    getAll: async () => get<Expenditure>(KEYS.EXPENSES),
    add: async (data: Expenditure) => {
      const list = get<Expenditure>(KEYS.EXPENSES);
      list.push({ ...data, id: Date.now().toString() });
      set(KEYS.EXPENSES, list);
    }
  },

  bycell: {
    getByFarmer: async (farmerId: string) => {
      const list = get<ByCellDose>(KEYS.BYCELL);
      return list.filter(b => b.farmerId === farmerId);
    },
    add: async (data: ByCellDose) => {
      const list = get<ByCellDose>(KEYS.BYCELL);
      list.push({ ...data, id: Date.now().toString() });
      set(KEYS.BYCELL, list);
    }
  }
};
