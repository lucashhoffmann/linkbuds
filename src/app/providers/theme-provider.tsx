import { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light' | 'system';
export type ColorTheme = 'default' | 'violet' | 'red' | 'green' | 'blue';

const themeOptions: Theme[] = ['dark', 'light', 'system'];
const colorThemeOptions: ColorTheme[] = [
  'default',
  'violet',
  'red',
  'green',
  'blue',
];

const isTheme = (value: string | null): value is Theme =>
  value !== null && themeOptions.includes(value as Theme);

const isColorTheme = (value: string | null): value is ColorTheme =>
  value !== null && colorThemeOptions.includes(value as ColorTheme);

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  defaultColorTheme?: ColorTheme;
  colorStorageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colorTheme: ColorTheme;
  setColorTheme: (colorTheme: ColorTheme) => void;
  isDark: boolean;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  colorTheme: 'default',
  setColorTheme: () => null,
  isDark: false,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  defaultColorTheme = 'default',
  colorStorageKey = 'vite-ui-color-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem(storageKey);
    return isTheme(storedTheme) ? storedTheme : defaultTheme;
  });

  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    const storedColorTheme = localStorage.getItem(colorStorageKey);
    return isColorTheme(storedColorTheme)
      ? storedColorTheme
      : defaultColorTheme;
  });

  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const isDark = theme === 'system' ? systemTheme === 'dark' : theme === 'dark';

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const root = window.document.documentElement;

    if (colorTheme === 'default') {
      root.removeAttribute('data-color-theme');
      return;
    }

    root.setAttribute('data-color-theme', colorTheme);
  }, [colorTheme]);

  const value = {
    isDark,
    theme,
    setTheme: (nextTheme: Theme) => {
      localStorage.setItem(storageKey, nextTheme);
      setThemeState(nextTheme);
    },
    colorTheme,
    setColorTheme: (nextColorTheme: ColorTheme) => {
      localStorage.setItem(colorStorageKey, nextColorTheme);
      setColorThemeState(nextColorTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider
      {...props}
      value={value}
    >
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
