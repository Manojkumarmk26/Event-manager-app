
import React, { useState } from 'react';
import { UserRole, User, KYCDocuments, Language } from '../types';
import { loginUser, registerUser } from '../services/mockData';
import { Button, Card, Input, Select, Badge, LanguageSelector } from '../components/Shared';
import { Camera, Utensils, Home, Sparkles, User as UserIcon, ShieldCheck, AlertTriangle, Upload, ArrowLeft, CheckCircle2, Fingerprint } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const AuthPage: React.FC<AuthProps> = ({ onLogin }) => {
  const [view, setView] = useState<'login' | 'register' | 'role-select'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const { t } = useLanguage();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setView('register');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] relative">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-600 to-indigo-900 -z-10 rounded-b-[3rem]"></div>
        
        <div className="w-full max-w-md animate-fade-in-up z-10">
            <div className="flex justify-between items-center mb-8 px-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Sparkles className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">{t('app_name')}</h1>
                </div>
                <LanguageSelector />
            </div>

            <Card className="p-8 border-0 shadow-2xl shadow-indigo-900/20 backdrop-blur-xl bg-white/95">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">
                        {view === 'login' && t('welcome')}
                        {view === 'role-select' && t('role_select')}
                        {view === 'register' && t('create_account')}
                    </h2>
                    <p className="text-slate-500 text-sm mt-2">
                        {view === 'login' && "Sign in to manage your events"}
                        {view === 'role-select' && "Select how you want to use the platform"}
                        {view === 'register' && `Registering as ${t(selectedRole || 'client')}`}
                    </p>
                </div>

                {view === 'login' && (
                    <LoginForm onLogin={onLogin} onRegisterClick={() => setView('role-select')} />
                )}

                {view === 'role-select' && (
                    <RoleSelector onSelect={handleRoleSelect} onBack={() => setView('login')} />
                )}

                {view === 'register' && selectedRole && (
                    <RegisterForm 
                        role={selectedRole} 
                        onSuccess={(user) => onLogin(user)} 
                        onBack={() => setView('role-select')} 
                    />
                )}
            </Card>

            <div className="text-center mt-8 text-slate-400 text-xs">
                &copy; 2024 EventHorizon Inc. Secure & Verified.
            </div>
        </div>
    </div>
  );
};

export const KYCStatusPage: React.FC<{ user: User; onLogout: () => void; onResubmit: () => void }> = ({ user, onLogout, onResubmit }) => {
    const isRejected = user.verificationStatus === 'rejected';
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg p-10 text-center shadow-2xl border-0">
                <div className={`mx-auto w-20 h-20 flex items-center justify-center rounded-full mb-6 ${isRejected ? 'bg-red-50 text-red-500 ring-4 ring-red-50' : 'bg-amber-50 text-amber-500 ring-4 ring-amber-50'}`}>
                    {isRejected ? <AlertTriangle className="w-10 h-10" /> : <Fingerprint className="w-10 h-10" />}
                </div>
                
                <h2 className="text-3xl font-bold text-slate-900 mb-3">
                    {isRejected ? t('kyc_rejected') : t('kyc_pending')}
                </h2>
                
                <p className="text-slate-500 mb-8 leading-relaxed">
                    {isRejected 
                        ? `Reason: "${user.rejectionReason}". Please update your documents.`
                        : "Thanks for registering! Your documents are currently being reviewed by our admin team for security purposes."
                    }
                </p>

                <div className="space-y-3">
                    {isRejected && (
                        <Button onClick={onResubmit} className="w-full" size="lg">Update Documents</Button>
                    )}
                    <Button variant="outline" onClick={onLogout} className="w-full" size="lg">{t('logout')}</Button>
                </div>
            </Card>
        </div>
    );
}

// --- Sub Components ---

const LoginForm: React.FC<{ onLogin: (u: User) => void, onRegisterClick: () => void }> = ({ onLogin, onRegisterClick }) => {
    const [email, setEmail] = useState('client@demo.com'); 
    const [password, setPassword] = useState('password');
    const [error, setError] = useState('');
    const { t } = useLanguage();

    const handleSubmit = () => {
        const user = loginUser(email, password);
        if (user) {
            onLogin(user);
        } else {
            setError('Invalid email or password');
        }
    };

    return (
        <div className="space-y-5 animate-fade-in">
            <Input label={t('email')} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" />
            <div className="relative">
                <Input label={t('password')} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                <button className="absolute right-0 top-0 text-xs text-indigo-600 font-semibold hover:underline">Forgot?</button>
            </div>
            
            {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" /> {error}
                </div>
            )}
            
            <Button className="w-full text-lg shadow-indigo-500/25" size="lg" onClick={handleSubmit}>{t('sign_in')}</Button>
            
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-400 font-medium">Or continue with</span>
                </div>
            </div>

            <div className="text-center">
                <span className="text-slate-600 text-sm">{t('dont_have_account')} </span>
                <button onClick={onRegisterClick} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors">{t('register')}</button>
            </div>

             <div className="mt-6 bg-slate-50 p-4 rounded-xl text-xs text-slate-500 text-center">
                <p className="font-bold mb-1">Demo Credentials:</p>
                <div className="grid grid-cols-2 gap-2 text-left pl-4">
                    <p>Client: client@demo.com</p>
                    <p>Vendor: photo@demo.com</p>
                </div>
                <p className="mt-1 text-slate-400">Password: password</p>
            </div>
        </div>
    );
};

