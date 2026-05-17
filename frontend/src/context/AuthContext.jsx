import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'suraksha_session';

export const INTERNAL_ROLES = [
  'admin',
  'bank_employee',
  'underwriter',
  'compliance_auditor',
];

const ROLE_LABELS = {
  admin: { en: 'Admin / Bank Employee', hi: 'प्रशासक / बैंक कर्मचारी' },
  bank_employee: { en: 'Senior Underwriter', hi: 'वरिष्ठ अंडरराइटर' },
  underwriter: { en: 'Senior Underwriter', hi: 'वरिष्ठ अंडरराइटर' },
  compliance_auditor: { en: 'Internal Compliance Auditor', hi: 'आंतरिक अनुपालन ऑडिटर' },
};

const AuthContext = createContext(null);

export function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '—';
}

export function getRoleLabel(role, lang = 'en') {
  return ROLE_LABELS[role]?.[lang] ?? ROLE_LABELS.bank_employee[lang];
}

function readSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(readSession());
    setLoading(false);
  }, []);

  const login = useCallback((credentials) => {
    const role = credentials.role || 'bank_employee';
    const session = {
      id: credentials.id || `emp-${Date.now()}`,
      name: credentials.name?.trim() || '',
      email: credentials.email || '',
      role,
      branch: credentials.branch || '',
      loggedInAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    localStorage.setItem('token', `suraksha-${session.id}`);
    setUser(session);
    return session;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const isInternalEmployee = user && INTERNAL_ROLES.includes(user.role);

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: Boolean(user),
    isInternalEmployee,
    initials: user ? getInitials(user.name) : '',
    designation: (lang) => (user ? getRoleLabel(user.role, lang) : ''),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
