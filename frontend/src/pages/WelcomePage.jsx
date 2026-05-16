import { Link } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';

export default function WelcomePage() {
  return (
    <div className="welcome-page">
      <header className="welcome-hero">
        <Shield size={48} className="welcome-icon" />
        <h1>SuRaksha</h1>
        <p className="welcome-tagline">
          Canara Bank unified security ecosystem — employee, compliance, and customer portals.
        </p>
        <div className="welcome-actions">
          <Link to="/login" className="btn btn--primary">
            Employee login <ArrowRight size={16} />
          </Link>
          <Link to="/customer" className="btn btn--outline">
            Customer dashboard
          </Link>
        </div>
      </header>
    </div>
  );
}
