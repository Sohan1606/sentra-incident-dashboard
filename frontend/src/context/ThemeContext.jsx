import React, { createContext, useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import getTheme from '../theme';

export const ThemeContext = createContext();

export const ThemeProviderWrapper = ({ children }) => {
  const [mode, setMode] = useState(() => {
    // Get initial theme from localStorage or default to light
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'light';
  });

  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  const theme = getTheme(mode);

  useEffect(() => {
    // Apply theme to document for CSS custom properties if needed
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
