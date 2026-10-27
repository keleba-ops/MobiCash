import { useState } from 'react';
import { useStore, useToast } from './hooks';
import {
  addTransaction, addReconciliation, markAlertRead, updateWallet,
  updateCommissionRate, setOpeningCash, getCurrentCash, getTotalFloat,
  getCommissionByPeriod, getCommissionByProvider, getTodayTransactions,
  resetState, logout, addUser, updateUser, toggleUserActive, deleteUser,
  getActiveShift, getUserShifts
} from './store';
import { formatCurrency, formatDate, formatDateTime, generateRef, getWalletStatus, getStatusColor, getStatusBg } from './utils/format';
import { Provider, TransactionType, Role, User } from './types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import LoginPage from './LoginPage';

type Page = 'dashboard' | 'transactions' | 'float' | 'reports' | 'settings' | 'users' | 'shifts';
type ModalType = 'deposit' | 'withdrawal' | null;

const COLORS = ['#f97316', '#3b82f6', '#8b5cf6', '#10b981', '#6b7280'];

const NAV_ITEMS: { id: Page; icon: string; label: string; adminOnly?: boolean }[] = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'transactions', icon: '💸', label: 'Transactions' },
  { id: 'float', icon: '💰', label: 'Float' },
  { id: 'reports', icon: '📋', label: 'Reports' },
  { id: 'shifts', icon: '🕐', label: 'Shifts' },
  { id: 'users', icon: '👥', label: 'Users', adminOnly: true },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
];

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [modal, setModal] = useState<ModalType>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { toasts, showToast } = useToast();
  const state = useStore();

  // Show login page if not authenticated
  if (!state.currentUser) {
    return (
      <>
        <LoginPage onLogin={() => setPage('dashboard')} showToast={showToast} />
        <ToastContainer toasts={toasts} />
      </>
    );
  }

  const user = state.currentUser;
  const isAdmin = user.role === 'admin';
  const isSupervisor = user.role === 'supervisor';
  const activeShift = getActiveShift();

  const visibleNav = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin);

  const handleNav = (p: Page) => {
    setPage(p);
    setSidebarOpen(false);
  };

  const handleLogout = (closingCash?: number) => {
    logout(closingCash);
    setShowLogoutModal(false);
    showToast('Logged out successfully', 'info');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 xl:w-72 bg-white border-r border-gray-200 fixed h-full z-30">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
              M
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-gray-800 truncate">MobiCash Agent</h1>
              <p className="text-xs text-gray-500">Banking System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {visibleNav.map(item => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                page === item.id
                  ? 'bg-green-50 text-green-700 shadow-sm border border-green-100'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Quick Actions */}
        <div className="p-3 border-t border-gray-100 space-y-2">
          <button
            onClick={() => setModal('deposit')}
            className="w-full py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition shadow-sm"
          >
            + New Deposit
          </button>
          <button
            onClick={() => setModal('withdrawal')}
            className="w-full py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition shadow-sm"
          >
            + New Withdrawal
          </button>
        </div>

        {/* User + Shift Info */}
        <div className="p-3 border-t border-gray-100">
          {activeShift && (
            <div className="mb-2 p-2 bg-green-50 rounded-lg border border-green-100">
              <p className="text-[10px] text-green-600 font-semibold uppercase">Active Shift</p>
              <p className="text-xs text-green-800 font-medium">Started {formatDateTime(activeShift.startTime).split(', ')[1]}</p>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
              title="Logout"
            >
              🚪
            </button>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 text-center">
            <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
              <span>Built by</span>
              <span className="inline-flex items-center gap-1 font-semibold text-gray-600">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Verge Dynamics
              </span>
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl animate-slide-right flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center text-white font-bold text-lg">M</div>
                <div>
                  <h1 className="text-base font-bold text-gray-800">MobiCash Agent</h1>
                  <p className="text-xs text-gray-500">Banking System</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 text-2xl hover:text-gray-600">×</button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {visibleNav.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                    page === item.id ? 'bg-green-50 text-green-700 border border-green-100' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="p-3 border-t border-gray-100 space-y-2">
              <button onClick={() => { setModal('deposit'); setSidebarOpen(false); }} className="w-full py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium">+ New Deposit</button>
              <button onClick={() => { setModal('withdrawal'); setSidebarOpen(false); }} className="w-full py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium">+ New Withdrawal</button>
            </div>
            <div className="p-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{user.name.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>
                <button onClick={() => { setShowLogoutModal(true); setSidebarOpen(false); }} className="p-2 text-gray-400 hover:text-red-500">🚪</button>
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
                <span>Built by</span>
                <span className="inline-flex items-center gap-1 font-semibold text-gray-600">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Verge Dynamics
                </span>
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 xl:ml-72 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 lg:px-8 py-3 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="lg:hidden flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">M</div>
                <h1 className="text-base font-bold text-gray-800">MobiCash</h1>
              </div>
              <h2 className="hidden lg:block text-xl font-bold text-gray-800 capitalize">
                {page === 'users' ? 'User Management' : page === 'shifts' ? 'Shift Tracking' : page}
              </h2>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              {activeShift && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-xs font-medium text-green-700">Shift Active</span>
                </div>
              )}
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-700">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
              <NotificationBell />
              <button
                onClick={() => setShowLogoutModal(true)}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <span>🚪</span>
                <span className="text-xs font-medium">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
          {page === 'dashboard' && <DashboardPage />}
          {page === 'transactions' && <TransactionsPage showToast={showToast} />}
          {page === 'float' && <FloatPage showToast={showToast} />}
          {page === 'reports' && <ReportsPage />}
          {page === 'settings' && <SettingsPage showToast={showToast} />}
          {page === 'users' && isAdmin && <UsersPage showToast={showToast} />}
          {page === 'shifts' && <ShiftsPage showToast={showToast} />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 shadow-lg">
        <div className="flex justify-around py-2 px-1">
          {visibleNav.slice(0, 5).map(tab => (
            <button
              key={tab.id}
              onClick={() => setPage(tab.id)}
              className={`flex flex-col items-center px-1 py-1 rounded-xl transition min-w-0 ${
                page === tab.id ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-[9px] mt-0.5 font-medium truncate">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile FAB */}
      <div className="lg:hidden fixed bottom-20 right-4 z-50 flex flex-col items-end gap-2">
        <button
          onClick={() => setModal('withdrawal')}
          className="w-11 h-11 bg-orange-500 text-white rounded-full shadow-xl flex items-center justify-center text-lg font-bold hover:bg-orange-600 transition"
        >
          ↑
        </button>
        <button
          onClick={() => setModal('deposit')}
          className="w-14 h-14 bg-green-600 text-white rounded-full shadow-xl flex items-center justify-center text-2xl font-bold hover:bg-green-700 transition"
        >
          ↓
        </button>
      </div>

      {/* Transaction Modal */}
      {modal && (
        <TransactionModal type={modal} onClose={() => setModal(null)} showToast={showToast} />
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <LogoutModal onClose={() => setShowLogoutModal(false)} onLogout={handleLogout} />
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}

function ToastContainer({ toasts }: { toasts: { id: string; message: string; type: string }[] }) {
  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium animate-slide-in pointer-events-auto ${
            t.type === 'success' ? 'bg-green-500' : t.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

function NotificationBell() {
  const state = useStore();
  const [show, setShow] = useState(false);
  const unread = state.alerts.filter(a => !a.read).length;

  return (
    <div className="relative">
      <button onClick={() => setShow(!show)} className="relative p-2 rounded-lg hover:bg-gray-100 transition">
        <span className="text-xl">🔔</span>
        {unread > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unread}
          </span>
        )}
      </button>
      {show && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShow(false)} />
          <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border z-50 max-h-96 overflow-y-auto">
            <div className="p-4 border-b font-semibold text-gray-700 sticky top-0 bg-white rounded-t-2xl">Notifications</div>
            {state.alerts.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">No alerts</div>
            ) : (
              state.alerts.slice(0, 15).map(a => (
                <div
                  key={a.id}
                  className={`p-3 border-b last:border-0 text-sm cursor-pointer hover:bg-gray-50 transition ${a.read ? '' : 'bg-yellow-50'}`}
                  onClick={() => markAlertRead(a.id)}
                >
                  <div className="flex items-start gap-2">
                    <span>{a.severity === 'critical' ? '🔴' : a.severity === 'warning' ? '🟡' : '🔵'}</span>
                    <div>
                      <p className="text-gray-700">{a.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDateTime(a.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ============ LOGOUT MODAL ============
function LogoutModal({ onClose, onLogout }: { onClose: () => void; onLogout: (closingCash?: number) => void }) {
  const [closingCash, setClosingCash] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="text-center mb-4">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🚪</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800">End Shift & Logout</h2>
          <p className="text-sm text-gray-500 mt-1">Enter your closing cash to complete your shift</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Closing Cash (BWP)</label>
            <input
              type="number"
              value={closingCash}
              onChange={e => setClosingCash(e.target.value)}
              placeholder="Enter closing cash amount"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition">
              Cancel
            </button>
            <button
              onClick={() => onLogout(closingCash ? parseFloat(closingCash) : undefined)}
              className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ DASHBOARD ============
function DashboardPage() {
  const state = useStore();
  const user = state.currentUser!;
  const activeShift = getActiveShift();
  const todayTx = getTodayTransactions();
  const todayDeposits = todayTx.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0);
  const todayWithdrawals = todayTx.filter(t => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0);
  const todayCommission = todayTx.reduce((s, t) => s + t.commission, 0);
  const totalFloat = getTotalFloat();
  const currentCash = getCurrentCash();
  const totalTx = todayTx.length;
  const avgTx = totalTx > 0 ? todayTx.reduce((s, t) => s + t.amount, 0) / totalTx : 0;
  const monthlyCommission = getCommissionByPeriod('month');

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

  const floatData = last7Days.map(date => {
    const dayTx = state.transactions.filter(t => t.createdAt <= date + 'T23:59:59');
    const floatChange = dayTx.reduce((s, t) => s + (t.type === 'deposit' ? t.amount : -t.amount), 0);
    return {
      date: new Date(date).toLocaleDateString('en', { weekday: 'short' }),
      float: state.wallets.reduce((s, w) => s + w.openingFloat, 0) + floatChange,
    };
  });

  const providerData = getCommissionByProvider().filter(p => p.commission > 0);

  return (
    <div className="space-y-6">
      {/* Shift Banner */}
      {activeShift && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 md:p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs font-medium uppercase tracking-wide">Active Shift</p>
              <p className="text-lg font-bold mt-0.5">{user.name}</p>
              <p className="text-green-100 text-sm">Started: {formatDateTime(activeShift.startTime)}</p>
            </div>
            <div className="text-right">
              <p className="text-green-100 text-xs">Opening Cash</p>
              <p className="text-xl font-bold">{formatCurrency(activeShift.openingCash)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Widget Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
        <WidgetCard label="Total Float" value={formatCurrency(totalFloat)} color="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200" icon="💰" />
        <WidgetCard label="Cash Available" value={formatCurrency(currentCash)} color="bg-gradient-to-br from-green-50 to-green-100 border-green-200" icon="💵" />
        <WidgetCard label="Today's Deposits" value={formatCurrency(todayDeposits)} color="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200" icon="📥" />
        <WidgetCard label="Today's Withdrawals" value={formatCurrency(todayWithdrawals)} color="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200" icon="📤" />
        <WidgetCard label="Today's Commission" value={formatCurrency(todayCommission)} color="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200" icon="💎" />
        <WidgetCard label="Transactions" value={totalTx.toString()} color="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200" icon="📊" />
        <WidgetCard label="Monthly Commission" value={formatCurrency(monthlyCommission)} color="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200" icon="📈" />
        <WidgetCard label="Avg Transaction" value={formatCurrency(avgTx)} color="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200" icon="📐" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4 text-sm md:text-base">Deposits vs Withdrawals (7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="deposits" fill="#10b981" name="Deposits" radius={[6, 6, 0, 0]} />
              <Bar dataKey="withdrawals" fill="#f97316" name="Withdrawals" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4 text-sm md:text-base">Daily Float Balance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={floatData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Area type="monotone" dataKey="float" stroke="#3b82f6" fill="#dbeafe" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Provider Performance + Float */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4 text-sm md:text-base">Commission by Provider</h3>
          {providerData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={providerData} dataKey="commission" nameKey="provider" cx="50%" cy="50%" outerRadius={80} label={({ provider }) => provider}>
                  {providerData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">No commission data yet</div>
          )}
        </div>
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4 text-sm md:text-base">Provider Float Balances</h3>
          <div className="space-y-3">
            {state.wallets.map(w => {
              const status = getWalletStatus(w.currentFloat, w.minThreshold);
              return (
                <div key={w.id} className={`flex items-center justify-between p-3 rounded-xl border ${getStatusBg(status)}`}>
                  <div>
                    <p className="font-semibold text-gray-700 text-sm">{w.provider} Money</p>
                    <p className="text-xs text-gray-500">Threshold: {formatCurrency(w.minThreshold)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800 text-sm">{formatCurrency(w.currentFloat)}</p>
                    <p className={`text-xs font-medium ${getStatusColor(status)}`}>
                      {status === 'healthy' ? '🟢 Healthy' : status === 'low' ? '🟡 Low' : '🔴 Critical'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-700 text-sm md:text-base">Recent Transactions</h3>
          <span className="text-xs text-gray-400">{state.transactions.length} total</span>
        </div>
        {state.transactions.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No transactions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b">
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Provider</th>
                  <th className="pb-2 font-medium text-right">Amount</th>
                  <th className="pb-2 font-medium text-right">Commission</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {state.transactions.slice(0, 8).map(tx => (
                  <tr key={tx.id} className="border-b last:border-0 text-sm">
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        tx.type === 'deposit' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {tx.type === 'deposit' ? '↓ Deposit' : '↑ Withdrawal'}
                      </span>
                    </td>
                    <td className="py-3 text-gray-700">{tx.customerNumber}</td>
                    <td className="py-3 text-gray-600">{tx.provider}</td>
                    <td className={`py-3 text-right font-semibold ${tx.type === 'deposit' ? 'text-green-600' : 'text-orange-600'}`}>
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="py-3 text-right text-purple-600 text-xs">{formatCurrency(tx.commission)}</td>
                    <td className="py-3 text-gray-400 text-xs">{formatDateTime(tx.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function WidgetCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: string }) {
  return (
    <div className={`p-3 md:p-4 rounded-2xl border ${color} transition hover:shadow-md`}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-sm md:text-base">{icon}</span>
        <p className="text-[10px] md:text-xs text-gray-500 font-medium truncate">{label}</p>
      </div>
      <p className="text-sm md:text-lg font-bold text-gray-800 truncate">{value}</p>
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
    t.customerNumber.includes(search) || t.reference.toLowerCase().includes(search.toLowerCase()) || t.agentName.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const headers = 'Date,Type,Provider,Customer,Amount,Commission,Reference,Agent,Status\n';
    const rows = filtered.map(t =>
      `${formatDate(t.createdAt)},${t.type},${t.provider},${t.customerNumber},${t.amount},${t.commission.toFixed(2)},${t.reference},${t.agentName},${t.status}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV exported successfully');
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h3 className="font-semibold text-gray-700">Transaction History</h3>
          <button onClick={exportCSV} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition">
            📥 Export CSV
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500" />
          <select value={filterType} onChange={e => setFilterType(e.target.value as 'all' | TransactionType)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm">
            <option value="all">All Types</option>
            <option value="deposit">Deposits</option>
            <option value="withdrawal">Withdrawals</option>
          </select>
          <select value={filterProvider} onChange={e => setFilterProvider(e.target.value as 'all' | Provider)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm">
            <option value="all">All Providers</option>
            <option value="Orange">Orange Money</option>
            <option value="Mascom">Mascom</option>
            <option value="MyZaka">MyZaka</option>
            <option value="eWallet">FNB eWallet</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
        <p className="text-sm text-gray-500 mb-4">{filtered.length} transaction{filtered.length !== 1 ? 's' : ''} found</p>
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No transactions found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Provider</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                  <th className="pb-3 font-medium text-right">Commission</th>
                  <th className="pb-3 font-medium">Agent</th>
                  <th className="pb-3 font-medium">Reference</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(tx => (
                  <tr key={tx.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                    <td className="py-3 text-sm text-gray-600">{formatDate(tx.createdAt)}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tx.type === 'deposit' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>{tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'}</span>
                    </td>
                    <td className="py-3 text-sm text-gray-700">{tx.provider}</td>
                    <td className="py-3 text-sm text-gray-700 font-medium">{tx.customerNumber}</td>
                    <td className={`py-3 text-sm text-right font-semibold ${tx.type === 'deposit' ? 'text-green-600' : 'text-orange-600'}`}>{formatCurrency(tx.amount)}</td>
                    <td className="py-3 text-sm text-right text-purple-600">{formatCurrency(tx.commission)}</td>
                    <td className="py-3 text-sm text-gray-600">{tx.agentName}</td>
                    <td className="py-3 text-xs text-gray-500 font-mono">{tx.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ FLOAT ============
function FloatPage({ showToast }: { showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
  const state = useStore();
  const [editingWallet, setEditingWallet] = useState<Provider | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('');
  const currentCash = getCurrentCash();
  const totalFloat = getTotalFloat();

  const handleTopUp = (provider: Provider) => {
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) { showToast('Enter valid amount', 'error'); return; }
    const wallet = state.wallets.find(w => w.provider === provider);
    if (wallet) {
      updateWallet(provider, { currentFloat: wallet.currentFloat + amount, lastTopUpAt: new Date().toISOString() });
      showToast(`${provider} float topped up by ${formatCurrency(amount)}`);
      setTopUpAmount(''); setEditingWallet(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
          <p className="text-blue-100 text-sm font-medium">Total Float</p>
          <p className="text-2xl md:text-3xl font-bold mt-1">{formatCurrency(totalFloat)}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-lg">
          <p className="text-green-100 text-sm font-medium">Cash on Hand</p>
          <p className="text-2xl md:text-3xl font-bold mt-1">{formatCurrency(currentCash)}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
          <p className="text-purple-100 text-sm font-medium">Opening Cash</p>
          <p className="text-2xl md:text-3xl font-bold mt-1">{formatCurrency(state.openingCash)}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg">
          <p className="text-orange-100 text-sm font-medium">Net Position</p>
          <p className="text-2xl md:text-3xl font-bold mt-1">{formatCurrency(totalFloat + currentCash)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-700 mb-4">Cash Position Formula</h3>
        <div className="text-sm text-gray-600 space-y-2 bg-gray-50 p-4 rounded-xl">
          <div className="flex justify-between"><span>Opening Cash:</span><span className="font-semibold">{formatCurrency(state.openingCash)}</span></div>
          <div className="flex justify-between text-green-600"><span>+ Today's Deposits:</span><span className="font-semibold">{formatCurrency(getTodayTransactions().filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0))}</span></div>
          <div className="flex justify-between text-orange-600"><span>- Today's Withdrawals:</span><span className="font-semibold">{formatCurrency(getTodayTransactions().filter(t => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0))}</span></div>
          <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-800 text-base"><span>= Current Cash:</span><span>{formatCurrency(currentCash)}</span></div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-700 mb-4 text-lg">Provider Wallets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {state.wallets.map(w => {
            const status = getWalletStatus(w.currentFloat, w.minThreshold);
            const pct = Math.min((w.currentFloat / (w.minThreshold * 3)) * 100, 100);
            return (
              <div key={w.id} className={`rounded-2xl p-5 border-2 ${getStatusBg(status)} shadow-sm`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg">{w.provider}</h4>
                    <p className={`text-xs font-semibold ${getStatusColor(status)}`}>
                      {status === 'healthy' ? '🟢 Healthy' : status === 'low' ? '🟡 Low' : '🔴 Critical'}
                    </p>
                  </div>
                  <p className="text-xl font-bold text-gray-800">{formatCurrency(w.currentFloat)}</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div className={`h-2 rounded-full transition-all ${status === 'healthy' ? 'bg-green-500' : status === 'low' ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4">
                  <div><p className="text-gray-400">Opening</p><p className="font-medium">{formatCurrency(w.openingFloat)}</p></div>
                  <div><p className="text-gray-400">Threshold</p><p className="font-medium">{formatCurrency(w.minThreshold)}</p></div>
                </div>
                {editingWallet === w.provider ? (
                  <div className="space-y-2">
                    <input type="number" placeholder="Amount" value={topUpAmount} onChange={e => setTopUpAmount(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                    <div className="flex gap-2">
                      <button onClick={() => handleTopUp(w.provider)} className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium">Top Up</button>
                      <button onClick={() => { setEditingWallet(null); setTopUpAmount(''); }} className="px-3 py-2 bg-gray-200 rounded-lg text-sm">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setEditingWallet(w.provider)} className="w-full py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">💰 Top Up</button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============ REPORTS ============
function ReportsPage() {
  const state = useStore();
  const [reportType, setReportType] = useState<'daily' | 'reconciliation' | 'monthly'>('daily');
  const todayTx = getTodayTransactions();
  const todayDeposits = todayTx.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0);
  const todayWithdrawals = todayTx.filter(t => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0);
  const todayCommission = todayTx.reduce((s, t) => s + t.commission, 0);
  const totalFloat = getTotalFloat();
  const currentCash = getCurrentCash();
  const [actualFloat, setActualFloat] = useState('');
  const [actualCash, setActualCash] = useState('');

  const handleReconcile = () => {
    const af = parseFloat(actualFloat);
    const ac = parseFloat(actualCash);
    if (isNaN(af) || isNaN(ac)) return;
    addReconciliation({
      date: new Date().toISOString().split('T')[0], systemFloat: totalFloat, actualFloat: af,
      systemCash: currentCash, actualCash: ac,
      agentId: state.currentUser!.id, agentName: state.currentUser!.name,
    });
    setActualFloat(''); setActualCash('');
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
        {[{ id: 'daily' as const, label: 'Daily' }, { id: 'monthly' as const, label: 'Monthly' }, { id: 'reconciliation' as const, label: 'Reconciliation' }].map(tab => (
          <button key={tab.id} onClick={() => setReportType(tab.id)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${reportType === tab.id ? 'bg-green-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {reportType === 'daily' && (
        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 text-lg mb-5">📋 Daily Report</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <ReportRow label="Opening Float" value={formatCurrency(state.wallets.reduce((s, w) => s + w.openingFloat, 0))} />
              <ReportRow label="Closing Float" value={formatCurrency(totalFloat)} highlight />
              <ReportRow label="Deposits" value={formatCurrency(todayDeposits)} color="text-green-600" />
              <ReportRow label="Withdrawals" value={formatCurrency(todayWithdrawals)} color="text-orange-600" />
            </div>
            <div className="space-y-3">
              <ReportRow label="Commission" value={formatCurrency(todayCommission)} color="text-purple-600" />
              <ReportRow label="Cash Position" value={formatCurrency(currentCash)} highlight />
              <ReportRow label="Transactions" value={todayTx.length.toString()} />
            </div>
          </div>
        </div>
      )}

      {reportType === 'monthly' && (
        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 text-lg mb-5">📈 Monthly Report</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <p className="text-xs text-green-600 font-medium">Monthly Deposits</p>
              <p className="text-xl font-bold text-green-800 mt-1">{formatCurrency(state.transactions.filter(t => t.type === 'deposit' && t.createdAt >= new Date(Date.now() - 30 * 86400000).toISOString()).reduce((s, t) => s + t.amount, 0))}</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
              <p className="text-xs text-orange-600 font-medium">Monthly Withdrawals</p>
              <p className="text-xl font-bold text-orange-800 mt-1">{formatCurrency(state.transactions.filter(t => t.type === 'withdrawal' && t.createdAt >= new Date(Date.now() - 30 * 86400000).toISOString()).reduce((s, t) => s + t.amount, 0))}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
              <p className="text-xs text-purple-600 font-medium">Commission Earned</p>
              <p className="text-xl font-bold text-purple-800 mt-1">{formatCurrency(getCommissionByPeriod('month'))}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-xs text-blue-600 font-medium">Total Transactions</p>
              <p className="text-xl font-bold text-blue-800 mt-1">{state.transactions.filter(t => t.createdAt >= new Date(Date.now() - 30 * 86400000).toISOString()).length}</p>
            </div>
          </div>
        </div>
      )}

      {reportType === 'reconciliation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-700 text-lg mb-4">⚖️ Daily Reconciliation</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div><p className="text-xs text-blue-600 font-medium">System Float</p><p className="font-bold text-blue-800 text-lg">{formatCurrency(totalFloat)}</p></div>
                <div><p className="text-xs text-blue-600 font-medium">System Cash</p><p className="font-bold text-blue-800 text-lg">{formatCurrency(currentCash)}</p></div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Actual Float</label>
                <input type="number" value={actualFloat} onChange={e => setActualFloat(e.target.value)} placeholder="Enter actual float" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Actual Cash</label>
                <input type="number" value={actualCash} onChange={e => setActualCash(e.target.value)} placeholder="Enter actual cash" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
              </div>
              {actualFloat && actualCash && (
                <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                  <p className="text-sm flex justify-between"><span>Float Variance:</span><span className={`font-bold ${parseFloat(actualFloat) - totalFloat === 0 ? 'text-green-600' : parseFloat(actualFloat) - totalFloat > 0 ? 'text-blue-600' : 'text-red-600'}`}>{formatCurrency(parseFloat(actualFloat) - totalFloat)}</span></p>
                  <p className="text-sm flex justify-between"><span>Cash Variance:</span><span className={`font-bold ${parseFloat(actualCash) - currentCash === 0 ? 'text-green-600' : parseFloat(actualCash) - currentCash > 0 ? 'text-blue-600' : 'text-red-600'}`}>{formatCurrency(parseFloat(actualCash) - currentCash)}</span></p>
                </div>
              )}
              <button onClick={handleReconcile} className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition">✅ Submit Reconciliation</button>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-700 text-lg mb-4">History</h3>
            {state.reconciliations.length === 0 ? (
              <p className="text-center text-gray-400 py-12">No reconciliations yet</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {state.reconciliations.map(r => (
                  <div key={r.id} className="p-4 bg-gray-50 rounded-xl border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">{formatDate(r.date)}</span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${r.status === 'balanced' ? 'bg-green-100 text-green-700' : r.status === 'over' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                        {r.status === 'balanced' ? '✅ Balanced' : r.status === 'over' ? '📈 Over' : '📉 Short'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>Float: <span className="font-medium">{formatCurrency(r.varianceFloat)}</span></div>
                      <div>Cash: <span className="font-medium">{formatCurrency(r.varianceCash)}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ReportRow({ label, value, color, highlight }: { label: string; value: string; color?: string; highlight?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-2 px-3 rounded-lg ${highlight ? 'bg-gray-50 font-semibold' : ''}`}>
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-sm font-bold ${color || 'text-gray-800'}`}>{value}</span>
    </div>
  );
}

// ============ USERS PAGE (ADMIN ONLY) ============
function UsersPage({ showToast }: { showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
  const state = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', username: '', password: '', role: 'agent' as Role, branchId: 'b1', phone: '', email: '' });

  const handleAdd = () => {
    if (!form.name || !form.username || !form.password) {
      showToast('Name, username and password required', 'error');
      return;
    }
    if (state.users.some(u => u.username.toLowerCase() === form.username.toLowerCase())) {
      showToast('Username already exists', 'error');
      return;
    }
    addUser(form);
    showToast(`User ${form.name} added successfully`);
    setForm({ name: '', username: '', password: '', role: 'agent', branchId: 'b1', phone: '', email: '' });
    setShowAddForm(false);
  };

  const handleUpdate = () => {
    if (!editingUser) return;
    updateUser(editingUser.id, {
      name: form.name || editingUser.name,
      username: form.username || editingUser.username,
      password: form.password || editingUser.password,
      role: form.role || editingUser.role,
      branchId: form.branchId || editingUser.branchId,
      phone: form.phone,
      email: form.email,
    });
    showToast('User updated');
    setEditingUser(null);
    setForm({ name: '', username: '', password: '', role: 'agent', branchId: 'b1', phone: '', email: '' });
  };

  const startEdit = (u: User) => {
    setEditingUser(u);
    setForm({ name: u.name, username: u.username, password: u.password, role: u.role, branchId: u.branchId, phone: u.phone || '', email: u.email || '' });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-gray-800">User Management</h3>
          <p className="text-sm text-gray-500">{state.users.length} users registered</p>
        </div>
        <button
          onClick={() => { setShowAddForm(!showAddForm); setEditingUser(null); setForm({ name: '', username: '', password: '', role: 'agent', branchId: 'b1', phone: '', email: '' }); }}
          className="px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition shadow-sm"
        >
          {showAddForm ? '✕ Cancel' : '+ Add New User'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingUser) && (
        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 animate-fade-in">
          <h4 className="font-semibold text-gray-700 mb-4">{editingUser ? '✏️ Edit User' : '➕ Add New User'}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name *</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., John Doe" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Username *</label>
              <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="e.g., johndoe" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Password *</label>
              <input type="text" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Password" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as Role })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm">
                <option value="agent">Agent</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Branch</label>
              <select value={form.branchId} onChange={e => setForm({ ...form, branchId: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm">
                {state.branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+267 7X XXX XXX" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={editingUser ? handleUpdate : handleAdd} className="px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition">
              {editingUser ? 'Update User' : 'Add User'}
            </button>
            <button onClick={() => { setShowAddForm(false); setEditingUser(null); }} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Username</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Branch</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.users.map(u => {
                const branch = state.branches.find(b => b.id === u.branchId);
                return (
                  <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.email || u.phone || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-mono">{u.username}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'supervisor' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{branch?.name || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${u.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {u.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => startEdit(u)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">✏️</button>
                        <button onClick={() => { toggleUserActive(u.id); showToast(`${u.name} ${u.active ? 'deactivated' : 'activated'}`); }} className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition" title="Toggle Active">
                          {u.active ? '🔒' : '🔓'}
                        </button>
                        {u.id !== state.currentUser?.id && (
                          <button onClick={() => { if (confirm(`Delete ${u.name}?`)) { deleteUser(u.id); showToast('User deleted', 'info'); } }} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">🗑️</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============ SHIFTS PAGE ============
function ShiftsPage({ showToast }: { showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
  const state = useStore();
  const user = state.currentUser!;
  const isAdmin = user.role === 'admin';
  const [filterUser, setFilterUser] = useState<string>('all');

  let shifts = state.shifts;
  if (!isAdmin) {
    shifts = shifts.filter(s => s.userId === user.id);
  } else if (filterUser !== 'all') {
    shifts = shifts.filter(s => s.userId === filterUser);
  }

  const activeShift = getActiveShift();

  // Stats
  const totalShifts = shifts.length;
  const totalHours = shifts.filter(s => s.endTime).reduce((sum, s) => {
    const start = new Date(s.startTime).getTime();
    const end = new Date(s.endTime!).getTime();
    return sum + (end - start) / (1000 * 60 * 60);
  }, 0);
  const totalCommission = shifts.reduce((sum, s) => sum + s.totalCommission, 0);
  const totalTransactions = shifts.reduce((sum, s) => sum + s.transactionsCount, 0);

  return (
    <div className="space-y-6">
      {/* Current Shift Banner */}
      {activeShift && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
            <h3 className="font-bold text-lg">Current Shift Active</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-green-100 text-xs">Started</p>
              <p className="font-bold">{formatDateTime(activeShift.startTime)}</p>
            </div>
            <div>
              <p className="text-green-100 text-xs">Duration</p>
              <p className="font-bold">{getShiftDuration(activeShift.startTime)}</p>
            </div>
            <div>
              <p className="text-green-100 text-xs">Transactions</p>
              <p className="font-bold">{getTodayTransactions().length}</p>
            </div>
            <div>
              <p className="text-green-100 text-xs">Commission</p>
              <p className="font-bold">{formatCurrency(getTodayTransactions().reduce((s, t) => s + t.commission, 0))}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 font-medium">Total Shifts</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{totalShifts}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 font-medium">Total Hours</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{totalHours.toFixed(1)}h</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 font-medium">Total Commission</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalCommission)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 font-medium">Total Transactions</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{totalTransactions}</p>
        </div>
      </div>

      {/* Filter */}
      {isAdmin && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Filter by User:</label>
            <select value={filterUser} onChange={e => setFilterUser(e.target.value)} className="flex-1 sm:flex-none px-3 py-2 border border-gray-200 rounded-xl text-sm">
              <option value="all">All Users</option>
              {state.users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Shift History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 md:p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700">Shift History</h3>
        </div>
        {shifts.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No shifts recorded yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3 font-medium">Agent</th>
                  <th className="px-4 py-3 font-medium">Start Time</th>
                  <th className="px-4 py-3 font-medium">End Time</th>
                  <th className="px-4 py-3 font-medium">Duration</th>
                  <th className="px-4 py-3 font-medium text-right">Opening Cash</th>
                  <th className="px-4 py-3 font-medium text-right">Closing Cash</th>
                  <th className="px-4 py-3 font-medium text-right">Deposits</th>
                  <th className="px-4 py-3 font-medium text-right">Withdrawals</th>
                  <th className="px-4 py-3 font-medium text-right">Commission</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map(s => (
                  <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {s.userName.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{s.userName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(s.startTime)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{s.endTime ? formatDateTime(s.endTime) : '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                      {s.endTime ? getShiftDuration(s.startTime, s.endTime) : getShiftDuration(s.startTime)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">{formatCurrency(s.openingCash)}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">{s.closingCash !== null ? formatCurrency(s.closingCash) : '-'}</td>
                    <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">{formatCurrency(s.totalDeposits)}</td>
                    <td className="px-4 py-3 text-sm text-right text-orange-600 font-medium">{formatCurrency(s.totalWithdrawals)}</td>
                    <td className="px-4 py-3 text-sm text-right text-purple-600 font-medium">{formatCurrency(s.totalCommission)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                        {s.status === 'active' ? 'Active' : 'Ended'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function getShiftDuration(startTime: string, endTime?: string | null): string {
  const start = new Date(startTime).getTime();
  const end = endTime ? new Date(endTime).getTime() : Date.now();
  const diffMs = end - start;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

// ============ SETTINGS ============
function SettingsPage({ showToast }: { showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
  const state = useStore();
  const user = state.currentUser!;
  const [newCash, setNewCash] = useState(state.openingCash.toString());

  const handleSetCash = () => {
    const amount = parseFloat(newCash);
    if (isNaN(amount) || amount < 0) { showToast('Enter valid amount', 'error'); return; }
    setOpeningCash(amount);
    showToast('Opening cash updated');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profile */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-700 text-lg mb-4">👤 My Profile</h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="text-lg font-bold text-gray-800">{user.name}</p>
            <p className="text-sm text-gray-500 capitalize">{user.role}</p>
            <p className="text-xs text-gray-400">@{user.username}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {user.email && <div className="p-3 bg-gray-50 rounded-xl"><span className="text-gray-500">Email:</span> <span className="font-medium text-gray-700">{user.email}</span></div>}
          {user.phone && <div className="p-3 bg-gray-50 rounded-xl"><span className="text-gray-500">Phone:</span> <span className="font-medium text-gray-700">{user.phone}</span></div>}
          <div className="p-3 bg-gray-50 rounded-xl"><span className="text-gray-500">Branch:</span> <span className="font-medium text-gray-700">{state.branches.find(b => b.id === user.branchId)?.name || '-'}</span></div>
          <div className="p-3 bg-gray-50 rounded-xl"><span className="text-gray-500">Joined:</span> <span className="font-medium text-gray-700">{formatDate(user.createdAt)}</span></div>
        </div>
      </div>

      {/* Opening Cash */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-700 text-lg mb-4">💵 Opening Cash</h3>
        <div className="flex gap-3 max-w-md">
          <input type="number" value={newCash} onChange={e => setNewCash(e.target.value)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
          <button onClick={handleSetCash} className="px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition">Update</button>
        </div>
      </div>

      {/* Commission Rates (Admin) */}
      {user.role === 'admin' && (
        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 text-lg mb-4">💎 Commission Rates (%)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {state.commissionRates.map(cr => (
              <div key={cr.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border">
                <div><span className="text-sm font-medium text-gray-700">{cr.provider}</span><span className="text-xs text-gray-500 ml-2 capitalize">{cr.transactionType}</span></div>
                <div className="flex items-center gap-1">
                  <input type="number" step="0.1" value={cr.rate} onChange={e => updateCommissionRate(cr.id, parseFloat(e.target.value) || 0)} className="w-16 px-2 py-1.5 border rounded-lg text-sm text-right" />
                  <span className="text-xs text-gray-400">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wallet Thresholds */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-700 text-lg mb-4">⚠️ Float Thresholds</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {state.wallets.map(w => (
            <div key={w.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border">
              <span className="text-sm font-medium text-gray-700">{w.provider}</span>
              <input type="number" value={w.minThreshold} onChange={e => updateWallet(w.provider, { minThreshold: parseFloat(e.target.value) || 0 })} className="w-28 px-2 py-1.5 border rounded-lg text-sm text-right" />
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      {user.role === 'admin' && (
        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-red-100">
          <h3 className="font-semibold text-red-600 text-lg mb-2">⚠️ Danger Zone</h3>
          <p className="text-sm text-gray-500 mb-4">Reset all data to factory defaults. This cannot be undone.</p>
          <button onClick={() => { if (confirm('Reset all data? This cannot be undone.')) { resetState(); showToast('All data reset', 'info'); } }} className="px-6 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-medium hover:bg-red-100 transition">
            🗑️ Reset All Data
          </button>
        </div>
      )}

      {/* About / Credits */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 md:p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Proudly Built By</p>
            <h3 className="text-2xl font-bold mb-1">Verge Dynamics</h3>
            <p className="text-gray-300 text-sm mb-3">
              Enterprise software solutions for mobile money & fintech innovation.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 bg-white/10 rounded-full">Mobile Money</span>
              <span className="px-2.5 py-1 bg-white/10 rounded-full">Fintech</span>
              <span className="px-2.5 py-1 bg-white/10 rounded-full">Agent Banking</span>
              <span className="px-2.5 py-1 bg-white/10 rounded-full">Enterprise Solutions</span>
            </div>
          </div>
        </div>
        <div className="mt-5 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-400">
          <p>MobiCash Agent Banking System v1.0</p>
          <p>© {new Date().getFullYear()} Verge Dynamics. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

// ============ TRANSACTION MODAL ============
function TransactionModal({ type, onClose, showToast }: { type: 'deposit' | 'withdrawal'; onClose: () => void; showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
  const state = useStore();
  const user = state.currentUser!;
  const [customerNumber, setCustomerNumber] = useState('');
  const [provider, setProvider] = useState<Provider>('Orange');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');

  // Check if user has active shift
  const activeShift = getActiveShift();
  if (!activeShift) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
          <div className="text-center">
            <div className="w-14 h-14 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No Active Shift</h2>
            <p className="text-sm text-gray-500 mb-4">You must be logged in with an active shift to process transactions.</p>
            <button onClick={onClose} className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-medium">OK</button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!customerNumber || !amount || !reference) { showToast('Fill all fields', 'error'); return; }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { showToast('Enter valid amount', 'error'); return; }
    if (type === 'withdrawal') {
      const wallet = state.wallets.find(w => w.provider === provider);
      if (wallet && wallet.currentFloat < amt) {
        showToast(`Insufficient ${provider} float! Available: ${formatCurrency(wallet.currentFloat)}`, 'error');
        return;
      }
    }
    addTransaction({
      type, provider, customerNumber, amount: amt,
      agentId: user.id, agentName: user.name,
      reference, status: 'completed', shiftId: activeShift.id,
    });
    showToast(`${type === 'deposit' ? 'Deposit' : 'Withdrawal'} of ${formatCurrency(amt)} recorded!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-gray-800">{type === 'deposit' ? '📥 New Deposit' : '📤 New Withdrawal'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Customer Number</label>
            <input type="tel" value={customerNumber} onChange={e => setCustomerNumber(e.target.value)} placeholder="e.g., 71234567" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Provider</label>
            <select value={provider} onChange={e => setProvider(e.target.value as Provider)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm">
              <option value="Orange">Orange Money</option>
              <option value="Mascom">Mascom</option>
              <option value="MyZaka">MyZaka</option>
              <option value="eWallet">FNB eWallet</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Amount (BWP)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g., 500" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Reference Number</label>
            <div className="flex gap-2">
              <input type="text" value={reference} onChange={e => setReference(e.target.value)} placeholder="e.g., OM123456" className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm" />
              <button onClick={() => setReference(generateRef(provider))} className="px-4 py-3 bg-gray-100 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-200 whitespace-nowrap">Auto</button>
            </div>
          </div>
          {amount && parseFloat(amount) > 0 && (
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
              <p className="text-xs text-purple-600 font-medium">Commission ({state.commissionRates.find(r => r.provider === provider && r.transactionType === type)?.rate || 0.5}%)</p>
              <p className="text-lg font-bold text-purple-800 mt-1">{formatCurrency(parseFloat(amount) * ((state.commissionRates.find(r => r.provider === provider && r.transactionType === type)?.rate || 0.5) / 100))}</p>
            </div>
          )}
          <button onClick={handleSubmit} className={`w-full py-3.5 rounded-xl font-semibold text-white transition shadow-sm ${type === 'deposit' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500 hover:bg-orange-600'}`}>
            {type === 'deposit' ? '✅ Save Deposit' : '✅ Process Withdrawal'}
          </button>
        </div>
      </div>
    </div>
  );
}
