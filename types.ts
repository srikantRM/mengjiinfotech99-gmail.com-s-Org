
export enum UserRole {
  ADMIN = 'ADMIN',
  FIELD_OFFICER = 'FIELD_OFFICER',
  STAFF = 'STAFF'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  allowedModules: string[];
}

export interface Farmer {
  id: string;
  serialNumber: string;
  nslCode: string;
  name: string;
  aadhar: string;
  phone: string;
  totalLand: string;
  surveyNo: string;
  village: string;
  hobli: string;
  taluka: string;
}

export interface Plantation {
  id: string;
  farmerId: string;
  landArea: string;
  plantationDate: string;
  lastHarvestDate: string;
  variety: string;
  plantToPlantDistance: string;
  lineToLineDistance: string;
  cropName: string;
  status: 'Active' | 'Harvested';
}

export interface SoilHealth {
  id: string;
  farmerId: string;
  sampleNumber: string;
  date: string;
  waterSource: string;
  soilTexture: string;
  limeTest: string;
  ph: string;
  organicCarbon: string;
  nitrateNitrogen: string;
  ammoniacalNitrogen: string;
  phosphorus: string;
  potassium: string;
  sulphur: string;
  zinc: string;
  iron: string;
  boron: string;
  remark: string;
  recommendation: string;
}

export type SoilTest = SoilHealth;

export interface ServiceTask {
  id: string;
  plantationId: string;
  dayNumber: number;
  activityName: string;
  details: string;
  scheduledDate: string;
  isDone: boolean;
  doneDate?: string;
  doneTime?: string;
  photoUrl?: string;
  quantity?: string;
  appliedQty?: string;
  applicationType?: string;
}

export interface Product {
  id: string;
  name: string;
  company: string;
  rate: number;
}

export interface Sale {
  id: string;
  farmerId: string;
  invoiceDate: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    rate: number;
    amount: number;
  }[];
  totalAmount: number;
  paymentMode: 'Cash' | 'Credit' | 'UPI';
}

export interface Expenditure {
  id: string;
  headName: string;
  particulars: string;
  date: string;
  amount: number;
  paymentType: 'Cash' | 'Cheque' | 'Online';
}

// Legacy interface for API service compatibility if needed
export interface ByCellDose {
  id: string;
  farmerId: string;
  date: string;
  doseName: string;
  quantity: string;
  notes: string;
}

// New Interfaces for Bycell Form
export interface BycellActivity {
  id: string;
  day: string | number;
  type: string;
  activity: string;
  qty: string;
  appliedQty: string;
  appliedBags: string;
  isDone: boolean;
  doneDate: string;
  time: string;
  photo: string;
}

export interface BycellDose {
  id: string;
  farmerId: string;
  acres: string;
  remarks: string;
  date: string;
  activities: BycellActivity[];
}
