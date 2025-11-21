
import React, { useState, useEffect } from 'react';
import { ClientView } from './pages/Client';
import { VendorDashboard } from './pages/Vendor';
import { AdminDashboard } from './pages/Admin';
import { AuthPage, KYCStatusPage } from './pages/Auth';
import { User, Language } from './types';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ToastContainer } from './components/Shared';
import { Sparkles, LogOut } from 'lucide-react';

const GlobalStyles = () => (
  <style>{`
    .recharts-wrapper { font-family: inherit; }
  `}</style>
);

const AppContent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLanguageSelected, setIsLanguageSelected] = useState(false);
  const { setLanguage, t } = useLanguage();

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1200);
  }, []);

  const handleLanguageSelect = (lang: Language) => {
      setLanguage(lang);
      setIsLanguageSelected(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-2xl shadow-indigo-500/50 animate-bounce">
             <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-white">EventHorizon</h1>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" style={{animationDelay: '0s'}}></div>
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isLanguageSelected) {
      const languages: { id: Language; label: string; localName: string; flag: string }[] = [
        { id: 'en', label: 'English', localName: 'English', flag: '🇬🇧' },
        { id: 'ta', label: 'Tamil', localName: 'தமிழ்', flag: '🇮🇳' },
        { id: 'te', label: 'Telugu', localName: 'తెలుగు', flag: '🇮🇳' },
        { id: 'ml', label: 'Malayalam', localName: 'മലയാളം', flag: '🇮🇳' },
        { id: 'kn', label: 'Kannada', localName: 'ಕನ್ನಡ', flag: '🇮🇳' }
      ];

      return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10"></div>
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 max-w-lg w-full text-center relative z-10 animate-scale-in">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-3xl">🌏</span>
                  </div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">Choose Your Language</h1>
                  <p className="text-slate-500 mb-8 font-medium">உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்</p>
                  
                  <div className="grid grid-cols-1 gap-3">
                      {languages.map(l => (
                          <button
                            key={l.id}
                            onClick={() => handleLanguageSelect(l.id)}
                            className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50/50 hover:shadow-md transition-all group bg-white"
                          >
                              <div className="flex items-center gap-4">
                                  <span className="text-3xl shadow-sm rounded-full overflow-hidden">{l.flag}</span>
                                  <div className="text-left">
                                      <div className="font-bold text-slate-900 group-hover:text-indigo-700 text-lg">{l.localName}</div>
                                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{l.label}</div>
                                  </div>
                              </div>
                              <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-indigo-500 group-hover:bg-indigo-500 transition-all"></div>
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      );
  }

  if (!user) {
    return <AuthPage onLogin={setUser} />;
  }

  if (user.role !== 'admin' && user.verificationStatus !== 'verified') {
      return (
          <KYCStatusPage 
            user={user} 
            onLogout={() => setUser(null)} 
            onResubmit={() => setUser(null)} 
          />
      );
  }

  return (
    <NotificationProvider userId={user.id}>
      <GlobalStyles />
      <div className="relative min-h-screen bg-slate-50">
        <ToastContainer />
        
        {user.role === 'client' && <ClientView user={user} />}
        {user.role === 'admin' && <AdminDashboard />}
        {(['photographer', 'caterer', 'venue', 'makeup'].includes(user.role)) && (
          <VendorDashboard role={user.role} />
        )}

        <div className="fixed bottom-6 left-6 z-50">
             <button 
                onClick={() => setUser(null)}
                className="bg-white text-slate-700 px-4 py-2 rounded-full shadow-lg border border-slate-200 text-xs font-bold hover:bg-slate-100 hover:text-red-600 transition-all flex items-center gap-2"
            >
                <LogOut className="w-3 h-3" />
                {t('logout')}
            </button>
        </div>
      </div>
    </NotificationProvider>
  );
}

const App: React.FC = () => {
    return (
        <LanguageProvider>
            <AppContent />
        </LanguageProvider>
    );
};

export default App;
