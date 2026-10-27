import { useState } from 'react';
import { useStore, useToast } from './hooks';
import {
  addTransaction, addReconciliation, markAlertRead, updateWallet,
  updateCommissionRate, setOpeningCash, getCurrentCash, getTotalFloat,
  getCommissionByPeriod, getCommissionByProvider, getTodayTransactions,
  resetState, setCurrentUser
} from './store';
import { formatCurrency, formatDate, formatDateTime, generateRef, getWalletStatus, getStatusColor, getStatusBg } from './utils/format';
import { Provider, TransactionType } from './types';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

type Page = 'dashboard' | 'transactions' | 'float' | 'reports' | 'settings';
type ModalType = 'deposit' | 'withdrawal' | null;

const COLORS = ['#f97316', '#3b82f6', '#8b5cf6', '#10b981', '#6b7280'];

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [modal, setModal] = useState<ModalType>(null);
  const [fabOpen, setFabOpen] = useState(false);
  const { toasts, showToast } = useToast();
  const state = useStore();

  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-lg mx-auto relative">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 sticky top-0 z-40 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">MoMo Agent</h1>
            <p className="text-xs text-green-100">{state.currentUser.name} • {state.currentUser.role}</p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4">
        {page === 'dashboard' && <DashboardPage />}
        {page === 'transactions' && <TransactionsPage showToast={showToast} />}
        {page === 'float' && <FloatPage showToast={showToast} />}
        {page === 'reports' && <ReportsPage />}
        {page === 'settings' && <SettingsPage showToast={showToast} />}
      </main>

      {/* FAB */}
      <div className="fixed bottom-20 right-4 z-50">
        {fabOpen && (
          <div className="flex flex-col gap-2 mb-2 animate-in">
            <button
              onClick={() => { setModal('deposit'); setFabOpen(false); }}
              className="bg-green-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium hover:bg-green-700 transition"
            >
              + Deposit
            </button>
            <button
              onClick={() => { setModal('withdrawal'); setFabOpen(false); }}
              className="bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium hover:bg-orange-600 transition"
            >
              + Withdrawal
            </button>
          </div>
        )}
        <button
          onClick={() => setFabOpen(!fabOpen)}
          className="w-14 h-14 bg-green-600 text-white rounded-full shadow-xl flex items-center justify-center text-2xl font-bold hover:bg-green-700 transition-transform hover:scale-110"
        >
          {fabOpen ? '×' : '+'}
        </button>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 max-w-lg mx-auto">
        <div className="flex justify-around py-2">
          {[
            { id: 'dashboard' as Page, icon: '📊', label: 'Dashboard' },
            { id: 'transactions' as Page, icon: '💸', label: 'Transactions' },
            { id: 'float' as Page, icon: '💰', label: 'Float' },
            { id: 'reports' as Page, icon: '📋', label: 'Reports' },
            { id: 'settings' as Page, icon: '⚙️', label: 'Settings' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setPage(tab.id)}
              className={`flex flex-col items-center px-2 py-1 rounded-lg transition ${
                page === tab.id ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-xs mt-0.5 font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Modal */}
      {modal && (
        <TransactionModal
          type={modal}
          onClose={() => setModal(null)}
          showToast={showToast}
        />
      )}

      {/* Toasts */}
      <div className="fixed top-16 left-4 right-4 z-50 flex flex-col gap-2 max-w-lg mx-auto">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium animate-slide-in ${
              t.type === 'success' ? 'bg-green-500' : t.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationBell() {
  const state = useStore();
  const [show, setShow] = useState(false);
  const unread = state.alerts.filter(a => !a.read).length;

  return (
    <div className="relative">
      <button onClick={() => setShow(!show)} className="relative p-2">
        <span className="text-xl">🔔</span>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unread}
          </span>
        )}
      </button>
      {show && (
        <div className="absolute right-0 top-12 w-72 bg-white rounded-xl shadow-2xl border z-50 max-h-80 overflow-y-auto">
          <div className="p-3 border-b font-semibold text-gray-700">Notifications</div>
          {state.alerts.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-sm">No alerts</div>
          ) : (
            state.alerts.slice(0, 10).map(a => (
              <div
                key={a.id}
                className={`p-3 border-b text-sm ${a.read ? 'bg-gray-50' : 'bg-yellow-50'}`}
                onClick={() => markAlertRead(a.id)}
              >
                <div className="flex items-start gap-2">
                  <span className={a.severity === 'critical' ? '🔴' : a.severity === 'warning' ? '🟡' : '🔵'}></span>
                  <div>
                    <p className="text-gray-700">{a.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDateTime(a.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ============ DASHBOARD ============
function DashboardPage() {
  const state = useStore();
  const todayTx = getTodayTransactions();
  const todayDeposits = todayTx.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0);
  const todayWithdrawals = todayTx.filter(t => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0);
  const todayCommission = todayTx.reduce((s, t) => s + t.commission, 0);
  const totalFloat = getTotalFloat();
  const currentCash = getCurrentCash();
  const totalTx = todayTx.length;
  const avgTx = totalTx > 0 ? todayTx.reduce((s, t) => s + t.amount, 0) / totalTx : 0;
  const monthlyCommission = getCommissionByPeriod('month');

  // Chart data - last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const chartData = last7Days.map(date => {
    const dayTx = state.transactions.filter(t => t.createdAt.startsWith(date));
    return {
      date: new Date(date).toLocaleDateString('en', { weekday: 'short' }),
      deposits: dayTx.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0),
      withdrawals: dayTx.filter(t => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0),
    };
  });

  const providerData = getCommissionByProvider().filter(p => p.commission > 0);

  return (
    <div className="space-y-4">
      {/* Widget Grid */}
      <div className="grid grid-cols-2 gap-3">
        <WidgetCard label="Total Float" value={formatCurrency(totalFloat)} color="bg-blue-50 border-blue-200" icon="💰" />
        <WidgetCard label="Cash Available" value={formatCurrency(currentCash)} color="bg-green-50 border-green-200" icon="💵" />
        <WidgetCard label="Today's Deposits" value={formatCurrency(todayDeposits)} color="bg-emerald-50 border-emerald-200" icon="📥" />
        <WidgetCard label="Today's Withdrawals" value={formatCurrency(todayWithdrawals)} color="bg-orange-50 border-orange-200" icon="📤" />
        <WidgetCard label="Today's Commission" value={formatCurrency(todayCommission)} color="bg-purple-50 border-purple-200" icon="💎" />
        <WidgetCard label="Transactions" value={totalTx.toString()} color="bg-indigo-50 border-indigo-200" icon="📊" />
        <WidgetCard label="Monthly Commission" value={formatCurrency(monthlyCommission)} color="bg-pink-50 border-pink-200" icon="📈" />
        <WidgetCard label="Avg Transaction" value={formatCurrency(avgTx)} color="bg-teal-50 border-teal-200" icon="📐" />
      </div>

      {/* Deposits vs Withdrawals Chart */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <h3 className="font-semibold text-gray-700 mb-3">Deposits vs Withdrawals (7 Days)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={10} />
            <YAxis fontSize={10} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Bar dataKey="deposits" fill="#10b981" name="Deposits" radius={[4, 4, 0, 0]} />
            <Bar dataKey="withdrawals" fill="#f97316" name="Withdrawals" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Provider Performance */}
      {providerData.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <h3 className="font-semibold text-gray-700 mb-3">Commission by Provider</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={providerData} dataKey="commission" nameKey="provider" cx="50%" cy="50%" outerRadius={70} label={({ provider }) => provider}>
                {providerData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Provider Float Cards */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <h3 className="font-semibold text-gray-700 mb-3">Provider Float Balances</h3>
        <div className="space-y-2">
          {state.wallets.map(w => {
            const status = getWalletStatus(w.currentFloat, w.minThreshold);
            return (
              <div key={w.id} className={`flex items-center justify-between p-3 rounded-lg border ${getStatusBg(status)}`}>
                <div>
                  <p className="font-medium text-gray-700">{w.provider} Money</p>
                  <p className="text-xs text-gray-500">Threshold: {formatCurrency(w.minThreshold)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{formatCurrency(w.currentFloat)}</p>
                  <p className={`text-xs font-medium ${getStatusColor(status)}`}>
                    {status === 'healthy' ? '🟢 Healthy' : status === 'low' ? '🟡 Low' : '🔴 Critical'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <h3 className="font-semibold text-gray-700 mb-3">Recent Transactions</h3>
        {state.transactions.length === 0 ? (
          <p className="text-center text-gray-400 py-4">No transactions yet</p>
        ) : (
          <div className="space-y-2">
            {state.transactions.slice(0, 5).map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    tx.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {tx.type === 'deposit' ? '↓' : '↑'}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{tx.customerNumber}</p>
                    <p className="text-xs text-gray-400">{tx.provider} • {tx.reference}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${tx.type === 'deposit' ? 'text-green-600' : 'text-orange-600'}`}>
                    {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                  <p className="text-xs text-gray-400">{formatDateTime(tx.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WidgetCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: string }) {
  return (
    <div className={`p-3 rounded-xl border ${color}`}>
      <div className="flex items-center gap-1 mb-1">
        <span className="text-sm">{icon}</span>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
      </div>
      <p className="text-lg font-bold text-gray-800">{value}</p>
    </div>
  );
}

// ============ TRANSACTIONS ============
function TransactionsPage({ showToast }: { showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
  const state = useStore();
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterProvider, setFilterProvider] = useState<'all' | Provider>('all');
  const [search, setSearch] = useState('');

  let filtered = state.transactions;
  if (filterType !== 'all') filtered = filtered.filter(t => t.type === filterType);
  if (filterProvider !== 'all') filtered = filtered.filter(t => t.provider === filterProvider);
  if (search) filtered = filtered.filter(t =>
    t.customerNumber.includes(search) || t.reference.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl p-3 shadow-sm border space-y-2">
        <input
          type="text"
          placeholder="Search customer or reference..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value as 'all' | TransactionType)}
            className="flex-1 px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">All Types</option>
            <option value="deposit">Deposits</option>
            <option value="withdrawal">Withdrawals</option>
          </select>
          <select
            value={filterProvider}
            onChange={e => setFilterProvider(e.target.value as 'all' | Provider)}
            className="flex-1 px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">All Providers</option>
            <option value="Orange">Orange</option>
            <option value="Mascom">Mascom</option>
            <option value="MyZaka">MyZaka</option>
            <option value="eWallet">eWallet</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-xl p-3 shadow-sm border">
        <h3 className="font-semibold text-gray-700 mb-2">Transaction History ({filtered.length})</h3>
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No transactions found</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filtered.map(tx => (
              <div key={tx.id} className="p-3 bg-gray-50 rounded-lg border-l-4 border-l-green-500">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        tx.type === 'deposit' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                      </span>
                      <span className="text-xs text-gray-500">{tx.provider}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mt-1">{tx.customerNumber}</p>
                    <p className="text-xs text-gray-400">Ref: {tx.reference}</p>
                    <p className="text-xs text-gray-400">{formatDateTime(tx.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.type === 'deposit' ? 'text-green-600' : 'text-orange-600'}`}>
                      {formatCurrency(tx.amount)}
                    </p>
                    <p className="text-xs text-purple-600">Comm: {formatCurrency(tx.commission)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ FLOAT MANAGEMENT ============
function FloatPage({ showToast }: { showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
  const state = useStore();
  const [editingWallet, setEditingWallet] = useState<Provider | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('');
  const currentCash = getCurrentCash();
  const totalFloat = getTotalFloat();

  const handleTopUp = (provider: Provider) => {
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast('Enter valid amount', 'error');
      return;
    }
    const wallet = state.wallets.find(w => w.provider === provider);
    if (wallet) {
      updateWallet(provider, {
        currentFloat: wallet.currentFloat + amount,
        lastTopUpAt: new Date().toISOString(),
      });
      showToast(`${provider} float topped up by ${formatCurrency(amount)}`);
      setTopUpAmount('');
      setEditingWallet(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs text-blue-600 font-medium">Total Float</p>
          <p className="text-xl font-bold text-blue-800">{formatCurrency(totalFloat)}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-xs text-green-600 font-medium">Cash on Hand</p>
          <p className="text-xl font-bold text-green-800">{formatCurrency(currentCash)}</p>
        </div>
      </div>

      {/* Cash Position Formula */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <h3 className="font-semibold text-gray-700 mb-2">Cash Position</h3>
        <div className="text-sm text-gray-600 space-y-1 bg-gray-50 p-3 rounded-lg">
          <p>Opening Cash: <span className="font-medium">{formatCurrency(state.openingCash)}</span></p>
          <p>+ Today's Deposits: <span className="font-medium text-green-600">
            {formatCurrency(getTodayTransactions().filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0))}
          </span></p>
          <p>- Today's Withdrawals: <span className="font-medium text-orange-600">
            {formatCurrency(getTodayTransactions().filter(t => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0))}
          </span></p>
          <p className="border-t pt-1 font-bold text-gray-800">= {formatCurrency(currentCash)}</p>
        </div>
      </div>

      {/* Provider Wallet Cards */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-700">Provider Wallets</h3>
        {state.wallets.map(w => {
          const status = getWalletStatus(w.currentFloat, w.minThreshold);
          return (
            <div key={w.id} className={`rounded-xl p-4 border-2 ${getStatusBg(status)} shadow-sm`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-gray-800">{w.provider} Money</h4>
                  <p className={`text-xs font-medium ${getStatusColor(status)}`}>
                    {status === 'healthy' ? '🟢 Healthy' : status === 'low' ? '🟡 Low' : '🔴 Critical'}
                  </p>
                </div>
                <p className="text-xl font-bold text-gray-800">{formatCurrency(w.currentFloat)}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                <div>Opening: {formatCurrency(w.openingFloat)}</div>
                <div>Threshold: {formatCurrency(w.minThreshold)}</div>
                {w.lastTopUpAt && <div className="col-span-2">Last Top-up: {formatDateTime(w.lastTopUpAt)}</div>}
              </div>

              {editingWallet === w.provider ? (
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Amount"
                    value={topUpAmount}
                    onChange={e => setTopUpAmount(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  />
                  <button
                    onClick={() => handleTopUp(w.provider)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium"
                  >
                    Top Up
                  </button>
                  <button
                    onClick={() => setEditingWallet(null)}
                    className="px-3 py-2 bg-gray-200 rounded-lg text-sm"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingWallet(w.provider)}
                  className="w-full py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  💰 Top Up Float
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ REPORTS ============
function ReportsPage() {
  const state = useStore();
  const [reportType, setReportType] = useState<'daily' | 'reconciliation'>('daily');
  const todayTx = getTodayTransactions();
  const todayDeposits = todayTx.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0);
  const todayWithdrawals = todayTx.filter(t => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0);
  const todayCommission = todayTx.reduce((s, t) => s + t.commission, 0);
  const totalFloat = getTotalFloat();
  const currentCash = getCurrentCash();

  // Reconciliation state
  const [actualFloat, setActualFloat] = useState('');
  const [actualCash, setActualCash] = useState('');

  const handleReconcile = () => {
    const af = parseFloat(actualFloat);
    const ac = parseFloat(actualCash);
    if (isNaN(af) || isNaN(ac)) return;

    addReconciliation({
      date: new Date().toISOString().split('T')[0],
      systemFloat: totalFloat,
      actualFloat: af,
      systemCash: currentCash,
      actualCash: ac,
      agentId: state.currentUser.id,
      agentName: state.currentUser.name,
    });
    setActualFloat('');
    setActualCash('');
  };

  const exportCSV = () => {
    const headers = 'Date,Type,Provider,Customer,Amount,Commission,Reference,Agent\n';
    const rows = state.transactions.map(t =>
      `${formatDate(t.createdAt)},${t.type},${t.provider},${t.customerNumber},${t.amount},${t.commission.toFixed(2)},${t.reference},${t.agentName}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm border">
        <button
          onClick={() => setReportType('daily')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            reportType === 'daily' ? 'bg-green-600 text-white' : 'text-gray-600'
          }`}
        >
          Daily Report
        </button>
        <button
          onClick={() => setReportType('reconciliation')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            reportType === 'reconciliation' ? 'bg-green-600 text-white' : 'text-gray-600'
          }`}
        >
          Reconciliation
        </button>
      </div>

      {reportType === 'daily' ? (
        <div className="space-y-4">
          {/* Daily Report */}
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <h3 className="font-semibold text-gray-700 mb-3">📋 Daily Report - {new Date().toLocaleDateString()}</h3>
            <div className="space-y-2">
              <ReportRow label="Opening Float" value={formatCurrency(state.wallets.reduce((s, w) => s + w.openingFloat, 0))} />
              <ReportRow label="Closing Float" value={formatCurrency(totalFloat)} highlight />
              <ReportRow label="Deposits" value={formatCurrency(todayDeposits)} color="text-green-600" />
              <ReportRow label="Withdrawals" value={formatCurrency(todayWithdrawals)} color="text-orange-600" />
              <ReportRow label="Commission Earned" value={formatCurrency(todayCommission)} color="text-purple-600" />
              <ReportRow label="Cash Position" value={formatCurrency(currentCash)} highlight />
              <ReportRow label="Transactions Count" value={todayTx.length.toString()} />
            </div>
          </div>

          {/* Monthly Summary */}
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <h3 className="font-semibold text-gray-700 mb-3">📈 Monthly Summary</h3>
            <div className="space-y-2">
              <ReportRow label="Monthly Deposits" value={formatCurrency(
                state.transactions.filter(t => t.type === 'deposit' && t.createdAt >= new Date(Date.now() - 30 * 86400000).toISOString()).reduce((s, t) => s + t.amount, 0)
              )} color="text-green-600" />
              <ReportRow label="Monthly Withdrawals" value={formatCurrency(
                state.transactions.filter(t => t.type === 'withdrawal' && t.createdAt >= new Date(Date.now() - 30 * 86400000).toISOString()).reduce((s, t) => s + t.amount, 0)
              )} color="text-orange-600" />
              <ReportRow label="Monthly Commission" value={formatCurrency(getCommissionByPeriod('month'))} color="text-purple-600" highlight />
              <ReportRow label="Total Transactions" value={state.transactions.length.toString()} />
            </div>
          </div>

          {/* Export */}
          <button
            onClick={exportCSV}
            className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition"
          >
            📥 Export Transactions (CSV)
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Reconciliation */}
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <h3 className="font-semibold text-gray-700 mb-3">⚖️ Daily Reconciliation</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-xs text-blue-600">System Float</p>
                  <p className="font-bold text-blue-800">{formatCurrency(totalFloat)}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600">System Cash</p>
                  <p className="font-bold text-blue-800">{formatCurrency(currentCash)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Actual Float (count)</label>
                <input
                  type="number"
                  value={actualFloat}
                  onChange={e => setActualFloat(e.target.value)}
                  placeholder="Enter actual float amount"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Actual Cash (count)</label>
                <input
                  type="number"
                  value={actualCash}
                  onChange={e => setActualCash(e.target.value)}
                  placeholder="Enter actual cash amount"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              {actualFloat && actualCash && (
                <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                  <p className="text-sm">
                    Float Variance: <span className={`font-bold ${
                      parseFloat(actualFloat) - totalFloat === 0 ? 'text-green-600' :
                      parseFloat(actualFloat) - totalFloat > 0 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(parseFloat(actualFloat) - totalFloat)}
                    </span>
                  </p>
                  <p className="text-sm">
                    Cash Variance: <span className={`font-bold ${
                      parseFloat(actualCash) - currentCash === 0 ? 'text-green-600' :
                      parseFloat(actualCash) - currentCash > 0 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(parseFloat(actualCash) - currentCash)}
                    </span>
                  </p>
                </div>
              )}

              <button
                onClick={handleReconcile}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition"
              >
                ✅ Submit Reconciliation
              </button>
            </div>
          </div>

          {/* Reconciliation History */}
          {state.reconciliations.length > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <h3 className="font-semibold text-gray-700 mb-3">History</h3>
              <div className="space-y-2">
                {state.reconciliations.slice(0, 5).map(r => (
                  <div key={r.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{formatDate(r.date)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        r.status === 'balanced' ? 'bg-green-100 text-green-700' :
                        r.status === 'over' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {r.status === 'balanced' ? '✅ Balanced' : r.status === 'over' ? '📈 Over' : '📉 Short'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Float: {formatCurrency(r.varianceFloat)} | Cash: {formatCurrency(r.varianceCash)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReportRow({ label, value, color, highlight }: { label: string; value: string; color?: string; highlight?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-1.5 ${highlight ? 'border-t border-gray-200 pt-2' : ''}`}>
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-sm font-bold ${color || 'text-gray-800'}`}>{value}</span>
    </div>
  );
}

// ============ SETTINGS ============
function SettingsPage({ showToast }: { showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
  const state = useStore();
  const [newCash, setNewCash] = useState(state.openingCash.toString());

  const handleSetCash = () => {
    const amount = parseFloat(newCash);
    if (isNaN(amount) || amount < 0) {
      showToast('Enter valid amount', 'error');
      return;
    }
    setOpeningCash(amount);
    showToast('Opening cash updated');
  };

  return (
    <div className="space-y-4">
      {/* User Info */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <h3 className="font-semibold text-gray-700 mb-3">👤 Current User</h3>
        <div className="space-y-2">
          <p className="text-sm"><span className="text-gray-500">Name:</span> <span className="font-medium">{state.currentUser.name}</span></p>
          <p className="text-sm"><span className="text-gray-500">Role:</span> <span className="font-medium capitalize">{state.currentUser.role}</span></p>
        </div>
        <div className="mt-3 flex gap-2 flex-wrap">
          {state.users.map(u => (
            <button
              key={u.id}
              onClick={() => {
                setCurrentUser(u);
                showToast(`Switched to ${u.name}`);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                state.currentUser.id === u.id ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {u.name} ({u.role})
            </button>
          ))}
        </div>
      </div>

      {/* Opening Cash */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <h3 className="font-semibold text-gray-700 mb-3">💵 Opening Cash</h3>
        <div className="flex gap-2">
          <input
            type="number"
            value={newCash}
            onChange={e => setNewCash(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg text-sm"
          />
          <button
            onClick={handleSetCash}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium"
          >
            Set
          </button>
        </div>
      </div>

      {/* Commission Rates */}
      {(state.currentUser.role === 'admin') && (
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <h3 className="font-semibold text-gray-700 mb-3">💎 Commission Rates (%)</h3>
          <div className="space-y-2">
            {state.commissionRates.map(cr => (
              <div key={cr.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-700">{cr.provider}</span>
                  <span className="text-xs text-gray-500 ml-2 capitalize">{cr.transactionType}</span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={cr.rate}
                  onChange={e => updateCommissionRate(cr.id, parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1 border rounded text-sm text-right"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wallet Thresholds */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <h3 className="font-semibold text-gray-700 mb-3">⚠️ Float Thresholds</h3>
        <div className="space-y-2">
          {state.wallets.map(w => (
            <div key={w.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">{w.provider}</span>
              <input
                type="number"
                value={w.minThreshold}
                onChange={e => updateWallet(w.provider, { minThreshold: parseFloat(e.target.value) || 0 })}
                className="w-28 px-2 py-1 border rounded text-sm text-right"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={() => {
          if (confirm('Reset all data? This cannot be undone.')) {
            resetState();
            showToast('All data reset', 'info');
          }
        }}
        className="w-full py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl font-medium hover:bg-red-100 transition"
      >
        🗑️ Reset All Data
      </button>
    </div>
  );
}

// ============ TRANSACTION MODAL ============
function TransactionModal({ type, onClose, showToast }: { type: 'deposit' | 'withdrawal'; onClose: () => void; showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
  const state = useStore();
  const [customerNumber, setCustomerNumber] = useState('');
  const [provider, setProvider] = useState<Provider>('Orange');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');

  const handleSubmit = () => {
    if (!customerNumber || !amount || !reference) {
      showToast('Fill all fields', 'error');
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      showToast('Enter valid amount', 'error');
      return;
    }

    // Check float for withdrawal
    if (type === 'withdrawal') {
      const wallet = state.wallets.find(w => w.provider === provider);
      if (wallet && wallet.currentFloat < amt) {
        showToast(`Insufficient ${provider} float! Available: ${formatCurrency(wallet.currentFloat)}`, 'error');
        return;
      }
    }

    addTransaction({
      type,
      provider,
      customerNumber,
      amount: amt,
      agentId: state.currentUser.id,
      agentName: state.currentUser.name,
      reference,
      status: 'completed',
    });

    showToast(`${type === 'deposit' ? 'Deposit' : 'Withdrawal'} of ${formatCurrency(amt)} recorded!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-t-2xl p-5 animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            {type === 'deposit' ? '📥 New Deposit' : '📤 New Withdrawal'}
          </h2>
          <button onClick={onClose} className="text-gray-400 text-2xl">×</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Customer Number</label>
            <input
              type="tel"
              value={customerNumber}
              onChange={e => setCustomerNumber(e.target.value)}
              placeholder="e.g., 71234567"
              className="w-full mt-1 px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Provider</label>
            <select
              value={provider}
              onChange={e => setProvider(e.target.value as Provider)}
              className="w-full mt-1 px-3 py-2.5 border rounded-lg text-sm"
            >
              <option value="Orange">Orange Money</option>
              <option value="Mascom">Mascom</option>
              <option value="MyZaka">MyZaka</option>
              <option value="eWallet">FNB eWallet</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Amount (BWP)</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="e.g., 500"
              className="w-full mt-1 px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Reference Number</label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={reference}
                onChange={e => setReference(e.target.value)}
                placeholder="e.g., OM123456"
                className="flex-1 px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <button
                onClick={() => setReference(generateRef(provider))}
                className="px-3 py-2 bg-gray-100 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-200"
              >
                Auto
              </button>
            </div>
          </div>

          {/* Commission Preview */}
          {amount && parseFloat(amount) > 0 && (
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs text-purple-600 font-medium">Commission Preview</p>
              <p className="text-sm font-bold text-purple-800">
                {formatCurrency(parseFloat(amount) * ((state.commissionRates.find(r => r.provider === provider && r.transactionType === type)?.rate || 0.5) / 100))}
              </p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            className={`w-full py-3 rounded-xl font-medium text-white transition ${
              type === 'deposit' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            {type === 'deposit' ? '✅ Save Deposit' : '✅ Process Withdrawal'}
          </button>
        </div>
      </div>
    </div>
  );
}
