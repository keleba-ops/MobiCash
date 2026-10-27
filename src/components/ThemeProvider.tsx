import { useEffect, useState } from 'react';
import { useStore } from '../hooks';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const state = useStore();
  const { theme } = state;
  const [systemDark, setSystemDark] = useState(false);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemDark(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Apply theme
  useEffect(() => {
    const isDark = theme.mode === 'dark' || (theme.mode === 'system' && systemDark);
    const root = document.documentElement;

    // Apply dark/light mode
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    // Apply CSS variables
    root.style.setProperty('--color-primary', theme.primaryColor);
    root.style.setProperty('--color-accent', theme.accentColor);

    // Border radius
    const radiusMap = {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
    };
    root.style.setProperty('--border-radius', radiusMap[theme.borderRadius]);

    // Update meta theme-color for mobile browsers
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', isDark ? '#1f2937' : theme.primaryColor);
  }, [theme, systemDark]);

  return <>{children}</>;
}
