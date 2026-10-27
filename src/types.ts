export type Role = 'admin' | 'agent' | 'supervisor';
export type Provider = 'Orange' | 'Mascom' | 'MyZaka' | 'eWallet' | 'Other';
export type TransactionType = 'deposit' | 'withdrawal';
export type AlertType = 'low_float' | 'high_transaction' | 'variance';
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type TransactionStatus = 'completed' | 'pending' | 'failed';

export interface User {
  id: string;
  name: string;
  role: Role;
  branchId: string;
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
  createdAt: string;
}

export interface CommissionRate {
  id: string;
  provider: Provider;
  transactionType: TransactionType;
  rate: number; // percentage
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

export interface AppState {
  currentUser: User;
  users: User[];
  branches: Branch[];
  wallets: Wallet[];
  transactions: Transaction[];
  commissionRates: CommissionRate[];
  reconciliations: Reconciliation[];
  alerts: Alert[];
  openingCash: number;
}
