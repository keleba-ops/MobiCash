import { AppState, User, Transaction, Wallet, Reconciliation, Alert, CommissionRate, Provider, TransactionType } from './types';

const STORAGE_KEY = 'mobile_money_agent_banking';

const defaultUsers: User[] = [
  { id: 'u1', name: 'Agent Thabo', role: 'agent', branchId: 'b1' },
  { id: 'u2', name: 'Admin Kelebogile', role: 'admin', branchId: 'b1' },
  { id: 'u3', name: 'Supervisor Mpho', role: 'supervisor', branchId: 'b1' },
];

const defaultBranches = [
  { id: 'b1', name: 'Main Branch - Gaborone', location: 'Gaborone' },
  { id: 'b2', name: 'Francistown Branch', location: 'Francistown' },
];

const defaultWallets: Wallet[] = [
  { id: 'w1', provider: 'Orange', openingFloat: 50000, currentFloat: 50000, minThreshold: 10000, lastTopUpAt: null },
  { id: 'w2', provider: 'Mascom', openingFloat: 40000, currentFloat: 40000, minThreshold: 8000, lastTopUpAt: null },
  { id: 'w3', provider: 'MyZaka', openingFloat: 30000, currentFloat: 30000, minThreshold: 5000, lastTopUpAt: null },
  { id: 'w4', provider: 'eWallet', openingFloat: 20000, currentFloat: 20000, minThreshold: 5000, lastTopUpAt: null },
];

const defaultCommissionRates: CommissionRate[] = [
  { id: 'cr1', provider: 'Orange', transactionType: 'deposit', rate: 0.5 },
  { id: 'cr2', provider: 'Orange', transactionType: 'withdrawal', rate: 1.0 },
  { id: 'cr3', provider: 'Mascom', transactionType: 'deposit', rate: 0.5 },
  { id: 'cr4', provider: 'Mascom', transactionType: 'withdrawal', rate: 1.0 },
  { id: 'cr5', provider: 'MyZaka', transactionType: 'deposit', rate: 0.5 },
  { id: 'cr6', provider: 'MyZaka', transactionType: 'withdrawal', rate: 1.0 },
  { id: 'cr7', provider: 'eWallet', transactionType: 'deposit', rate: 0.5 },
  { id: 'cr8', provider: 'eWallet', transactionType: 'withdrawal', rate: 1.0 },
  { id: 'cr9', provider: 'Other', transactionType: 'deposit', rate: 0.5 },
  { id: 'cr10', provider: 'Other', transactionType: 'withdrawal', rate: 1.0 },
];

const defaultState: AppState = {
  currentUser: defaultUsers[0],
  users: defaultUsers,
  branches: defaultBranches,
  wallets: defaultWallets,
  transactions: [],
  commissionRates: defaultCommissionRates,
  reconciliations: [],
  alerts: [],
  openingCash: 10000,
};

function loadState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load state', e);
  }
  return defaultState;
}

function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();
let listeners: (() => void)[] = [];

function notify() {
  saveState(state);
  listeners.forEach(l => l());
}

export function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

export function getState(): AppState {
  return state;
}

export function setCurrentUser(user: User) {
  state = { ...state, currentUser: user };
  notify();
}

export function addTransaction(tx: Omit<Transaction, 'id' | 'createdAt' | 'commission'>): Transaction {
  const rate = state.commissionRates.find(
    r => r.provider === tx.provider && r.transactionType === tx.type
  );
  const commission = tx.amount * ((rate?.rate || 0.5) / 100);

  const newTx: Transaction = {
    ...tx,
    id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    commission,
    createdAt: new Date().toISOString(),
  };

  state = { ...state, transactions: [newTx, ...state.transactions] };

  // Update wallet float
  const wallets = state.wallets.map(w => {
    if (w.provider === tx.provider) {
      if (tx.type === 'deposit') {
        return { ...w, currentFloat: w.currentFloat + tx.amount };
      } else {
        return { ...w, currentFloat: w.currentFloat - tx.amount };
      }
    }
    return w;
  });
  state = { ...state, wallets };

  // Check alerts
  checkAlerts(tx);
  notify();
  return newTx;
}