const RoleSelector: React.FC<{ onSelect: (r: UserRole) => void, onBack: () => void }> = ({ onSelect, onBack }) => {
    const { t } = useLanguage();
    const roles: { id: UserRole; label: string; icon: any; color: string; desc: string }[] = [
        { id: 'client', label: t('client'), icon: UserIcon, color: 'text-blue-600 bg-blue-50 border-blue-200', desc: "Plan & book events" },
        { id: 'photographer', label: t('photographer'), icon: Camera, color: 'text-indigo-600 bg-indigo-50 border-indigo-200', desc: "Showcase portfolio" },
        { id: 'caterer', label: t('caterer'), icon: Utensils, color: 'text-orange-600 bg-orange-50 border-orange-200', desc: "Menu management" },
        { id: 'venue', label: t('venue'), icon: Home, color: 'text-purple-600 bg-purple-50 border-purple-200', desc: "List your space" },
        { id: 'makeup', label: t('makeup'), icon: Sparkles, color: 'text-pink-600 bg-pink-50 border-pink-200', desc: "Beauty services" },
    ];

    return (
        <div className="space-y-4 animate-fade-in">
             <Button variant="ghost" onClick={onBack} className="mb-2 -ml-2 text-slate-500"><ArrowLeft className="w-4 h-4 mr-2" /> {t('back')}</Button>
            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-1 scrollbar-hide">
                {roles.map(role => (
                    <button 
                        key={role.id}
                        onClick={() => onSelect(role.id)}
                        className="flex items-center p-4 border rounded-2xl hover:bg-slate-50 hover:border-indigo-300 transition-all group text-left"
                    >
                        <div className={`p-3 rounded-xl mr-4 ${role.color} group-hover:scale-110 transition-transform`}>
                            <role.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="block font-bold text-slate-900">{role.label}</span>
                            <span className="text-xs text-slate-500">{role.desc}</span>
                        </div>
                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

const RegisterForm: React.FC<{ role: UserRole; onSuccess: (u: User) => void; onBack: () => void }> = ({ role, onSuccess, onBack }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', companyName: '' });
    const [docs, setDocs] = useState<KYCDocuments>({});
    const { language, t } = useLanguage();

    const handleRegister = () => {
        const user = registerUser({ ...formData, role, language }, docs);
        onSuccess(user);
    };

    const isClient = role === 'client';

    if (step === 1) {
        return (
            <div className="space-y-4 animate-fade-in">
                <Button variant="ghost" onClick={onBack} className="mb-2 -ml-2 text-slate-500"><ArrowLeft className="w-4 h-4 mr-2" /> {t('back')}</Button>
                
                <div className="grid grid-cols-2 gap-4">
                    <Input label={t('full_name')} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
                    <Input label={t('phone')} type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 98765..." />
                </div>
                {!isClient && <Input label={t('company_name')} value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} placeholder="Business Name" />}
                <Input label={t('email')} type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" />
                <Input label={t('password')} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
                
                <Button className="w-full mt-4" size="lg" onClick={() => isClient ? handleRegister() : setStep(2)}>
                    {isClient ? t('create_account') : "Next: Verification"}
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
             <Button variant="ghost" onClick={() => setStep(1)} className="mb-2 -ml-2 text-slate-500"><ArrowLeft className="w-4 h-4 mr-2" /> {t('back')}</Button>
            <div>
                <h3 className="font-bold text-lg text-slate-900">Complete KYC</h3>
                <p className="text-sm text-slate-500">{t('kyc_instructions')}</p>
            </div>

            <div className="space-y-4">
                <FileInput label="Aadhar / PAN Card" onChange={f => setDocs({...docs, idProof: f})} />
                
                {role === 'photographer' && <FileInput label="Portfolio (PDF/Link)" onChange={f => setDocs({...docs, portfolio: f})} />}
                
                {role === 'caterer' && (
                    <>
                        <FileInput label="FSSAI / Business License" onChange={f => setDocs({...docs, businessLicense: f})} />
                        <FileInput label="Menu Card" onChange={f => setDocs({...docs, menuFile: f})} />
                    </>
                )}
                
                {role === 'venue' && (
                    <>
                        <FileInput label="Ownership Proof" onChange={f => setDocs({...docs, ownershipProof: f})} />
                        <FileInput label="Venue Photos" onChange={f => setDocs({...docs, venuePhotos: [f]})} />
                    </>
                )}

                {role === 'makeup' && (
                    <>
                        <FileInput label="Certification" onChange={f => setDocs({...docs, certification: f})} />
                        <FileInput label="Portfolio Images" onChange={f => setDocs({...docs, portfolio: f})} />
                    </>
                )}
            </div>

            <Button className="w-full mt-4" size="lg" onClick={handleRegister}>{t('submit_verification')}</Button>
        </div>
    );
};

const FileInput: React.FC<{ label: string; onChange: (val: string) => void }> = ({ label, onChange }) => (
    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-indigo-50 hover:border-indigo-300 transition-all cursor-pointer relative group">
        <input 
            type="file" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            onChange={(e) => onChange(e.target.files?.[0]?.name || 'uploaded_file.pdf')}
        />
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-white group-hover:shadow-md transition-all">
            <Upload className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
        </div>
        <div className="text-sm font-semibold text-slate-900">{label}</div>
        <div className="text-xs text-slate-500 mt-1">Drag & drop or click to upload</div>
    </div>
);
