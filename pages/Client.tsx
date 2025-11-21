
import React, { useState } from 'react';
import { VendorProfile, Booking, Package, Quotation, SavedSearch, Guest, User } from '../types';
import { MOCK_VENDORS, MOCK_BOOKINGS, MOCK_QUOTATIONS, MOCK_USERS, MOCK_GUESTS, addBooking, toggleFavorite, saveSearch, addQuotation, checkAvailability, addGuest, deleteGuest, updateGuestStatus } from '../services/mockData';
import { Card, Badge, Button, Input, Select, Modal, Tabs, LanguageSelector, VoiceInput, TimeInput, EventCalendar, NotificationBell, ProfileHeader, InfoRow } from '../components/Shared';
import { ChatWindow } from '../components/Chat';
import { Search, MapPin, Star, Calendar, MessageCircle, CheckCircle, Camera, Utensils, Home, Sparkles, Filter, Clock, ChevronRight, Heart, Bookmark, FileText, Plus, Users, CreditCard, Trash2, Timer, ArrowRight, Quote, ArrowLeft, ShieldCheck, User as UserIcon, LogOut, Settings, Edit2 } from 'lucide-react';
import { askEventAssistant, generateEventTimeline, suggestVendors } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';

interface ClientViewProps {
  user: User;
}

export const ClientView: React.FC<ClientViewProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'dashboard' | 'calendar' | 'ai-planner' | 'profile'>('home');
  const [selectedVendor, setSelectedVendor] = useState<VendorProfile | null>(null);
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* Navigation */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setActiveTab('home'); setSelectedVendor(null); }}>
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                 <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">{t('app_name')}</span>
            </div>
            <div className="hidden md:flex space-x-1 items-center bg-slate-100/50 p-1.5 rounded-full border border-slate-200/50">
              <NavButton active={activeTab === 'home'} onClick={() => { setActiveTab('home'); setSelectedVendor(null); }}>{t('explore')}</NavButton>
              <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>{t('dashboard')}</NavButton>
              <NavButton active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')}>{t('calendar')}</NavButton>
              <button 
                onClick={() => setActiveTab('ai-planner')}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center ${activeTab === 'ai-planner' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-600 hover:text-slate-900 hover:bg-white'}`}
              >
                <Sparkles className="w-4 h-4 mr-2" /> {t('ai_planner')}
              </button>
               <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>{t('profile')}</NavButton>
            </div>
            <div className="flex items-center gap-4">
               <NotificationBell userId={user.id} />
               <LanguageSelector />
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'home' && !selectedVendor && (
          <ServiceSearch onSelectVendor={setSelectedVendor} userId={user.id} />
        )}

        {activeTab === 'home' && selectedVendor && (
          <VendorDetails vendor={selectedVendor} user={user} onBack={() => setSelectedVendor(null)} />
        )}

        {activeTab === 'dashboard' && (
          <ClientDashboard userId={user.id} />
        )}

        {activeTab === 'calendar' && (
          <ServiceAvailabilityCalendar onSelectVendor={(v) => { setSelectedVendor(v); setActiveTab('home'); }} />
        )}

        {activeTab === 'ai-planner' && (
          <AIPlanner />
        )}
        
        {activeTab === 'profile' && (
           <ClientProfile user={user} />
        )}
      </main>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button 
        onClick={onClick}
        className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${active ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
    >
        {children}
    </button>
);

