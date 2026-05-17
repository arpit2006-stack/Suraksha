import { useCallback } from 'react';
import { useApp } from '../context/AppContext';

const COPY = {
  dashboardTitle: { en: 'Underwriter Command Center', hi: 'अंडरराइटर कमांड सेंटर' },
  dashboardSubtitle: {
    en: 'Canara Bank internal security & compliance operations',
    hi: 'केनरा बैंक आंतरिक सुरक्षा और अनुपालन संचालन',
  },
  phishingRadar: { en: 'Phishing Radar & Ghost Recon', hi: 'फ़िशिंग रडार और घोस्ट रिकॉन' },
  scanPlaceholder: { en: 'Enter URL to scan…', hi: 'स्कैन के लिए URL दर्ज करें…' },
  scanBtn: { en: 'Scan', hi: 'स्कैन' },
  liveAlerts: { en: 'Live alert feed', hi: 'लाइव अलर्ट फ़ीड' },
  topRisk: { en: 'Top risk applicants / URLs', hi: 'शीर्ष जोखिम आवेदक / URL' },
  regulatoryFeed: { en: 'Regulatory Live Feed', hi: 'नियामक लाइव फ़ीड' },
  documentCheck: { en: 'Document Check', hi: 'दस्तावेज़ जाँच' },
  maskBtn: { en: 'Mask & Audit', hi: 'मास्क और ऑडिट' },
  rawInput: { en: 'Paste sensitive text…', hi: 'संवेदनशील पाठ चिपकाएँ…' },
  maskedOutput: { en: 'Redacted output', hi: 'संशोधित आउटपुट' },
  auditId: { en: 'Compliance audit ID', hi: 'अनुपालन ऑडिट आईडी' },
  noAlerts: { en: 'No active threats', hi: 'कोई सक्रिय खतरा नहीं' },
  noRisks: { en: 'No high-risk entries yet', hi: 'अभी कोई उच्च जोखिम प्रविष्टि नहीं' },
  logout: { en: 'Sign out', hi: 'साइन आउट' },
  langToggle: { en: 'हिंदी', hi: 'English' },
  monitoring: { en: 'Monitoring active', hi: 'निगरानी सक्रिय' },
  ghostFeed: { en: 'Ghost recon terminal', hi: 'घोस्ट रिकॉन टर्मिनल' },
  waitingScan: { en: 'Run a URL scan to populate recon data', hi: 'रिकॉन डेटा के लिए URL स्कैन चलाएँ' },
  recentDocChecks: { en: 'Recent document checks', hi: 'हाल की दस्तावेज़ जाँच' },
  docUploadBtn: { en: 'Upload', hi: 'अपलोड' },
  noRecentDocs: { en: 'No scans yet — upload a document', hi: 'अभी कोई स्कैन नहीं — दस्तावेज़ अपलोड करें' },
  docUploadTitle: { en: 'Upload document for forensic scan', hi: 'फोरेंसिक स्कैन के लिए दस्तावेज़ अपलोड करें' },
  docDropTitle: { en: 'Drop PDF or image here', hi: 'PDF या छवि यहाँ छोड़ें' },
  docDropSub: { en: 'PDF recommended · JPG, PNG, WebP supported', hi: 'PDF अनुशंसित · JPG, PNG, WebP समर्थित' },
  docAnalyzing: { en: 'Analyzing document hashes…', hi: 'दस्तावेज़ हैश का विश्लेषण…' },
  docScanning: { en: 'Scanning…', hi: 'स्कैन हो रहा है…' },
  ghostScanning: { en: 'Ghost recon in progress…', hi: 'घोस्ट रिकॉन प्रगति पर…' },
  docScanBtn: { en: 'Run forensic scan', hi: 'फोरेंसिक स्कैन चलाएँ' },
  docCancel: { en: 'Cancel', hi: 'रद्द करें' },
  docInvalidType: { en: 'Only PDF and image files allowed', hi: 'केवल PDF और छवि फ़ाइलें' },
  docTooLarge: { en: 'File must be under 15 MB', hi: 'फ़ाइल 15 MB से कम होनी चाहिए' },
  statDocTampering: { en: 'Doc tampering alerts', hi: 'दस्तावेज़ छेड़छाड़ अलर्ट' },
  statLiveAlerts: { en: 'Live alerts', hi: 'लाइव अलर्ट' },
  statMonitoring: { en: 'System status', hi: 'सिस्टम स्थिति' },
  statActive: { en: 'Active', hi: 'सक्रिय' },
};

export function useBilingual() {
  const { lang, toggleLang } = useApp();
  const t = useCallback((key) => COPY[key]?.[lang] ?? key, [lang]);
  return { lang, toggleLang, t };
}