function checkAlerts(tx: { type: TransactionType; amount: number; provider: Provider }) {
  const newAlerts: Alert[] = [];

  // High transaction alert
  if (tx.amount > 15000) {
    newAlerts.push({
      id: 'a_' + Date.now(),
      type: 'high_transaction',
      message: `${tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'} of P${tx.amount.toLocaleString()} exceeds P15,000 limit`,
      severity: 'warning',
      createdAt: new Date().toISOString(),
      read: false,
    });
  }

  // Low float alert
  state.wallets.forEach(w => {
    if (w.currentFloat < w.minThreshold) {
      newAlerts.push({
        id: 'a_' + Date.now() + '_' + w.provider,
        type: 'low_float',
        message: `${w.provider} Float below P${w.minThreshold.toLocaleString()} threshold`,
        severity: 'critical',
        createdAt: new Date().toISOString(),
        read: false,
      });
    }
  });

  if (newAlerts.length > 0) {
    state = { ...state, alerts: [...newAlerts, ...state.alerts] };
  }
}

export function addReconciliation(rec: Omit<Reconciliation, 'id' | 'varianceFloat' | 'varianceCash' | 'status'>) {
  const varianceFloat = rec.actualFloat - rec.systemFloat;
  const varianceCash = rec.actualCash - rec.systemCash;
  const totalVariance = varianceFloat + varianceCash;
  let status: 'balanced' | 'over' | 'short' = 'balanced';
  if (totalVariance > 0) status = 'over';
  else if (totalVariance < 0) status = 'short';

  const newRec: Reconciliation = {
    ...rec,
    id: 'rec_' + Date.now(),
    varianceFloat,
    varianceCash,
    status,
  };

  state = { ...state, reconciliations: [newRec, ...state.reconciliations] };

  if (status !== 'balanced') {
    state = {
      ...state,
      alerts: [{
        id: 'a_' + Date.now(),
        type: 'variance',
        message: `Reconciliation variance found: Float P${varianceFloat.toLocaleString()}, Cash P${varianceCash.toLocaleString()}`,
        severity: 'warning',
        createdAt: new Date().toISOString(),
        read: false,
      }, ...state.alerts],
    };
  }

  notify();
}

export function markAlertRead(id: string) {
  state = {
    ...state,
    alerts: state.alerts.map(a => a.id === id ? { ...a, read: true } : a),
  };
  notify();
}

export function updateWallet(provider: Provider, updates: Partial<Wallet>) {
  state = {
    ...state,
    wallets: state.wallets.map(w => w.provider === provider ? { ...w, ...updates } : w),
  };
  notify();
}

export function updateCommissionRate(id: string, rate: number) {
  state = {
    ...state,
    commissionRates: state.commissionRates.map(r => r.id === id ? { ...r, rate } : r),
  };
  notify();
}

export function setOpeningCash(amount: number) {
  state = { ...state, openingCash: amount };
  notify();
}

export function resetState() {
  state = defaultState;
  notify();
}

// Computed helpers
export function getTodayTransactions(): Transaction[] {
  const today = new Date().toISOString().split('T')[0];
  return state.transactions.filter(t => t.createdAt.startsWith(today));
}

export function getCurrentCash(): number {
  const today = new Date().toISOString().split('T')[0];
  const todayTx = state.transactions.filter(t => t.createdAt.startsWith(today));
  const deposits = todayTx.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0);
  const withdrawals = todayTx.filter(t => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0);
  return state.openingCash + deposits - withdrawals;
}

export function getTotalFloat(): number {
  return state.wallets.reduce((s, w) => s + w.currentFloat, 0);
}

export function getCommissionByPeriod(period: 'today' | 'week' | 'month'): number {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  let startDate: string;
  if (period === 'today') startDate = today;
  else if (period === 'week') startDate = weekAgo;
  else startDate = monthAgo;

  return state.transactions
    .filter(t => t.createdAt >= startDate)
    .reduce((s, t) => s + t.commission, 0);
}

export function getCommissionByProvider(): { provider: Provider; commission: number }[] {
  const providers: Provider[] = ['Orange', 'Mascom', 'MyZaka', 'eWallet', 'Other'];
  return providers.map(p => ({
    provider: p,
    commission: state.transactions.filter(t => t.provider === p).reduce((s, t) => s + t.commission, 0),
  }));
}