// --- Client Profile Component ---
const ClientProfile: React.FC<{ user: User }> = ({ user }) => {
    const { t } = useLanguage();
    const [isEditing, setIsEditing] = useState(false);
    
    // Tabs inside profile
    const [activeSubTab, setActiveSubTab] = useState('info');
    
    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <ProfileHeader 
                name={user.name} 
                role={user.role} 
                verificationStatus={user.verificationStatus}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-6">
                    <Card className="p-0 overflow-hidden">
                         <div className="bg-slate-50 p-4 border-b border-slate-100 font-bold text-slate-700">{t('overview')}</div>
                         <nav className="flex flex-col">
                            {[
                                { id: 'info', label: t('about'), icon: UserIcon },
                                { id: 'history', label: 'History', icon: Clock },
                                { id: 'favorites', label: t('favorites'), icon: Heart },
                                { id: 'settings', label: 'Settings', icon: Settings }
                            ].map(item => (
                                <button 
                                    key={item.id}
                                    onClick={() => setActiveSubTab(item.id)}
                                    className={`flex items-center p-4 text-sm font-medium transition-colors ${activeSubTab === item.id ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'}`}
                                >
                                    <item.icon className="w-4 h-4 mr-3" />
                                    {item.label}
                                </button>
                            ))}
                         </nav>
                    </Card>
                </div>
                
                <div className="md:col-span-2">
                    {activeSubTab === 'info' && (
                        <Card className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-900">{t('about')}</h3>
                                <Button size="sm" variant="outline" icon={Edit2} onClick={() => setIsEditing(!isEditing)}>{t('edit_profile')}</Button>
                            </div>
                            
                            {isEditing ? (
                                <div className="space-y-4">
                                     <Input label={t('full_name')} defaultValue={user.name} />
                                     <Input label={t('phone')} defaultValue={user.phone} />
                                     <Input label={t('city')} defaultValue={user.city} />
                                     <Input label={t('bio')} defaultValue={user.bio} />
                                     <div className="flex gap-2 justify-end mt-4">
                                         <Button variant="ghost" onClick={() => setIsEditing(false)}>{t('cancel')}</Button>
                                         <Button onClick={() => setIsEditing(false)}>{t('save')}</Button>
                                     </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <InfoRow label={t('full_name')} value={user.name} />
                                    <InfoRow label={t('email')} value={user.email} />
                                    <InfoRow label={t('phone')} value={user.phone || '-'} />
                                    <InfoRow label={t('city')} value={user.city || 'Not set'} />
                                    <InfoRow label={t('languages_known')} value={user.languagesKnown?.join(', ') || 'English'} />
                                    <div className="pt-4 mt-2 border-t border-slate-100">
                                        <span className="block text-sm text-slate-500 font-medium mb-2">{t('bio')}</span>
                                        <p className="text-slate-800 text-sm leading-relaxed">{user.bio}</p>
                                    </div>
                                </div>
                            )}
                        </Card>
                    )}

                    {activeSubTab === 'history' && (
                         <Card className="p-6">
                             <h3 className="text-xl font-bold text-slate-900 mb-4">Event History</h3>
                             <div className="space-y-4">
                                {MOCK_BOOKINGS.filter(b => b.clientId === user.id).map(b => (
                                    <div key={b.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-slate-800">{b.eventType}</h4>
                                                <p className="text-xs text-slate-500">{b.date}</p>
                                            </div>
                                            <Badge color="gray">{b.status}</Badge>
                                        </div>
                                    </div>
                                ))}
                             </div>
                         </Card>
                    )}

                    {activeSubTab === 'favorites' && (
                        <div className="space-y-4">
                             {MOCK_VENDORS.filter(v => user.favorites?.includes(v.id)).map(v => (
                                 <Card key={v.id} className="p-4 flex gap-4 items-center">
                                     <img src={v.images[0]} className="w-16 h-16 rounded-lg object-cover" />
                                     <div>
                                         <h4 className="font-bold">{v.name}</h4>
                                         <p className="text-xs text-slate-500">{v.location}</p>
                                     </div>
                                     <Button size="sm" variant="outline" className="ml-auto">View</Button>
                                 </Card>
                             ))}
                             {(!user.favorites || user.favorites.length === 0) && (
                                 <div className="text-center p-8 text-slate-400">No favorites yet.</div>
                             )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper
const getEnglishSearchTerm = (term: string): string => {
    const lower = term.toLowerCase().trim();
    // Simple mapping for demo purposes
    if (lower.includes('சென்னை')) return 'Chennai';
    if (lower.includes('திருமணம்')) return 'Wedding';
    return lower;
}

// --- Sub-Components ---

const ServiceAvailabilityCalendar: React.FC<{ onSelectVendor: (v: VendorProfile) => void }> = ({ onSelectVendor }) => {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const { t } = useLanguage();

    const availableVendors = selectedDate 
        ? MOCK_VENDORS.filter(v => !v.blockedDates.includes(selectedDate) && v.verified)
        : [];

    return (
        <div className="space-y-8 animate-fade-in">
             <div className="bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                 <h2 className="text-3xl font-bold relative z-10">{t('check_availability')}</h2>
                 <p className="text-indigo-200 relative z-10 mt-2">Find the perfect vendor for your special date.</p>
             </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                     <EventCalendar 
                        events={[]} 
                        onDateSelect={setSelectedDate} 
                     />
                </div>
                <div className="lg:col-span-1">
                    <div className="bg-white h-full rounded-2xl border border-slate-200 shadow-lg p-6 flex flex-col">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                            {selectedDate ? `${t('available_vendors_on')} ${selectedDate}` : 'Select a Date'}
                        </h3>
                        
                        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                             {!selectedDate && (
                                <div className="flex flex-col items-center justify-center h-64 text-slate-300">
                                    <Clock className="w-12 h-12 mb-3" />
                                    <p>Pick a date from the calendar to see results.</p>
                                </div>
                            )}
                            {selectedDate && availableVendors.length === 0 && (
                                <div className="text-center py-10 text-slate-400">
                                    No vendors available on this date.
                                </div>
                            )}
                            {availableVendors.map(v => (
                                <div key={v.id} onClick={() => onSelectVendor(v)} className="group bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer flex items-center gap-4">
                                    <img src={v.images[0]} className="w-16 h-16 rounded-lg object-cover" alt={v.name} />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{v.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge color="blue" className="text-[10px] px-1.5 py-0">{t(v.role)}</Badge>
                                            <span className="text-xs font-bold text-slate-600">₹{v.startingPrice}</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ServiceSearch: React.FC<{ onSelectVendor: (v: VendorProfile) => void; userId: string }> = ({ onSelectVendor, userId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const { t } = useLanguage();

  const filteredVendors = MOCK_VENDORS.filter(v => {
    const englishTerm = getEnglishSearchTerm(searchTerm);
    const matchesSearch = 
        v.name.toLowerCase().includes(englishTerm) || 
        v.location.toLowerCase().includes(englishTerm) ||
        v.tags.some(tag => tag.toLowerCase().includes(englishTerm));
    const matchesCategory = category === 'all' || v.role === category;
    const matchesPrice = priceFilter === 'all' || v.priceRange === priceFilter;
    return matchesSearch && matchesCategory && matchesPrice && v.verified;
  });

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Hero Section */}
      <div className="relative bg-indigo-900 rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[400px] flex flex-col justify-center items-center text-center px-4">
         {/* Abstract Background */}
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-50 animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-50 animate-pulse" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-[30%] left-[30%] w-[300px] h-[300px] bg-pink-500 rounded-full mix-blend-multiply filter blur-[80px] opacity-30"></div>
         </div>

         <div className="relative z-10 max-w-4xl mx-auto space-y-6">
            <Badge color="white" className="mb-4">South India's #1 Event Platform</Badge>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight">
                Create Memories <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-pink-200">That Last Forever</span>
            </h1>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
             {t('search_placeholder')}
            </p>
         </div>

         {/* Search Box */}
         <div className="relative z-20 mt-12 w-full max-w-5xl">
             <div className="bg-white/95 backdrop-blur-xl p-4 rounded-3xl shadow-xl border border-white/20 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 w-full">
                    <Input 
                        className="bg-transparent border-0 focus:ring-0 text-lg py-3 mb-0" 
                        placeholder="Search for photographers, venues..." 
                        icon={Search}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onVoiceInput={setSearchTerm}
                    />
                </div>
                <div className="w-px h-10 bg-slate-200 hidden md:block"></div>
                <div className="w-full md:w-48">
                    <Select 
                        className="bg-transparent border-0 focus:ring-0 mb-0 font-medium text-slate-600"
                        options={[
                            { value: 'all', label: t('all_categories') },
                            { value: 'photographer', label: t('photographer') },
                            { value: 'caterer', label: t('caterer') },
                            { value: 'venue', label: t('venue') },
                            { value: 'makeup', label: t('makeup') }
                        ]}
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-auto">
                    <Button size="lg" className="w-full md:w-auto rounded-2xl px-8 py-4 shadow-indigo-500/40" onClick={() => {}}>
                        {t('explore')}
                    </Button>
                </div>
             </div>
         </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap justify-center gap-3">
        {[
            { id: 'all', label: t('all_categories'), icon: Filter },
            { id: 'photographer', icon: Camera, label: t('photographer') },
            { id: 'caterer', icon: Utensils, label: t('caterer') },
            { id: 'venue', icon: Home, label: t('venue') },
            { id: 'makeup', icon: Sparkles, label: t('makeup') }
        ].map(cat => (
            <button 
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex items-center px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ${category === cat.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 transform scale-105' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-indigo-200'}`}
            >
                {cat.icon && <cat.icon className="w-4 h-4 mr-2" />}
                {cat.label}
            </button>
        ))}
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
        {filteredVendors.map(vendor => (
          <Card key={vendor.id} className="group flex flex-col h-full border-0 bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500">
             <div className="relative h-72 overflow-hidden rounded-t-2xl cursor-pointer" onClick={() => onSelectVendor(vendor)}>
                <img src={vendor.images[0]} alt={vendor.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute top-4 right-4 flex gap-2">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm text-slate-800">
                        {t(vendor.role)}
                    </div>
                </div>
                <div className="absolute bottom-4 left-4">
                     <div className="bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-lg flex items-center text-sm font-bold border border-white/10">
                        <Star className="w-3.5 h-3.5 text-yellow-400 mr-1 fill-yellow-400" />
                        {vendor.rating} <span className="text-white/60 text-xs ml-1 font-normal">({vendor.reviewCount})</span>
                     </div>
                </div>
             </div>
             <div className="p-6 flex flex-col flex-grow" onClick={() => onSelectVendor(vendor)}>
                <div className="flex justify-between items-start mb-2">
                     <h3 className="text-xl font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{vendor.name}</h3>
                     <span className="text-sm font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{vendor.priceRange}</span>
                </div>
                <p className="text-slate-500 text-sm flex items-center mb-4">
                    <MapPin className="w-4 h-4 mr-1.5 text-slate-400" /> {vendor.location}
                </p>
                
                <p className="text-slate-600 text-sm line-clamp-2 mb-6 leading-relaxed">{vendor.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                    {vendor.tags.slice(0, 3).map(tag => <span key={tag} className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md uppercase tracking-wide">{tag}</span>)}
                </div>

                <div className="mt-auto pt-5 border-t border-slate-100 flex justify-between items-center">
                    <div>
                        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{t('starting_at')}</span>
                        <div className="text-xl font-bold text-slate-900">₹{vendor.startingPrice.toLocaleString()}</div>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const PaymentModal: React.FC<{ isOpen: boolean; onClose: () => void; amount: number; onConfirm: () => void }> = ({ isOpen, onClose, amount, onConfirm }) => {
    const { t } = useLanguage();
    const [method, setMethod] = useState('upi');
    const [processing, setProcessing] = useState(false);

    const handlePay = () => {
        setProcessing(true);
        setTimeout(() => {
            setProcessing(false);
            onConfirm();
        }, 2000);
    }

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('payment')}>
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-2xl text-center text-white shadow-lg">
                    <p className="text-indigo-100 text-sm font-medium uppercase tracking-wide mb-1">Total Payable</p>
                    <p className="text-4xl font-bold">₹{amount.toLocaleString()}</p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">{t('payment_method')}</label>
                    <div className="space-y-3">
                        {[
                            { id: 'upi', icon: Sparkles, label: 'UPI (GPay, PhonePe)' },
                            { id: 'card', icon: CreditCard, label: 'Credit / Debit Card' },
                            { id: 'net_banking', icon: Home, label: 'Net Banking' }
                        ].map(m => (
                            <div 
                                key={m.id} 
                                className={`p-4 border rounded-xl cursor-pointer flex items-center transition-all ${method === m.id ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600 shadow-sm' : 'border-slate-200 hover:bg-slate-50'}`}
                                onClick={() => setMethod(m.id)}
                            >
                                <m.icon className={`w-5 h-5 mr-4 ${method === m.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                                <span className={`font-semibold ${method === m.id ? 'text-indigo-900' : 'text-slate-700'}`}>{m.label}</span>
                                <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === m.id ? 'border-indigo-600' : 'border-slate-300'}`}>
                                    {method === m.id && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <Button className="w-full h-14 text-lg shadow-lg shadow-green-500/30 bg-gradient-to-r from-green-600 to-emerald-600 border-0" onClick={handlePay} disabled={processing}>
                    {processing ? (
                        <div className="flex items-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Processing...
                        </div>
                    ) : (
                        `${t('pay_now')}`
                    )}
                </Button>
            </div>
        </Modal>
    );
}

const VendorDetails: React.FC<{ vendor: VendorProfile; user: any; onBack: () => void }> = ({ vendor, user, onBack }) => {
    const [isBooking, setIsBooking] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isQuoteModal, setIsQuoteModal] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('10:00');
    const [selectedPackage, setSelectedPackage] = useState<string>('');
    const [bookingNote, setBookingNote] = useState('');
    const [quoteDetails, setQuoteDetails] = useState('');
    const [isFav, setIsFav] = useState(MOCK_USERS.find(u => u.id === user.id)?.favorites?.includes(vendor.id) || false);
    
    const { t } = useLanguage();
    const { addToast } = useNotification();

    const getBookingAmount = () => {
        const pkg = vendor.packages.find(p => p.id === selectedPackage);
        return pkg ? pkg.price : vendor.startingPrice;
    }
    
    const handleBookingStart = () => {
        if (!checkAvailability(vendor.id, bookingDate, bookingTime)) {
            addToast(t('conflict_alert'), t('conflict_msg'), 'error');
            return;
        }
        setIsBooking(false);
        setIsPaymentOpen(true);
    };

    const handlePaymentSuccess = () => {
        const pkg = vendor.packages.find(p => p.id === selectedPackage);
        addBooking({
            clientId: user.id,
            vendorId: vendor.id,
            vendorName: vendor.name,
            vendorRole: vendor.role,
            clientName: user.name,
            date: bookingDate,
            time: bookingTime,
            amount: getBookingAmount(),
            eventType: 'General Event', 
            packageId: pkg?.id,
            packageName: pkg?.name,
            notes: bookingNote
        });
        addToast('Booking Sent!', 'Vendor has been notified of your request.', 'success');
        setIsPaymentOpen(false);
        onBack();
    };

    const toggleFav = () => {
        toggleFavorite(user.id, vendor.id);
        setIsFav(!isFav);
        if (!isFav) addToast('Saved', 'Vendor added to favorites', 'success');
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Controls */}
            <div className="flex justify-between items-center">
                 <button onClick={onBack} className="flex items-center text-slate-500 hover:text-indigo-600 font-medium transition-colors">
                     <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center mr-2 border border-slate-200">
                        <ArrowLeft className="w-4 h-4" />
                     </div>
                     {t('back')}
                 </button>
                 <Button 
                    variant={isFav ? 'danger' : 'outline'} 
                    icon={Heart} 
                    onClick={toggleFav}
                    className={isFav ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white'}
                 >
                     {isFav ? t('favorites') : 'Add to Favorites'}
                 </Button>
            </div>
            
            {/* Main Banner */}
            <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100">
                <div className="h-96 relative">
                    <img src={vendor.images[0]} className="w-full h-full object-cover" alt="Cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                            <div>
                                <Badge color="white" className="mb-3 font-bold tracking-widest opacity-90">{t(vendor.role).toUpperCase()}</Badge>
                                <h1 className="text-4xl md:text-6xl font-bold text-white mb-3 tracking-tight">{vendor.name}</h1>
                                <p className="text-slate-200 flex items-center text-lg font-medium">
                                    <MapPin className="w-5 h-5 mr-2 text-indigo-400" /> {vendor.location}
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20 min-w-[100px]">
                                    <div className="text-3xl font-bold text-yellow-400 flex justify-center items-center">
                                        {vendor.rating} <Star className="w-5 h-5 ml-1 fill-yellow-400" />
                                    </div>
                                    <div className="text-xs text-white/80 font-medium uppercase tracking-wide mt-1">{t('rating')}</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20 min-w-[100px]">
                                    <div className="text-3xl font-bold text-white">{vendor.reviewCount}</div>
                                    <div className="text-xs text-white/80 font-medium uppercase tracking-wide mt-1">{t('reviews')}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                                <Quote className="w-6 h-6 mr-3 text-indigo-600" /> {t('about')}
                            </h2>
                            <p className="text-slate-600 leading-relaxed text-lg">{vendor.description}</p>
                            
                            {vendor.amenities && vendor.amenities.length > 0 && (
                                <div className="mt-8">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Amenities</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {vendor.amenities.map(a => <Badge key={a} color="green" className="px-4 py-2 text-sm">{a}</Badge>)}
                                    </div>
                                </div>
                            )}
                        </section>

                        {vendor.packages.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('packages_pricing')}</h2>
                                <div className="grid grid-cols-1 gap-6">
                                    {vendor.packages.map(pkg => (
                                        <div 
                                            key={pkg.id} 
                                            className={`relative rounded-2xl p-8 border-2 transition-all cursor-pointer group ${selectedPackage === pkg.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-indigo-200 hover:bg-white'}`} 
                                            onClick={() => { setSelectedPackage(pkg.id); setIsBooking(true); }}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-900">{pkg.name}</h3>
                                                    <p className="text-slate-500 text-sm mt-1">{pkg.description}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-indigo-600">₹{pkg.price}</div>
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">{pkg.unit}</div>
                                                </div>
                                            </div>
                                            <div className="h-px bg-slate-200 my-4"></div>
                                            <ul className="grid grid-cols-2 gap-3">
                                                {pkg.features.map((f, i) => (
                                                    <li key={i} className="text-sm text-slate-600 flex items-center">
                                                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" /> {f}
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button className="w-full" variant="secondary">Select Package</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('portfolio')}</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {vendor.images.map((img, idx) => (
                                    <div key={idx} className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer">
                                        <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Gallery" />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-indigo-100 border border-slate-100 sticky top-28">
                            <div className="text-center mb-8">
                                <span className="text-sm text-slate-400 font-bold uppercase tracking-wide block mb-1">{t('starting_at')}</span>
                                <span className="text-4xl font-bold text-slate-900">₹{vendor.startingPrice.toLocaleString()}</span>
                            </div>
                            
                            <div className="space-y-4">
                                <Button className="w-full h-14 text-lg shadow-lg shadow-indigo-500/30" onClick={() => setIsBooking(true)}>
                                    {t('book_now')}
                                </Button>
                                <Button variant="outline" className="w-full h-12" onClick={() => setIsQuoteModal(true)}>
                                    {t('request_quote')}
                                </Button>
                                <Button variant="secondary" className="w-full h-12 bg-slate-100 text-slate-700" icon={MessageCircle} onClick={() => setIsChatOpen(true)}>
                                    {t('chat')}
                                </Button>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                                <p className="text-xs text-slate-400 flex justify-center items-center">
                                    <ShieldCheck className="w-3 h-3 mr-1" /> Verified Vendor • Secure Payment
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Window */}
            {isChatOpen && (
                <ChatWindow 
                    currentUser={user}
                    targetUser={{ id: vendor.id, name: vendor.name, language: 'en' }} 
                    onClose={() => setIsChatOpen(false)}
                />
            )}

            {/* Booking Modal */}
            <Modal isOpen={isBooking} onClose={() => setIsBooking(false)} title={`${t('book_now')}`}>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Selected Package</label>
                        <select 
                            className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={selectedPackage}
                            onChange={(e) => setSelectedPackage(e.target.value)}
                        >
                            <option value="">Custom / Base Price (₹{vendor.startingPrice})</option>
                            {vendor.packages.map(p => (
                                <option key={p.id} value={p.id}>{p.name} - ₹{p.price}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            type="date" 
                            label={t('event_date')} 
                            value={bookingDate} 
                            onChange={e => {
                                if(vendor.blockedDates.includes(e.target.value)) {
                                    addToast(t('conflict_alert'), t('conflict_msg'), 'error');
                                    setBookingDate('');
                                } else {
                                    setBookingDate(e.target.value);
                                }
                            }} 
                        />
                        <TimeInput
                            label="Time"
                            value={bookingTime}
                            onChange={e => setBookingTime(e.target.value)}
                        />
                    </div>
                    
                    <Input 
                        type="text" 
                        label={t('notes_for_vendor')} 
                        placeholder={t('notes_placeholder')}
                        value={bookingNote}
                        onChange={e => setBookingNote(e.target.value)}
                        onVoiceInput={setBookingNote}
                    />

                    <Button onClick={handleBookingStart} disabled={!bookingDate} className="w-full h-12">{t('confirm_payment')}</Button>
                </div>
            </Modal>

            <PaymentModal 
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                amount={getBookingAmount()}
                onConfirm={handlePaymentSuccess}
            />

             {/* Quote Modal */}
             <Modal isOpen={isQuoteModal} onClose={() => setIsQuoteModal(false)} title={t('request_quote')}>
                <div className="space-y-4">
                    <Input label={t('quote_details')} value={quoteDetails} onChange={e => setQuoteDetails(e.target.value)} placeholder="Describe your requirements..." />
                    <Button onClick={() => { addQuotation({ clientId: user.id, vendorId: vendor.id, vendorName: vendor.name, details: quoteDetails }); setIsQuoteModal(false); addToast('Quote Sent', t('quote_sent'), 'success'); }} className="w-full">{t('send_request')}</Button>
                </div>
             </Modal>
        </div>
    );
};

const ClientDashboard: React.FC<{ userId: string }> = ({ userId }) => {
    const [tab, setTab] = useState('bookings');
    const myBookings = MOCK_BOOKINGS.filter(b => b.clientId === userId).sort((a, b) => b.createdAt - a.createdAt);
    const myQuotes = MOCK_QUOTATIONS.filter(q => q.clientId === userId);
    const user = MOCK_USERS.find(u => u.id === userId);
    const myFavorites = MOCK_VENDORS.filter(v => user?.favorites?.includes(v.id));
    const nextEvent = myBookings.find(b => b.status === 'confirmed' && new Date(b.date) > new Date());
    const { t } = useLanguage();

    return (
        <div className="space-y-8 animate-fade-in">
             {/* Header */}
             <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('welcome')}, {user?.name}</h1>
                <p className="text-slate-500">Manage your events, bookings and plans.</p>
             </div>

             {/* Countdown Widget */}
             {nextEvent ? (
                 <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <Badge color="white" className="mb-3 bg-white/20 border-0 text-white">UPCOMING EVENT</Badge>
                            <h3 className="text-3xl font-bold mb-1">{nextEvent.eventType}</h3>
                            <p className="text-indigo-100 text-lg flex items-center">
                                <Calendar className="w-5 h-5 mr-2" /> {nextEvent.date} 
                                <span className="mx-3 opacity-50">|</span>
                                <Clock className="w-5 h-5 mr-2" /> {nextEvent.time}
                            </p>
                        </div>
                        <div className="flex gap-4">
                             <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 min-w-[100px] text-center border border-white/20">
                                <div className="text-4xl font-bold">{Math.ceil((new Date(nextEvent.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}</div>
                                <div className="text-xs font-bold uppercase tracking-wider opacity-70">Days To Go</div>
                             </div>
                        </div>
                    </div>
                 </div>
             ) : (
                 <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
                     <p className="text-slate-500">No upcoming events. Start planning now!</p>
                 </div>
             )}

             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                    <Tabs 
                        tabs={[
                            { id: 'bookings', label: t('bookings'), icon: Calendar },
                            { id: 'quotes', label: t('quotations'), icon: FileText },
                            { id: 'favorites', label: t('favorites'), icon: Heart },
                            { id: 'guests', label: t('guest_list'), icon: Users },
                        ]} 
                        activeTab={tab} 
                        onChange={setTab} 
                    />
                </div>
                
                <div className="p-6 min-h-[400px]">
                    {tab === 'bookings' && (
                        <div className="space-y-4">
                            {myBookings.map(booking => (
                                <div key={booking.id} className="flex flex-col md:flex-row items-center justify-between p-5 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors group">
                                    <div className="flex items-center gap-5 w-full md:w-auto">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${booking.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                            {booking.status === 'confirmed' ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-lg">{booking.vendorName}</h4>
                                            <div className="text-sm text-slate-500 mt-0.5 flex items-center gap-3">
                                                <span>{booking.date}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                <span className="font-medium text-indigo-600">₹{booking.amount}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 md:mt-0 ml-auto">
                                        <Badge color={booking.status === 'confirmed' ? 'green' : 'yellow'}>{t(`status_${booking.status}`)}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === 'favorites' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {myFavorites.map(v => (
                                <div key={v.id} className="flex gap-4 p-4 border rounded-2xl hover:shadow-md cursor-pointer transition-all bg-white">
                                    <img src={v.images[0]} className="w-24 h-24 rounded-xl object-cover" />
                                    <div>
                                        <h4 className="font-bold text-slate-900">{v.name}</h4>
                                        <p className="text-sm text-slate-500 mb-2">{v.location}</p>
                                        <Badge color="blue">{t(v.role)}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {tab === 'guests' && <GuestManager clientId={userId} />}
                </div>
             </div>
        </div>
    );
};

const GuestManager: React.FC<{ clientId: string }> = ({ clientId }) => {
    const { t } = useLanguage();
    const { addToast } = useNotification();
    const [newGuest, setNewGuest] = useState('');
    const [count, setCount] = useState(1);
    const [refresh, setRefresh] = useState(0);

    const myGuests = MOCK_GUESTS.filter(g => g.clientId === clientId);

    const handleAdd = () => {
        if(!newGuest) return;
        addGuest(clientId, newGuest, count);
        addToast('Guest Added', `${newGuest} added to the list.`, 'success');
        setNewGuest('');
        setCount(1);
        setRefresh(p => p + 1);
    }

    return (
        <div className="space-y-6">
            <div className="bg-indigo-50 p-6 rounded-2xl flex flex-col md:flex-row gap-4 items-end">
                <Input className="flex-1 mb-0 bg-white" label={t('guest_name')} value={newGuest} onChange={e => setNewGuest(e.target.value)} placeholder="Enter name" />
                <div className="w-32">
                     <Input className="mb-0 bg-white" label={t('plus_ones')} type="number" min="1" value={count} onChange={e => setCount(parseInt(e.target.value))} />
                </div>
                <Button onClick={handleAdd} icon={Plus} className="h-[46px]">{t('add_guest')}</Button>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {myGuests.map(g => (
                    <div key={g.id} className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                {g.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">{g.name}</h4>
                                <p className="text-xs text-slate-500 font-medium">Total Party: {g.count}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <select 
                                className="text-xs font-bold bg-slate-50 border-0 rounded-lg py-2 px-3 focus:ring-0 text-slate-600"
                                value={g.status}
                                onChange={e => { updateGuestStatus(g.id, e.target.value as any); setRefresh(p => p + 1); }}
                            >
                                <option value="invited">Invited</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="declined">Declined</option>
                            </select>
                            <button onClick={() => { deleteGuest(g.id); setRefresh(p => p + 1); }} className="text-slate-400 hover:text-red-500 p-2 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const AIPlanner: React.FC = () => {
    const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([{role: 'ai', text: 'Hello! I am your Event Genius. Ask me to plan a timeline, suggest vendors for a budget, or give party ideas.'}]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const { t } = useLanguage();

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setMessages(prev => [...prev, {role: 'user', text: userMsg}]);
        setInput('');
        setLoading(true);

        let responseText = '';
        const lowerInput = userMsg.toLowerCase();

        if (lowerInput.includes('timeline') || lowerInput.includes('schedule')) {
            responseText = await generateEventTimeline('Wedding', '10:00 AM', 8);
        } else if (lowerInput.includes('budget') || lowerInput.includes('cost') || lowerInput.includes('suggest')) {
            responseText = await suggestVendors(5000, 'Wedding', 'New York');
        } else {
            responseText = await askEventAssistant(userMsg);
        }

        setMessages(prev => [...prev, {role: 'ai', text: responseText}]);
        setLoading(false);
    };

    return (
        <div className="h-[700px] bg-white rounded-3xl shadow-2xl shadow-slate-200/50 flex flex-col overflow-hidden border border-slate-100 animate-scale-in">
            <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-tight">{t('ai_planner')}</h3>
                        <p className="text-xs text-indigo-100 opacity-80">Your personal event assistant</p>
                    </div>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-5 shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}>
                            <div className="whitespace-pre-wrap text-sm leading-relaxed font-medium">{msg.text}</div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-4 shadow-sm flex space-x-2">
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="p-4 bg-white border-t border-slate-100">
                <div className="flex gap-3 relative items-center bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                    <input 
                        className="flex-1 bg-transparent border-0 focus:ring-0 px-4 py-2 outline-none text-slate-700"
                        placeholder={t('chat_placeholder')}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                    <div className="flex items-center gap-2 pr-2">
                         <VoiceInput onResult={setInput} />
                         <Button onClick={handleSend} disabled={loading} size="sm" className="rounded-xl h-10 w-10 p-0 flex items-center justify-center shadow-md">
                             <ArrowRight className="w-4 h-4" />
                         </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
