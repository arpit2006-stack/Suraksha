import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Activity, AlertTriangle, Lock } from 'lucide-react';

export default function SentinelDashboard() {
  // Mock risk score for the UI demo (we'll connect this to Python later)
  const [riskScore, setRiskScore] = useState(12);

  // Simulate incoming behavioral data tweaking the score
  useEffect(() => {
    const interval = setInterval(() => {
      setRiskScore(prev => {
        const fluctuate = Math.floor(Math.random() * 5) - 2;
        return Math.max(0, Math.min(100, prev + fluctuate));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const isHighRisk = riskScore > 75;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 font-sans">
      
      {/* Top Navigation Bar */}
      <nav className="flex items-center justify-between pb-6 border-b border-slate-800 mb-8">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-emerald-500" />
          <h1 className="text-2xl font-bold tracking-wider text-white">SuRaksha <span className="text-emerald-500">Sentinel</span></h1>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
          <span>Status: <span className="text-emerald-400">Monitoring Active</span></span>
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
            AS
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Feature: Live Risk Pulse (BBA) */}
        <div className="lg:col-span-1 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-xl">
          <h2 className="text-slate-400 font-medium mb-6 uppercase tracking-widest text-sm">Real-Time Risk Level</h2>
          
          <motion.div 
            animate={{ 
              scale: isHighRisk ? [1, 1.1, 1] : 1,
              borderColor: isHighRisk ? '#ef4444' : '#10b981',
              boxShadow: isHighRisk ? '0 0 40px rgba(239, 68, 68, 0.4)' : '0 0 20px rgba(16, 185, 129, 0.1)'
            }}
            transition={{ repeat: Infinity, duration: isHighRisk ? 0.8 : 2 }}
            className={`w-48 h-48 rounded-full border-4 flex flex-col items-center justify-center relative ${isHighRisk ? 'text-red-500' : 'text-emerald-500'}`}
          >
            <span className="text-6xl font-black">{riskScore}</span>
            <span className="text-sm font-bold opacity-80 mt-1">SCORE</span>
          </motion.div>

          <p className={`mt-6 font-medium ${isHighRisk ? 'text-red-400' : 'text-slate-300'}`}>
            {isHighRisk ? 'Anomalous Behavior Detected. Locking Session...' : 'Behavior aligns with historical baseline.'}
          </p>
        </div>

        {/* Telemetry Feed & Actions */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Warning Banner (Conditionally Renders if Risk is High) */}
          {isHighRisk && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-950/50 border border-red-500/50 text-red-200 p-4 rounded-xl flex items-start gap-4"
            >
              <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-red-400">Adaptive Session Termination Triggered</h3>
                <p className="text-sm opacity-80 mt-1">Typing cadence and touch pressure deviate significantly from user profile. Session has been frozen pending Step-Up Authentication.</p>
                <button className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                  <Lock className="w-4 h-4" /> Force Biometric Re-Auth
                </button>
              </div>
            </motion.div>
          )}

          {/* Incoming Data Stream */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex-1">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
              <Activity className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-semibold text-slate-200">Live Telemetry Stream</h2>
            </div>
            
            <div className="space-y-4">
              {/* Mock Data Rows */}
              {[
                { metric: 'Keystroke Flight Time', value: '124ms', status: 'Normal' },
                { metric: 'Swipe Velocity (X-Axis)', value: '8.4 px/ms', status: 'Normal' },
                { metric: 'Device Gyro Tilt', value: '42°', status: 'Warning' },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-slate-950/50 border border-slate-800/50">
                  <span className="text-sm text-slate-400 font-mono">{item.metric}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-slate-200">{item.value}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${item.status === 'Normal' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}