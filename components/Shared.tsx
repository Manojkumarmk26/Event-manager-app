
import React, { useState, useEffect } from 'react';
import { LucideIcon, Mic, Globe, ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, Plus, Trash2, AlertTriangle, Edit2, X, Check, Bell, Info, CheckCircle, AlertCircle, ShieldCheck, Star } from 'lucide-react';
import { Language, CalendarEvent, UserRole, VerificationStatus } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { getLocaleForVoice } from '../services/translations';

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  icon?: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}
export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', icon: Icon, className = '', fullWidth = false, ...props }) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none";
  
  const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-5 py-2.5 text-sm",
      lg: "px-6 py-3.5 text-base"
  };

  const variants = {
    primary: "border-transparent text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40",
    secondary: "border-transparent text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:ring-indigo-500",
    outline: "border-2 border-gray-200 text-gray-700 bg-white hover:border-indigo-200 hover:bg-indigo-50/50 focus:ring-indigo-500",
    danger: "border-transparent text-white bg-red-500 hover:bg-red-600 focus:ring-red-500 shadow-lg shadow-red-500/30",
    ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`} {...props}>
      {Icon && <Icon className={`mr-2 ${size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />}
      {children}
    </button>
  );
};

// --- Card ---
export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/60 overflow-hidden transition-all duration-300 ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10' : ''} ${className}`}
  >
    {children}
  </div>
);

// --- Badge ---
export const Badge: React.FC<{ children: React.ReactNode; color?: 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'purple' | 'white'; className?: string }> = ({ children, color = 'blue', className = '' }) => {
  const colors = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/20',
    yellow: 'bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/20',
    red: 'bg-rose-50 text-rose-700 border-rose-100 ring-rose-500/20',
    blue: 'bg-blue-50 text-blue-700 border-blue-100 ring-blue-500/20',
    purple: 'bg-purple-50 text-purple-700 border-purple-100 ring-purple-500/20',
    gray: 'bg-slate-50 text-slate-700 border-slate-100 ring-slate-500/20',
    white: 'bg-white/90 text-slate-800 backdrop-blur border-white/20'
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ring-1 ring-inset ${colors[color]} ${className}`}>
      {children}
    </span>
  );
};

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  onVoiceInput?: (text: string) => void;
}
export const Input: React.FC<InputProps> = ({ label, icon: Icon, onVoiceInput, className = '', ...props }) => (
  <div className="mb-5 group">
    {label && <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">{label}</label>}
    <div className="relative flex items-center gap-2">
        <div className="relative flex-grow">
            {Icon && (
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Icon className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
            )}
            <input
            className={`block w-full text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all outline-none ${Icon ? 'pl-11' : ''} ${className}`}
            {...props}
            />
        </div>
        {onVoiceInput && <VoiceInput onResult={onVoiceInput} />}
    </div>
  </div>
);

export const TimeInput: React.FC<InputProps> = (props) => (
    <Input type="time" icon={Clock} {...props} />
);

// --- Voice Input ---
export const VoiceInput: React.FC<{ onResult: (text: string) => void }> = ({ onResult }) => {
  const [isListening, setIsListening] = useState(false);
  const { language, t } = useLanguage();

  const handleListen = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice input not supported in this browser.");
      return;
    }
    
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = getLocaleForVoice(language);
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      onResult(text);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  return (
    <button 
      onClick={handleListen}
      className={`p-3 rounded-xl transition-all shadow-sm ${isListening ? 'bg-red-50 text-red-600 animate-pulse ring-2 ring-red-200' : 'bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200'}`}
      title={isListening ? t('voice_listening') : t('voice_input_supported')}
      type="button"
    >
      <Mic className="w-5 h-5" />
    </button>
  );
};

// --- Select ---
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}
export const Select: React.FC<SelectProps> = ({ label, options, className = '', ...props }) => (
    <div className="mb-5">
      {label && <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">{label}</label>}
      <div className="relative">
        <select
            className={`appearance-none block w-full text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-3 pr-8 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all outline-none ${className}`}
            {...props}
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
            <ChevronRight className="h-4 w-4 rotate-90" />
        </div>
      </div>
    </div>
  );

// --- Modal ---
export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
             {/* Backdrop */}
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-fade-in" onClick={onClose}></div>

            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg animate-scale-in">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-xl font-bold text-slate-900" id="modal-title">{title}</h3>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors rounded-full p-1 hover:bg-slate-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="mt-2">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// --- Tabs ---
export const Tabs: React.FC<{ tabs: { id: string; label: string; icon?: LucideIcon }[]; activeTab: string; onChange: (id: string) => void }> = ({ tabs, activeTab, onChange }) => {
    return (
        <div className="border-b border-slate-200 mb-6">
            <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide" aria-label="Tabs">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onChange(tab.id)}
                            className={`
                                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all whitespace-nowrap
                                ${isActive
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }
                            `}
                        >
                            {Icon && <Icon className={`w-4 h-4 mr-2.5 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-500'}`} />}
                            {tab.label}
                        </button>
                    )
                })}
            </nav>
        </div>
    )
}

