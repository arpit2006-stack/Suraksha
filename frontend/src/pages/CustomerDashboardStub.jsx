import { Link } from 'react-router-dom';

export default function CustomerDashboardStub() {
  return (
    <div className="welcome-page">
      <header className="welcome-hero">
        <h1>Customer Dashboard</h1>
        <p>Built by a separate team — placeholder route for non-internal roles.</p>
        <Link to="/login" className="btn btn--outline">Employee login</Link>
      </header>
    </div>
  );
}
