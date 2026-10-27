import { useState, useEffect, useCallback } from 'react';
import { getState, subscribe } from './store';
import { AppState } from './types';

export function useStore(): AppState {
  const [state, setState] = useState<AppState>(getState());
  useEffect(() => {
    const unsubscribe = subscribe(() => setState(getState()));
    return unsubscribe;
  }, []);
  return state;
}

export function useToast() {
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);
  return { toasts, showToast };
}
