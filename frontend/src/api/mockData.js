// Mock responses matching Python backend schemas

export const mockDocumentVerify = (status = 'FORGED') => ({
  status,           // GENUINE | SUSPICIOUS | FORGED
  confidence: 94.2,
  anomalies: [
    { type: 'Metadata Tampering', detail: 'Photoshop CC 2022 editing detected in EXIF data', severity: 'high' },
    { type: 'Font Inconsistency', detail: 'Arial Bold replaced with DejaVu Sans at page 2', severity: 'medium' },
    { type: 'Hash Mismatch', detail: 'SHA-256 digest does not match issuer certificate', severity: 'high' },
    { type: 'Digital Signature Invalid', detail: 'Signer certificate revoked on 2024-01-15', severity: 'high' },
  ],
  hash_verification: {
    sha256: '3a7f9c2e...mismatch',
    md5: 'a1b2c3d4...mismatch',
    is_valid: false,
  },
  metadata: {
    creator: 'Adobe Photoshop CC 2022',
    created: '2024-03-10T14:22:11',
    modified: '2025-01-08T09:45:32',
    author: 'Unknown',
    pdf_version: '1.7',
  },
});

export const mockMaskData = (raw) => ({
  audit_id: `AUD-MOCK-${Date.now().toString(36).toUpperCase()}`,
  masked_data: raw
    .replace(/\b\d{10,16}\b/g, '[MASKED_ACC_NO]')
    .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[MASKED_CARD]')
    .replace(/\b[A-Z]{4}\d{7}\b/g, '[MASKED_IFSC]')
    .replace(/\b[6-9]\d{9}\b/g, '[MASKED_PHONE]')
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[MASKED_EMAIL]')
    .replace(/\b\d{12}\b/g, '[MASKED_AADHAAR]')
    .replace(/[A-Z]{5}\d{4}[A-Z]\b/g, '[MASKED_PAN]'),
  entities_found: [
    { type: 'Bank Account Number', count: 1 },
    { type: 'Phone Number', count: 1 },
    { type: 'Email Address', count: 1 },
  ],
});

export const mockScanUrl = (score = 87) => ({
  url: 'https://hdfc-bank-secure-login.ru/auth',
  threat_score: score,
  risk_level: score > 70 ? 'Dangerous' : score > 30 ? 'Warning' : 'Safe',
  detected_brand: 'HDFC Bank',
  threat_types: ['Phishing', 'Domain Spoofing', 'Financial Fraud'],
  reasoning:
    'This site mimics an HDFC Bank login page but the domain is registered in Russia (.ru TLD). The SSL certificate was issued only 3 days ago. The login form submits credentials to a foreign IP (195.24.66.78). Gemini AI has flagged this as a high-confidence phishing attack targeting Indian banking customers.',
  domain_info: {
    registrar: 'REG.RU LLC',
    country: 'Russia',
    created: '2025-05-10',
    ssl_valid: true,
  },
});

export const mockRegulatoryScan = () => ({
  circulars: [
    {
      id: 'RBI/2025-26/001',
      title: 'Master Direction – Know Your Customer (KYC) Direction, 2025 Amendment',
      date: '2025-05-01',
      category: 'KYC/AML',
      priority: 'critical',
      summary: null,
      status: 'Pending Review',
    },
    {
      id: 'RBI/2025-26/012',
      title: 'Guidelines on Digital Lending – Data Privacy Clause Update',
      date: '2025-04-18',
      category: 'Data Privacy',
      priority: 'high',
      summary: null,
      status: 'Pending Review',
    },
    {
      id: 'RBI/2025-26/023',
      title: 'Cyber Security Framework for Urban Co-operative Banks',
      date: '2025-03-30',
      category: 'Cyber Security',
      priority: 'high',
      summary: null,
      status: 'Approved',
    },
    {
      id: 'SEBI/HO/2025/034',
      title: 'Prevention of Insider Trading Regulations – System Audit Mandate',
      date: '2025-02-14',
      category: 'Compliance',
      priority: 'medium',
      summary: null,
      status: 'Approved',
    },
    {
      id: 'RBI/2025-26/045',
      title: 'Prudential Norms on Stressed Asset Classification (NPA)',
      date: '2025-01-22',
      category: 'Prudential',
      priority: 'medium',
      summary: null,
      status: 'Pending Review',
    },
  ],
  action_points: [
    'Implement enhanced video KYC for all accounts above ₹1 lakh balance by Q2 2025.',
    'Update data retention policy to not store raw biometric data beyond 90 days.',
    'Conduct quarterly penetration testing on all internet-facing banking portals.',
    'File Suspicious Transaction Reports (STR) within 7 days of detection.',
  ],
});