// --- Language Selector ---
export const LanguageSelector: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages: { id: Language; label: string; flag: string }[] = [
    { id: 'en', label: 'English', flag: '🇬🇧' },
    { id: 'ta', label: 'தமிழ் (Tamil)', flag: '🇮🇳' },
    { id: 'te', label: 'తెలుగు (Telugu)', flag: '🇮🇳' },
    { id: 'ml', label: 'മലയാളം (Malayalam)', flag: '🇮🇳' },
    { id: 'kn', label: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' }
  ];

  return (
    <div className="relative z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/80 backdrop-blur border border-slate-200 shadow-sm hover:bg-white text-sm font-medium text-slate-700 transition-all"
      >
        <span className="text-lg leading-none">{languages.find(l => l.id === language)?.flag}</span>
        <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wide text-slate-500">{language}</span>
      </button>

      {isOpen && (
        <>
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 py-1 overflow-hidden animate-fade-in-up">
           <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b bg-slate-50">
              {t('select_language')}
           </div>
           {languages.map(l => (
             <button
               key={l.id}
               onClick={() => { setLanguage(l.id); setIsOpen(false); }}
               className={`w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 flex items-center justify-between transition-colors ${language === l.id ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-700'}`}
             >
               <span>{l.label}</span>
               <span>{l.flag}</span>
             </button>
           ))}
        </div>
        </>
      )}
    </div>
  );
}

