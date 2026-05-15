import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import GuardianAlert from './components/GuardianAlert';
import SentinelDashboard from './components/homepage';
import DocumentVerifier from './components/DocumentVerifier';
import DataMasker from './components/DataMasker';
import UrlScanner from './components/UrlScanner';
import ComplianceDashboard from './components/ComplianceDashboard';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Navbar />
          <main className="app-main">
            <Routes>
              <Route path="/"                 element={<SentinelDashboard />} />
              <Route path="/document-verify"  element={<DocumentVerifier />} />
              <Route path="/data-masker"      element={<DataMasker />} />
              <Route path="/url-scanner"      element={<UrlScanner />} />
              <Route path="/compliance"       element={<ComplianceDashboard />} />
            </Routes>
          </main>
        </div>
        <GuardianAlert />
      </BrowserRouter>
    </AppProvider>
  );
}
