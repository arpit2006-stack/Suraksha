import { NavLink } from 'react-router-dom';
import { Shield, FileSearch, EyeOff, Globe, BookOpen, Sun } from 'lucide-react';
import { useApp } from '../context/AppContext';

const navLinks = [
  { to: '/', label: 'Dashboard', icon: Shield },
  { to: '/document-verify', label: 'Document Verify', icon: FileSearch },
  { to: '/data-masker', label: 'Data Masker', icon: EyeOff },
  { to: '/url-scanner', label: 'URL Scanner', icon: Globe },
  { to: '/compliance', label: 'Compliance', icon: BookOpen },
];

export default function Navbar() {
  const { familyMode, toggleFamilyMode } = useApp();

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <Shield size={24} className="brand-icon" />
        <span className="brand-name">
          Su<span className="brand-accent">Raksha</span>
        </span>
      </div>

      <nav className="navbar-links">
        {navLinks.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link--active' : ''}`
            }
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="navbar-actions">
        <div className="family-toggle-wrapper">
          <Sun size={14} />
          <span className="family-toggle-label">Family Mode</span>
          <button
            className={`toggle-switch ${familyMode ? 'toggle-switch--on' : ''}`}
            onClick={toggleFamilyMode}
            aria-label="Toggle Family Mode"
          >
            <span className="toggle-thumb" />
          </button>
        </div>
        <div className="avatar">AS</div>
      </div>
    </header>
  );
}
