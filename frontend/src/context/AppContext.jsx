import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [familyMode, setFamilyMode] = useState(() => {
    return localStorage.getItem('familyMode') === 'true';
  });

  const [guardianAlert, setGuardianAlert] = useState(null); // { message, riskLevel }

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

  // Apply/remove family-mode class on body
  useEffect(() => {
    if (familyMode) {
      document.body.classList.add('family-mode');
    } else {
      document.body.classList.remove('family-mode');
    }
  }, [familyMode]);

  return (
    <AppContext.Provider
      value={{ familyMode, toggleFamilyMode, guardianAlert, triggerGuardianAlert, dismissGuardianAlert }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
