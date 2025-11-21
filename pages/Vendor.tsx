
import React, { useState, useEffect } from 'react';
import { UserRole, Booking, VendorProfile, CalendarEvent, MenuItem, User } from '../types';
import { MOCK_VENDORS, MOCK_BOOKINGS, updateBookingStatus, addVendorPackage, addVendorImage, removeVendorImage, toggleBlockedDate, updateBooking, checkAvailability, addVendorMenuItem, toggleVendorAmenity, MOCK_USERS } from '../services/mockData';
import { Card, Badge, Button, Modal, Input, Tabs, LanguageSelector, EventCalendar, Select, NotificationBell, ProfileHeader, InfoRow } from '../components/Shared';
import { Calendar as CalendarIcon, IndianRupee, Users, CheckSquare, Settings, Image, BarChart2, Plus, X, Clock, CheckCircle, XCircle, Trash2, Utensils, Home, LogOut, User as UserIcon, Edit2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';

interface VendorDashboardProps {
    role: UserRole;
}

export const VendorDashboard: React.FC<VendorDashboardProps> = ({ role }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const vendorProfile = MOCK_VENDORS.find(v => v.role === role) || MOCK_VENDORS[0];
    const user = MOCK_USERS.find(u => u.id === vendorProfile.id);
    const [refreshKey, setRefreshKey] = useState(0);
    const { t } = useLanguage();

    const handleDataUpdate = () => {
        setRefreshKey(prev => prev + 1);
    };

    if (!user) return null;

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
            {/* Modern Sidebar */}
            <div className="w-72 bg-white border-r border-slate-200 flex flex-col z-20 shadow-xl shadow-slate-200/50">
                <div className="p-8">
                    <div className="flex items-center gap-3 text-indigo-600 mb-8">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg"></div>
                        <span className="text-xl font-extrabold tracking-tight text-slate-900">EventHorizon</span>
                    </div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pl-2">{t('dashboard')}</div>
                    <nav className="space-y-1">
                     {[
                        { id: 'overview', label: t('overview'), icon: BarChart2 },
                        { id: 'bookings', label: t('bookings'), icon: CalendarIcon },
                        { id: 'profile', label: t('profile'), icon: UserIcon }, // Replaces Services/Portfolio with unified Profile view
                        { id: 'calendar', label: t('calendar'), icon: Clock },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 group
                                ${activeTab === item.id 
                                    ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 mr-3 transition-colors ${activeTab === item.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
                            {item.label}
                        </button>
                    ))}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                         <NotificationBell userId={vendorProfile.id} />
                    </div>
                    <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                            {vendorProfile.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-900 truncate">{vendorProfile.name}</p>
                            <p className="text-xs text-slate-500 truncate capitalize">{t(role)}</p>
                        </div>
                    </div>
                    <LanguageSelector />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12">
                {activeTab === 'overview' && <Overview role={role} vendorId={vendorProfile.id} key={refreshKey} />}
                {activeTab === 'bookings' && <BookingsManager role={role} vendorId={vendorProfile.id} onUpdate={handleDataUpdate} key={refreshKey} />}
                {activeTab === 'profile' && <UnifiedVendorProfile user={user} vendor={vendorProfile} onUpdate={handleDataUpdate} key={refreshKey} />}
                {activeTab === 'calendar' && <CalendarManager vendor={vendorProfile} onUpdate={handleDataUpdate} key={refreshKey} />}
            </div>
        </div>
    );
};

// --- Components ---

const Overview: React.FC<{ role: string; vendorId: string }> = ({ role, vendorId }) => {
    const myBookings = MOCK_BOOKINGS.filter(b => b.vendorId === vendorId);
    const totalEarnings = myBookings.filter(b => b.status === 'confirmed' || b.status === 'completed').reduce((acc, b) => acc + b.amount, 0);
    const pendingCount = myBookings.filter(b => b.status === 'pending').length;
    const confirmedCount = myBookings.filter(b => b.status === 'confirmed').length;
    const { t } = useLanguage();

    return (
        <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
            <div className="flex justify-between items-end pb-6 border-b border-slate-200">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{t('dashboard')}</h1>
                    <p className="text-slate-500 mt-2">{t('welcome')}, here's what's happening with your business.</p>
                </div>
                <Badge color="gray" className="px-3 py-1.5 text-sm"><Clock className="w-3 h-3 mr-2" /> {new Date().toLocaleDateString()}</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <IndianRupee className="w-24 h-24 text-indigo-600" />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">{t('total_earnings')}</p>
                    <p className="text-4xl font-extrabold text-indigo-600 mt-2">₹{totalEarnings.toLocaleString()}</p>
                    <div className="mt-4 text-sm text-green-600 font-medium flex items-center">
                        <span className="bg-green-100 px-1.5 py-0.5 rounded mr-2">+12%</span> from last month
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock className="w-24 h-24 text-amber-500" />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">{t('pending_requests')}</p>
                    <p className="text-4xl font-extrabold text-amber-500 mt-2">{pendingCount}</p>
                     <div className="mt-4 text-sm text-slate-400 font-medium">
                        Action required
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-all">
                     <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CheckCircle className="w-24 h-24 text-emerald-500" />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">{t('confirmed_events')}</p>
                    <p className="text-4xl font-extrabold text-emerald-500 mt-2">{confirmedCount}</p>
                     <div className="mt-4 text-sm text-emerald-600 font-medium">
                        On track
                    </div>
                </div>
            </div>
        </div>
    );
};

const UnifiedVendorProfile: React.FC<{ user: User; vendor: VendorProfile; onUpdate: () => void }> = ({ user, vendor, onUpdate }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('details');
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div className="animate-fade-in max-w-5xl mx-auto">
            <ProfileHeader 
                name={vendor.name} 
                role={vendor.role} 
                verificationStatus={user.verificationStatus} 
                rating={vendor.rating}
                reviewCount={vendor.reviewCount}
                coverImage={vendor.images[0]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1">
                    <Card className="p-0 overflow-hidden sticky top-8">
                        <div className="bg-slate-50 p-4 border-b border-slate-100 font-bold text-slate-700">Profile Menu</div>
                        <nav className="flex flex-col">
                            {[
                                { id: 'details', label: 'Basic Details', icon: UserIcon },
                                { id: 'packages', label: 'Packages & Menu', icon: Settings },
                                { id: 'portfolio', label: 'Portfolio', icon: Image },
                                { id: 'kyc', label: 'KYC & Documents', icon: CheckCircle },
                                { id: 'reviews', label: 'Reviews', icon: CheckSquare }
                            ].map(item => (
                                <button 
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`flex items-center p-4 text-sm font-medium transition-colors text-left ${activeTab === item.id ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'}`}
                                >
                                    <item.icon className="w-4 h-4 mr-3" />
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </Card>
                </div>

                <div className="lg:col-span-3 space-y-8">
                    {activeTab === 'details' && (
                        <Card className="p-8">
                             <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-900">Personal & Business Info</h3>
                                <Button size="sm" variant="outline" icon={Edit2} onClick={() => setIsEditing(!isEditing)}>{t('edit_profile')}</Button>
                            </div>

                            {isEditing ? (
                                <div className="space-y-4">
                                    <Input label={t('full_name')} defaultValue={user.name} />
                                    <Input label={t('phone')} defaultValue={user.phone} />
                                    <Input label={t('city')} defaultValue={user.city} />
                                    <Input label={t('bio')} defaultValue={user.bio} />
                                    <Input label={t('company_name')} defaultValue={vendor.companyName} />
                                    <div className="flex gap-2 justify-end mt-4">
                                        <Button variant="ghost" onClick={() => setIsEditing(false)}>{t('cancel')}</Button>
                                        <Button onClick={() => setIsEditing(false)}>{t('save')}</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <InfoRow label={t('full_name')} value={user.name} />
                                    <InfoRow label={t('company_name')} value={vendor.companyName || '-'} />
                                    <InfoRow label={t('email')} value={user.email} />
                                    <InfoRow label={t('phone')} value={user.phone || '-'} />
                                    <InfoRow label={t('city')} value={user.city || vendor.location} />
                                    <InfoRow label={t('languages_known')} value={user.languagesKnown?.join(', ') || 'English'} />
                                    
                                    {/* Role Specific Details */}
                                    {vendor.role === 'venue' && (
                                        <>
                                            <InfoRow label={t('venue_type')} value={vendor.venueType || 'Hall'} />
                                            <InfoRow label={t('capacity')} value={vendor.capacity?.toString() || '0'} />
                                        </>
                                    )}
                                    
                                    {vendor.role === 'makeup' && (
                                        <InfoRow label={t('products_used')} value={vendor.productsUsed?.join(', ') || '-'} />
                                    )}

                                    <div className="pt-6 mt-4 border-t border-slate-100">
                                        <span className="block text-sm text-slate-500 font-medium mb-2">{t('bio')} / Description</span>
                                        <p className="text-slate-800 text-sm leading-relaxed">{vendor.description || user.bio}</p>
                                    </div>
                                </div>
                            )}
                        </Card>
                    )}

                    {activeTab === 'packages' && (
                         <ServiceManager role={vendor.role} vendorId={vendor.id} onUpdate={onUpdate} />
                    )}

                    {activeTab === 'portfolio' && (
                         <PortfolioManager vendor={vendor} onUpdate={onUpdate} />
                    )}

                    {activeTab === 'kyc' && (
                        <Card className="p-8">
                            <h3 className="text-xl font-bold text-slate-900 mb-6">KYC & Verification</h3>
                            <div className="flex items-center mb-6 p-4 bg-slate-50 rounded-xl">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${user.verificationStatus === 'verified' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                    {user.verificationStatus === 'verified' ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 capitalize">{user.verificationStatus}</div>
                                    <div className="text-sm text-slate-500">Status of your document verification</div>
                                </div>
                            </div>
                            
                            <h4 className="font-bold text-sm text-slate-500 uppercase tracking-wide mb-4">Uploaded Documents</h4>
                            <div className="space-y-2">
                                {Object.entries(user.kycDocuments || {}).map(([key, val]) => (
                                    <div key={key} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg">
                                        <span className="text-sm font-medium text-slate-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                        <Badge color="blue">Uploaded</Badge>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {activeTab === 'reviews' && (
                        <Card className="p-8">
                            <h3 className="text-xl font-bold text-slate-900 mb-6">Reviews</h3>
                            <div className="text-center p-8 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                <CheckSquare className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p>No reviews available yet.</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

const BookingsManager: React.FC<{ role: string; vendorId: string; onUpdate: () => void }> = ({ role, vendorId, onUpdate }) => {
    const bookings = MOCK_BOOKINGS.filter(b => b.vendorId === vendorId).sort((a,b) => b.createdAt - a.createdAt);
    const { t } = useLanguage();
    const { addToast } = useNotification();

    const handleStatusChange = (id: string, status: Booking['status']) => {
        updateBookingStatus(id, status);
        addToast('Booking Updated', `Status changed to ${status}`, 'success');
        onUpdate();
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
             <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">{t('bookings')}</h1>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{t('client_info')}</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{t('date_package')}</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{t('overview')}</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {bookings.map(b => (
                            <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <div className="font-bold text-slate-900 text-base">{b.clientName}</div>
                                    <div className="text-xs text-slate-400 mt-1">ID: #{b.id.substr(0,6)}</div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <div className="flex items-center gap-2 text-sm text-slate-900 font-medium">
                                        <CalendarIcon className="w-4 h-4 text-slate-400" /> {b.date} 
                                        <span className="text-slate-300">|</span>
                                        <Clock className="w-4 h-4 text-slate-400" /> {b.time}
                                    </div>
                                    <div className="text-xs font-bold text-indigo-600 mt-1.5 bg-indigo-50 inline-block px-2 py-0.5 rounded">{b.packageName || 'Custom'}</div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <Badge color={b.status === 'confirmed' ? 'green' : b.status === 'pending' ? 'yellow' : b.status === 'cancelled' ? 'red' : 'gray'}>
                                        {t(`status_${b.status}`)}
                                    </Badge>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                                    {b.status === 'pending' && (
                                        <div className="flex justify-end space-x-3">
                                            <button onClick={() => handleStatusChange(b.id, 'confirmed')} className="text-green-600 hover:text-green-700 font-bold text-xs bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors">
                                                {t('accept')}
                                            </button>
                                            <button onClick={() => handleStatusChange(b.id, 'rejected')} className="text-red-600 hover:text-red-700 font-bold text-xs bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">
                                                {t('reject')}
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ServiceManager: React.FC<{ role: string; vendorId: string; onUpdate: () => void }> = ({ role, vendorId, onUpdate }) => {
    const vendor = MOCK_VENDORS.find(v => v.id === vendorId);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPackage, setNewPackage] = useState({ name: '', price: '', description: '', features: '', unit: '' });
    const [newItem, setNewItem] = useState<Partial<MenuItem>>({ name: '', price: 0, type: 'veg' });
    const { t } = useLanguage();
    const { addToast } = useNotification();

    const handleAddPackage = () => {
        if (!newPackage.name || !newPackage.price) return;
        addVendorPackage(vendorId, {
            name: newPackage.name,
            price: Number(newPackage.price),
            description: newPackage.description,
            features: newPackage.features.split(',').map(s => s.trim()),
            unit: newPackage.unit || 'per event'
        });
        setIsModalOpen(false);
        setNewPackage({ name: '', price: '', description: '', features: '', unit: '' });
        addToast('Package Added', 'New service package created.', 'success');
        onUpdate();
    };

    const handleAddMenuItem = () => {
        if(!newItem.name || !newItem.price) return;
        addVendorMenuItem(vendorId, newItem as any);
        setNewItem({ name: '', price: 0, type: 'veg' });
        addToast('Menu Item Added', `${newItem.name} added to menu.`, 'success');
        onUpdate();
    }

    return (
        <div className="space-y-10 animate-fade-in">
            {/* Packages Section */}
            <Card className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">{t('packages_pricing')}</h1>
                        <p className="text-slate-500 text-sm">Manage your service offerings</p>
                    </div>
                    <Button icon={Plus} onClick={() => setIsModalOpen(true)}>{t('add_new')}</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {vendor?.packages.map(pkg => (
                        <div key={pkg.id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all group relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{pkg.name}</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">{pkg.unit}</p>
                                </div>
                                <div className="text-2xl font-extrabold text-indigo-600">₹{pkg.price}</div>
                            </div>
                            <p className="text-slate-600 text-sm mb-4 leading-relaxed">{pkg.description}</p>
                            <div className="flex flex-wrap gap-2">
                                {pkg.features.map((f, i) => (
                                    <span key={i} className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded">{f}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Specific Role Features */}
            {role === 'caterer' && (
                <Card className="p-8">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center"><Utensils className="w-5 h-5 mr-2 text-slate-400" /> {t('menu_builder')}</h2>
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex gap-4 items-end mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <Input className="flex-1 mb-0 bg-white" placeholder="Item Name" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                            <div className="w-32">
                                <Input className="mb-0 bg-white" type="number" placeholder="Price" value={newItem.price} onChange={e => setNewItem({...newItem, price: parseInt(e.target.value)})} />
                            </div>
                            <div className="w-40">
                                <Select 
                                    className="mb-0 bg-white"
                                    options={[{value: 'veg', label: 'Veg'}, {value: 'non-veg', label: 'Non-Veg'}, {value: 'beverage', label: 'Drink'}]}
                                    value={newItem.type}
                                    onChange={e => setNewItem({...newItem, type: e.target.value as any})}
                                />
                            </div>
                            <Button onClick={handleAddMenuItem} icon={Plus} className="h-[46px] px-6">{t('add_new')}</Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {vendor?.menuItems?.map(item => (
                                <div key={item.id} className="flex justify-between items-center p-4 border border-slate-100 rounded-xl bg-white hover:shadow-sm transition-shadow">
                                    <div className="flex items-center">
                                        <div className={`w-2.5 h-2.5 rounded-full mr-3 ${item.type === 'veg' ? 'bg-green-500' : item.type === 'non-veg' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                        <span className="font-bold text-slate-700">{item.name}</span>
                                    </div>
                                    <span className="font-bold text-slate-900">₹{item.price}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            )}

            {role === 'venue' && (
                <Card className="p-8">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center"><Home className="w-5 h-5 mr-2 text-slate-400" /> {t('amenities')}</h2>
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex flex-wrap gap-3">
                            {['Parking', 'AC', 'Stage', 'Sound System', 'Rooms', 'Projector', 'Wifi', 'Security'].map(am => {
                                const has = vendor?.amenities?.includes(am);
                                return (
                                    <button 
                                        key={am}
                                        onClick={() => { toggleVendorAmenity(vendorId, am); onUpdate(); }}
                                        className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all border ${has ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        {am}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </Card>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('add_new')}>
                <div className="space-y-4">
                    <Input label="Package Name" placeholder="e.g. Gold Package" value={newPackage.name} onChange={e => setNewPackage({...newPackage, name: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                         <Input label="Price (₹)" type="number" value={newPackage.price} onChange={e => setNewPackage({...newPackage, price: e.target.value})} />
                         <Input label="Unit" placeholder="e.g. per plate" value={newPackage.unit} onChange={e => setNewPackage({...newPackage, unit: e.target.value})} />
                    </div>
                    <Input label="Description" value={newPackage.description} onChange={e => setNewPackage({...newPackage, description: e.target.value})} />
                    <Input label="Features" placeholder="Comma separated list..." value={newPackage.features} onChange={e => setNewPackage({...newPackage, features: e.target.value})} />
                    <Button className="w-full h-12" onClick={handleAddPackage}>{t('save')}</Button>
                </div>
            </Modal>
        </div>
    );
};

const PortfolioManager: React.FC<{ vendor: VendorProfile; onUpdate: () => void }> = ({ vendor, onUpdate }) => {
    const [newImageUrl, setNewImageUrl] = useState('');
    const { t } = useLanguage();
    const { addToast } = useNotification();

    const handleAdd = () => {
        if(!newImageUrl) return;
        addVendorImage(vendor.id, newImageUrl);
        setNewImageUrl('');
        addToast('Image Uploaded', 'Portfolio updated successfully.', 'success');
        onUpdate();
    }

    return (
        <Card className="p-8 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold text-slate-900">{t('portfolio')}</h1>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex gap-4 mb-8">
                    <Input placeholder="Paste Image URL" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} className="flex-grow mb-0" />
                    <Button onClick={handleAdd} className="h-[46px]">{t('add_new')}</Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {vendor.images.map((img, idx) => (
                        <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer">
                            <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Portfolio" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button onClick={() => { removeVendorImage(vendor.id, idx); onUpdate(); }} className="p-2 bg-white rounded-full text-red-500 hover:bg-red-50 transition-colors">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                    <div className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer" onClick={() => document.querySelector('input')?.focus()}>
                        <Plus className="w-8 h-8 mb-2" />
                        <span className="text-sm font-medium">Add Image</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};

const CalendarManager: React.FC<{ vendor: VendorProfile; onUpdate: () => void }> = ({ vendor, onUpdate }) => {
    const { t } = useLanguage();

    const events: CalendarEvent[] = [
        ...MOCK_BOOKINGS.filter(b => b.vendorId === vendor.id).map(b => ({
            id: b.id,
            title: `${b.clientName} (${b.packageName || 'Custom'})`,
            date: b.date,
            time: b.time,
            type: 'booking' as const,
            status: b.status
        })),
        ...vendor.blockedDates.map((date, idx) => ({
            id: `block-${idx}`,
            title: 'BLOCKED',
            date: date,
            time: 'All Day',
            type: 'blocked' as const
        }))
    ];

    const handleAddEvent = (date: string, time: string, title: string) => {
        toggleBlockedDate(vendor.id, date);
        onUpdate();
    }

    const handleEditEvent = (event: CalendarEvent, newTime: string, newDate: string) => {
        if (event.type === 'booking') {
             updateBooking(event.id, { date: newDate, time: newTime });
        } else {
             toggleBlockedDate(vendor.id, event.date); 
             toggleBlockedDate(vendor.id, newDate);
        }
        onUpdate();
    }

    const handleDeleteEvent = (id: string) => {
        if (id.startsWith('b')) {
            updateBookingStatus(id, 'cancelled');
        } 
        onUpdate();
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900">{t('calendar')}</h1>
            <EventCalendar 
                events={events}
                onAddEvent={handleAddEvent}
                onEditEvent={handleEditEvent}
                onDeleteEvent={handleDeleteEvent}
                checkConflict={(d, t) => checkAvailability(vendor.id, d, t)}
            />
        </div>
    );
};
