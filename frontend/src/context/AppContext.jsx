import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/axios';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [familyMode, setFamilyMode] = useState(() => localStorage.getItem('familyMode') === 'true');
  const [lang, setLang] = useState(() => localStorage.getItem('suraksha_lang') || 'en');
  const [guardianAlert, setGuardianAlert] = useState(null);
  
  // Global Auth State
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));

  // Authentication Methods
  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const toggleLang = () => {
    setLang((prev) => {
      const next = prev === 'en' ? 'hi' : 'en';
      localStorage.setItem('suraksha_lang', next);
      return next;
    });
  };

  const toggleFamilyMode = () => {
    setFamilyMode((prev) => {
      const next = !prev;
      localStorage.setItem('familyMode', next);
      return next;
    });
  };

  const triggerGuardianAlert = (message, riskLevel = 'high') => {
    if (familyMode) {
      setGuardianAlert({ message, riskLevel });
    }
  };

  const dismissGuardianAlert = () => setGuardianAlert(null);

  useEffect(() => {
    if (familyMode) {
      document.documentElement.classList.add('family-mode');
    } else {
      document.documentElement.classList.remove('family-mode');
    }
  }, [familyMode]);

  return (
    <AppContext.Provider
      value={{
        familyMode, toggleFamilyMode,
        lang, toggleLang,
        guardianAlert, triggerGuardianAlert, dismissGuardianAlert,
        user, isAuthenticated, login, logout
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
