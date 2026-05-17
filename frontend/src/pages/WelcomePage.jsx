import { Link } from 'react-router-dom';
import { Shield, Zap, FileSearch, Fingerprint } from 'lucide-react';
import './WelcomePage.css';

const FEATURES = [
  {
    icon: Zap,
    title: 'Real-time Anomaly Detection',
    description:
      'Instant scoring of loan applications against 500+ fraud markers using high-speed ML pipelines.',
  },
  {
    icon: FileSearch,
    title: 'Automated KYC Audit',
    description:
      'Deep-scan document analysis for tampering, OCR verification, and cross-reference with central registries.',
  },
  {
    icon: Fingerprint,
    title: 'Behavioral Biometrics',
    description:
      'Advanced user-pattern recognition to prevent account takeover and identity theft in digital banking.',
  },
];

export default function WelcomePage() {
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="welcome-landing">
      <nav className="welcome-navbar" aria-label="Main">
        <div className="welcome-nav-left">
          <div className="header-logo-container">
            <span className="shield-box">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M12 2L4 5V11C4 16.06 7.41 20.74 12 22C16.59 20.74 20 16.06 20 11V5L12 2Z" fill="#3b82f6" />
                <path
                  d="M12 2L4 5V11C4 16.06 7.41 20.74 12 22C16.59 20.74 20 16.06 20 11V5L12 2Z"
                  stroke="#00579c"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="brand-text">
              <span className="brand-sukrasha">Sukrasha</span>
              <span className="brand-bank">Canara Bank</span>
            </span>
          </div>
          <div className="welcome-nav-links">
            <button type="button" className="nl" onClick={scrollToFeatures}>
              Platform
            </button>
            <button type="button" className="nl" onClick={scrollToFeatures}>
              Security
            </button>
            <button type="button" className="nl" onClick={scrollToFeatures}>
              Compliance
            </button>
          </div>
        </div>
        <div className="welcome-nav-right">
          <Link to="/login" className="btn-nav-login">
            Log In
          </Link>
          <Link to="/login" className="btn-nav-signup">
            Request Access
          </Link>
        </div>
      </nav>

      <section className="hero">
        <span className="hero-grid" aria-hidden="true" />
        <article className="hero-content">
          <p className="hero-badge">
            <Shield size={14} className="hero-badge-icon" aria-hidden="true" />
            Secured by Sukrasha Enterprise Fraud Intelligence
          </p>
          <h1 className="hero-title">
            The Gold Standard in
            <br />
            <span>Banking Intelligence.</span>
          </h1>
          <p className="hero-sub">
            Canara Bank&apos;s premier AI-driven ecosystem for real-time document verification,
            behavioral analytics, and automated fraud prevention.
          </p>
          <div className="hero-cta">
            <Link to="/login" className="btn-primary">
              Access Officer Dashboard
            </Link>
            <Link to="/customer" className="btn-hero-outline">
              Customer dashboard
            </Link>
            <button type="button" className="btn-hero-outline" onClick={scrollToFeatures}>
              View Security Protocol
            </button>
          </div>
        </article>
      </section>

      <section id="features" className="features">
        <header className="section-header">
          <span className="section-tag">Core Modules</span>
          <h2 className="section-title">Underwriting Intelligence</h2>
        </header>
        <div className="feat-grid">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <article key={title} className="feat-card">
              <span className="feat-icon">
                <Icon size={24} strokeWidth={2} aria-hidden="true" />
              </span>
              <h3 className="feat-h">{title}</h3>
              <p className="feat-p">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div className="footer-col">
              <div className="footer-brand-block">
                <span className="brand-text">
                  <span className="brand-sukrasha">Sukrasha</span>
                  <span className="brand-bank">Intelligence platform</span>
                </span>
              </div>
              <p className="footer-tagline">
                Proprietary security infrastructure for Canara Bank Officers and Branches.
              </p>
            </div>
            <div className="footer-col">
              <h4>Resources</h4>
              <a href="#features">Security Whitepaper</a>
              <a href="#features">RBI Compliance Docs</a>
              <a href="#features">Officer Training</a>
            </div>
            <div className="footer-col">
              <h4>Support</h4>
              <a href="#features">Help Center</a>
              <a href="#features">IT Helpdesk</a>
              <a href="#features">Contact Admin</a>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <a href="#features">Privacy Policy</a>
              <a href="#features">DPDP Compliance</a>
              <a href="#features">Terms of Use</a>
            </div>
          </div>
          <p className="footer-copy">
            © 2025 Canara Bank. &quot;Together We Can&quot; — Serving to grow, growing to serve.
          </p>
        </div>
      </footer>
    </div>
  );
}
