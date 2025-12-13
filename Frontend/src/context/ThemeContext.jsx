import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../api/axios';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'dark';
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const fetchThemePreference = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('/users/preferences');
          if (response.data.success && response.data.data?.theme) {
            setTheme(response.data.data.theme);
          }
        } catch (error) {
          console.log('Could not fetch theme preference');
        }
      }
      setLoading(false);
    };

    fetchThemePreference();
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
  };

  const value = {
    theme,
    loading,
    toggleTheme,
    updateTheme,
    isDark: theme === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};