// --- Notification Bell ---
export const NotificationBell: React.FC<{ userId: string }> = ({ userId }) => {
    const { notifications, unreadCount, markAllRead } = useNotification();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative z-50">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full bg-white/80 backdrop-blur border border-slate-200 text-slate-600 hover:bg-white hover:text-indigo-600 transition-colors"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <>
                <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-fade-in-up origin-top-right">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={() => markAllRead(userId)} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
                                Mark all read
                            </button>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors relative ${!n.read ? 'bg-indigo-50/30' : ''}`}>
                                    {!n.read && <div className="absolute left-2 top-6 w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>}
                                    <div className="pl-3">
                                        <p className="text-sm font-bold text-slate-800 mb-0.5">{n.title}</p>
                                        <p className="text-sm text-slate-500 leading-relaxed">{n.message}</p>
                                        <p className="text-xs text-slate-400 mt-2 flex items-center">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {Math.floor((Date.now() - n.timestamp) / 60000)} mins ago
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                </>
            )}
        </div>
    );
}

// --- Toast Container ---
export const ToastContainer: React.FC = () => {
    const { toasts } = useNotification();
    return (
        <div className="fixed top-24 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
            {toasts.map(toast => (
                <div key={toast.id} className="pointer-events-auto w-80 bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl border border-white/50 p-4 flex items-start gap-3 animate-fade-in-up">
                    <div className={`mt-0.5 p-1 rounded-full ${toast.type === 'success' ? 'bg-green-100 text-green-600' : toast.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        {toast.type === 'success' && <CheckCircle className="w-4 h-4" />}
                        {toast.type === 'error' && <AlertCircle className="w-4 h-4" />}
                        {(toast.type === 'info' || toast.type === 'warning') && <Info className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-900">{toast.title}</h4>
                        <p className="text-sm text-slate-500 mt-0.5">{toast.message}</p>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}

// --- Event Calendar ---
interface EventCalendarProps {
    events: CalendarEvent[];
    onAddEvent?: (date: string, time: string, title: string) => void;
    onEditEvent?: (event: CalendarEvent, newTime: string, newDate: string) => void;
    onDeleteEvent?: (eventId: string) => void;
    checkConflict?: (date: string, time: string) => boolean;
    onDateSelect?: (date: string) => void;
}

export const EventCalendar: React.FC<EventCalendarProps> = ({ events, onAddEvent, onEditEvent, onDeleteEvent, checkConflict, onDateSelect }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
    const { t } = useLanguage();

    // Form state
    const [eventTitle, setEventTitle] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [eventDate, setEventDate] = useState('');

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const handleDateClick = (day: number) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedDate(dateStr);
        
        if (onDateSelect) {
            onDateSelect(dateStr);
            return;
        }

        setIsModalOpen(true);
        setEditingEvent(null); 
        setEventTitle('');
        setEventTime('');
        setEventDate(dateStr);
    };

    const handleSave = () => {
        if (!eventTitle || !eventTime || !eventDate) return;

        if (checkConflict && checkConflict(eventDate, eventTime) && (!editingEvent || editingEvent.time !== eventTime || editingEvent.date !== eventDate)) {
             if (!window.confirm(`${t('conflict_alert')} ${t('conflict_msg')} Continue anyway?`)) {
                 return;
             }
        }

        if (editingEvent && onEditEvent) {
             onEditEvent({ ...editingEvent, title: eventTitle }, eventTime, eventDate);
        } else if (onAddEvent) {
             onAddEvent(eventDate, eventTime, eventTitle);
        }
        setIsModalOpen(false);
    };

    const startEdit = (event: CalendarEvent) => {
        setEditingEvent(event);
        setEventTitle(event.title);
        setEventTime(event.time);
        setEventDate(event.date);
    };

    const handleDelete = (id: string) => {
        if (onDeleteEvent && window.confirm('Delete this event?')) {
            onDeleteEvent(id);
            setIsModalOpen(false);
        }
    }

    const getEventsForDay = (day: number) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return events.filter(e => e.date === dateStr);
    };

    const renderCell = (day: number) => {
        const dayEvents = getEventsForDay(day);
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
        const isSelected = selectedDate === dateStr;

        return (
            <div 
                key={day} 
                onClick={() => handleDateClick(day)}
                className={`min-h-[100px] border border-slate-100 bg-white rounded-xl p-2 cursor-pointer transition-all hover:border-indigo-300 hover:shadow-md flex flex-col justify-between group ${isToday ? 'ring-2 ring-indigo-500 bg-indigo-50/30' : ''} ${isSelected ? 'border-indigo-500 shadow-inner bg-indigo-50/50' : ''}`}
            >
                <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-700 group-hover:bg-slate-100'}`}>{day}</span>
                    {dayEvents.length > 0 && (
                        <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">{dayEvents.length}</span>
                    )}
                </div>
                <div className="space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev, i) => (
                        <div key={i} className={`text-[10px] truncate px-1.5 py-1 rounded font-medium ${ev.type === 'blocked' ? 'bg-red-100 text-red-700' : ev.type === 'quotation' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                            {ev.time} {ev.title}
                        </div>
                    ))}
                    {dayEvents.length > 2 && <div className="text-[10px] text-slate-400 pl-1">+{dayEvents.length - 2} more</div>}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex items-center bg-slate-100 rounded-lg p-1">
                    <button onClick={prevMonth} className="p-2 rounded-md hover:bg-white hover:shadow-sm text-slate-500 transition-all"><ChevronLeft className="w-4 h-4" /></button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1 text-xs font-bold text-slate-600 hover:text-indigo-600">Today</button>
                    <button onClick={nextMonth} className="p-2 rounded-md hover:bg-white hover:shadow-sm text-slate-500 transition-all"><ChevronRight className="w-4 h-4" /></button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-4 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-3">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="bg-slate-50/50 rounded-xl" />)}
                {Array.from({ length: daysInMonth }).map((_, i) => renderCell(i + 1))}
            </div>

            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEvent ? t('edit_event') : t('calendar_events')}>
                <div className="space-y-5">
                    {!editingEvent ? (
                        // View Mode
                        <>
                            <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-hide">
                                {selectedDate && events.filter(e => e.date === selectedDate).length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                                        <CalendarIcon className="w-12 h-12 mb-2 opacity-20" />
                                        <p className="text-sm">No events scheduled for this day.</p>
                                    </div>
                                )}
                                {selectedDate && events.filter(e => e.date === selectedDate).map(ev => (
                                    <div key={ev.id} onClick={() => startEdit(ev)} className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer flex justify-between items-center group transition-colors">
                                        <div>
                                            <div className="font-bold text-slate-800 text-sm">{ev.title}</div>
                                            <div className="text-xs text-slate-500 flex items-center mt-1.5">
                                                <Clock className="w-3 h-3 mr-1.5" /> {ev.time}
                                                <span className={`ml-3 px-2 py-0.5 rounded-full uppercase text-[9px] font-bold tracking-wide ${ev.type === 'blocked' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>{ev.type}</span>
                                            </div>
                                        </div>
                                        <Edit2 className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ))}
                            </div>
                            {onAddEvent && (
                                <div className="pt-5 border-t border-slate-100 mt-2">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">{t('add_event')}</h4>
                                    <div className="space-y-3">
                                        <Input placeholder={t('event_title')} value={eventTitle} onChange={e => setEventTitle(e.target.value)} />
                                        <TimeInput value={eventTime} onChange={e => setEventTime(e.target.value)} />
                                        <Button className="w-full" onClick={handleSave} icon={Plus}>{t('save')}</Button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        // Edit Mode
                        <div className="space-y-4">
                            <Input label={t('event_title')} value={eventTitle} onChange={e => setEventTitle(e.target.value)} />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Date" type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} />
                                <TimeInput label={t('event_time')} value={eventTime} onChange={e => setEventTime(e.target.value)} />
                            </div>
                            <div className="flex space-x-3 pt-4">
                                <Button variant="danger" className="flex-1" onClick={() => handleDelete(editingEvent.id)} icon={Trash2}>{t('delete_event')}</Button>
                                <Button className="flex-1" onClick={handleSave} icon={Check}>{t('save')}</Button>
                            </div>
                            <button onClick={() => setEditingEvent(null)} className="w-full text-xs text-center text-slate-500 hover:text-indigo-600 mt-2 font-medium">Cancel Edit</button>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

// --- Verification Badge ---
export const VerificationBadge: React.FC<{ status: VerificationStatus }> = ({ status }) => {
    if (status === 'verified') return <div className="text-blue-500 flex items-center" title="Verified"><CheckCircle className="w-5 h-5" /></div>;
    if (status === 'pending') return <div className="text-yellow-500 flex items-center" title="Pending"><AlertCircle className="w-5 h-5" /></div>;
    return <div className="text-red-500 flex items-center" title="Rejected"><X className="w-5 h-5" /></div>;
}

// --- Profile Header (Standard) ---
interface ProfileHeaderProps {
    name: string;
    role: UserRole;
    verificationStatus: VerificationStatus;
    rating?: number;
    reviewCount?: number;
    coverImage?: string;
}
export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ name, role, verificationStatus, rating, reviewCount, coverImage }) => {
    const { t } = useLanguage();
    return (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-8 relative">
            <div className="h-48 bg-gradient-to-r from-indigo-600 to-purple-600 relative">
                {coverImage && <img src={coverImage} className="w-full h-full object-cover opacity-50" alt="Cover" />}
            </div>
            <div className="px-8 pb-8 pt-2 relative">
                <div className="absolute -top-16 left-8 w-32 h-32 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center text-4xl font-bold text-indigo-600 overflow-hidden">
                    {/* Placeholder Avatar */}
                    {name.charAt(0)}
                </div>
                <div className="ml-36 md:ml-40 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                         <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            {name} 
                            <VerificationBadge status={verificationStatus} />
                         </h1>
                         <div className="flex items-center gap-3 mt-2">
                            <Badge color="blue" className="uppercase tracking-wide">{t(role)}</Badge>
                            {rating !== undefined && (
                                <div className="flex items-center text-yellow-500 text-sm font-bold">
                                    <Star className="w-4 h-4 fill-current mr-1" /> {rating} ({reviewCount} reviews)
                                </div>
                            )}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// --- Info Row Helper ---
export const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex justify-between py-3 border-b border-slate-50 last:border-0">
        <span className="text-sm text-slate-500 font-medium">{label}</span>
        <span className="text-sm text-slate-900 font-semibold">{value}</span>
    </div>
);
