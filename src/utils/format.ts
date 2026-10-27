export function formatCurrency(amount: number): string {
  return `P${amount.toLocaleString('en-BW', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-BW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-BW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateRef(provider: string): string {
  const prefix = provider === 'Orange' ? 'OM' : provider === 'Mascom' ? 'MC' : provider === 'MyZaka' ? 'MZ' : provider === 'eWallet' ? 'EW' : 'OT';
  return prefix + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 3).toUpperCase();
}

export function getWalletStatus(currentFloat: number, threshold: number): 'healthy' | 'low' | 'critical' {
  if (currentFloat < threshold) return 'critical';
  if (currentFloat < threshold * 1.5) return 'low';
  return 'healthy';
}

export function getStatusColor(status: 'healthy' | 'low' | 'critical'): string {
  switch (status) {
    case 'healthy': return 'text-green-500';
    case 'low': return 'text-yellow-500';
    case 'critical': return 'text-red-500';
  }
}

export function getStatusBg(status: 'healthy' | 'low' | 'critical'): string {
  switch (status) {
    case 'healthy': return 'bg-green-100 border-green-300';
    case 'low': return 'bg-yellow-100 border-yellow-300';
    case 'critical': return 'bg-red-100 border-red-300';
  }
}
