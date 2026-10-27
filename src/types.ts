export type Role = 'admin' | 'agent' | 'supervisor';
export type Provider = 'Orange' | 'Mascom' | 'MyZaka' | 'eWallet' | 'Other';
export type TransactionType = 'deposit' | 'withdrawal';
export type AlertType = 'low_float' | 'high_transaction' | 'variance';
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type TransactionStatus = 'completed' | 'pending' | 'failed';
export type ShiftStatus = 'active' | 'ended';

export interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: Role;
  branchId: string;
  phone?: string;
  email?: string;
  createdAt: string;
  active: boolean;
}

export interface Shift {
  id: string;
  userId: string;
  userName: string;
  startTime: string;
  endTime: string | null;
  status: ShiftStatus;
  openingCash: number;
  closingCash: number | null;
  transactionsCount: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalCommission: number;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
}

export interface Wallet {
  id: string;
  provider: Provider;
  openingFloat: number;
  currentFloat: number;
  minThreshold: number;
  lastTopUpAt: string | null;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  provider: Provider;
  customerNumber: string;
  amount: number;
  commission: number;
  agentId: string;
  agentName: string;
  reference: string;
  status: TransactionStatus;
  shiftId: string | null;
  createdAt: string;
}

export interface CommissionRate {
  id: string;
  provider: Provider;
  transactionType: TransactionType;
  rate: number;
}

export interface Reconciliation {
  id: string;
  date: string;
  systemFloat: number;
  actualFloat: number;
  systemCash: number;
  actualCash: number;
  varianceFloat: number;
  varianceCash: number;
  status: 'balanced' | 'over' | 'short';
  agentId: string;
  agentName: string;
}

export interface Alert {
  id: string;
  type: AlertType;
  message: string;
  severity: AlertSeverity;
  createdAt: string;
  read: boolean;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemePreset {
  id: string;
  name: string;
  primaryColor: string;
  accentColor: string;
  mode: ThemeMode;
  description: string;
  preview: string; // gradient preview
}

export interface Theme {
  mode: ThemeMode;
  primaryColor: string;
  accentColor: string;
  presetId: string;
  customLogo: string | null; // base64 data URL
  logoType: 'default' | 'custom';
  borderRadius: 'sm' | 'md' | 'lg' | 'xl';
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  branches: Branch[];
  wallets: Wallet[];
  transactions: Transaction[];
  commissionRates: CommissionRate[];
  reconciliations: Reconciliation[];
  alerts: Alert[];
  openingCash: number;
  shifts: Shift[];
  activeShiftId: string | null;
  theme: Theme;
}
