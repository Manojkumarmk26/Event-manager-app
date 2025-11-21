
import React, { useState } from 'react';
import { Card, Badge, Button, Modal, Input, LanguageSelector, EventCalendar, NotificationBell, ProfileHeader, InfoRow } from '../components/Shared';
import { MOCK_USERS, MOCK_BOOKINGS, MOCK_PAYOUTS, MOCK_TICKETS, updateVerificationStatus, toggleUserBlock, updateBookingStatus, processPayout, resolveTicket, checkAvailability, broadcastNotification } from '../services/mockData';
import { ShieldCheck, UserCheck, BarChart3, FileText, XCircle, CheckCircle, IndianRupee, TrendingUp, Users, Bell, MessageSquare, AlertOctagon, Search, Filter, MoreVertical, Calendar as CalendarIcon, User as UserIcon, Edit2, LogOut } from 'lucide-react';
import { User, Booking, SupportTicket, Payout, CalendarEvent } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const { t } = useLanguage();
    const currentUser = MOCK_USERS.find(u => u.role === 'admin') || MOCK_USERS[0];

    const menuItems = [
        { id: 'dashboard', label: t('dashboard'), icon: BarChart3 },
        { id: 'verification', label: t('verification_queue'), icon: ShieldCheck },
        { id: 'users', label: t('users'), icon: Users },
        { id: 'bookings', label: t('bookings'), icon: FileText },
        { id: 'calendar', label: t('calendar'), icon: CalendarIcon },
        { id: 'finance', label: t('finance'), icon: IndianRupee },
        { id: 'support', label: t('support'), icon: MessageSquare },
        { id: 'content', label: t('content'), icon: Bell },
        { id: 'profile', label: t('profile'), icon: UserIcon },
    ];

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Admin Sidebar */}
            <div className="w-64 bg-gray-900 text-white flex flex-col shadow-xl">
                <div className="p-6 border-b border-gray-800">
                    <h2 className="text-2xl font-bold tracking-wider text-indigo-400">{t('app_name')}</h2>
                    <div className="flex items-center mt-2 space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{t('admin')}</span>
                    </div>
                </div>
                
                <nav className="flex-1 py-6 space-y-1">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-all duration-200 border-l-4
                                ${activeTab === item.id 
                                    ? 'bg-gray-800 text-white border-indigo-500' 
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white border-transparent'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 mr-3 ${activeTab === item.id ? 'text-indigo-500' : 'text-gray-500'}`} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 bg-gray-800 border-t border-gray-700">
                    <LanguageSelector />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto">
                <header className="bg-white shadow-sm py-4 px-8 flex justify-between items-center sticky top-0 z-10">
                    <h1 className="text-2xl font-bold text-gray-800">{menuItems.find(m => m.id === activeTab)?.label}</h1>
                    <div className="flex items-center space-x-4">
                        <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center animate-pulse">
                            <AlertOctagon className="w-3 h-3 mr-1" /> {t('fraud_alert')}: {t('no_issues')}
                        </div>
                        <NotificationBell userId={currentUser.id} />
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">A</div>
                    </div>
                </header>

                <div className="p-8">
                    {activeTab === 'dashboard' && <DashboardOverview />}
                    {activeTab === 'verification' && <VerificationQueue />}
                    {activeTab === 'users' && <UserManagement />}
                    {activeTab === 'bookings' && <BookingManagement />}
                    {activeTab === 'calendar' && <GlobalCalendar />}
                    {activeTab === 'finance' && <FinanceOverview />}
                    {activeTab === 'support' && <SupportTickets />}
                    {activeTab === 'content' && <ContentManagement />}
                    {activeTab === 'profile' && <AdminProfileView user={currentUser} />}
                </div>
            </div>
        </div>
    );
};

// --- Sub-Components ---

const AdminProfileView: React.FC<{ user: User }> = ({ user }) => {
    const { t } = useLanguage();
    return (
        <div className="animate-fade-in max-w-4xl">
             <ProfileHeader 
                name={user.name} 
                role={user.role} 
                verificationStatus={user.verificationStatus} 
             />
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="md:col-span-2 space-y-6">
                     <Card className="p-6">
                         <h3 className="text-lg font-bold text-slate-900 mb-4">Admin Details</h3>
                         <div className="space-y-1">
                            <InfoRow label={t('full_name')} value={user.name} />
                            <InfoRow label={t('email')} value={user.email} />
                            <InfoRow label="Role Level" value="Super Admin" />
                            <InfoRow label={t('city')} value={user.city || 'HQ'} />
                            <div className="pt-4 mt-2 border-t border-slate-100">
                                <span className="block text-sm text-slate-500 font-medium mb-2">Responsibilities</span>
                                <p className="text-slate-800 text-sm leading-relaxed">System administration, user verification oversight, financial reconciliation, and platform health monitoring.</p>
                            </div>
                         </div>
                     </Card>
                     
                     <Card className="p-6">
                         <h3 className="text-lg font-bold text-slate-900 mb-4">Activity Log</h3>
                         <div className="space-y-3">
                             {[
                                 "Approved User 'Lens & Light Studios'",
                                 "Processed payout #PY1293",
                                 "Updated system banner configuration",
                                 "Resolved ticket #T8821"
                             ].map((log, i) => (
                                 <div key={i} className="flex items-center text-sm text-slate-600 p-2 bg-slate-50 rounded-lg border border-slate-100">
                                     <div className="w-2 h-2 rounded-full bg-indigo-500 mr-3"></div>
                                     {log}
                                 </div>
                             ))}
                         </div>
                     </Card>
                 </div>
                 
                 <div className="md:col-span-1">
                     <Card className="p-6">
                         <h3 className="text-lg font-bold text-slate-900 mb-4">System Status</h3>
                         <div className="space-y-4">
                             <div className="flex justify-between items-center">
                                 <span className="text-sm text-slate-500">Server Load</span>
                                 <Badge color="green">Healthy</Badge>
                             </div>
                             <div className="flex justify-between items-center">
                                 <span className="text-sm text-slate-500">DB Connection</span>
                                 <Badge color="green">Connected</Badge>
                             </div>
                             <div className="flex justify-between items-center">
                                 <span className="text-sm text-slate-500">AI Services</span>
                                 <Badge color="green">Online</Badge>
                             </div>
                             <div className="pt-4 mt-2 border-t border-slate-100">
                                 <Button className="w-full" variant="outline" icon={LogOut}>System Logout</Button>
                             </div>
                         </div>
                     </Card>
                 </div>
             </div>
        </div>
    );
}

const DashboardOverview: React.FC = () => {
    const { t } = useLanguage();
    const totalRevenue = MOCK_BOOKINGS.filter(b => b.status === 'completed' || b.status === 'confirmed').reduce((acc, b) => acc + b.amount, 0);
    const totalUsers = MOCK_USERS.length;
    const activeBookings = MOCK_BOOKINGS.filter(b => b.status === 'confirmed').length;
    const pendingKYC = MOCK_USERS.filter(u => u.verificationStatus === 'pending').length;

    // Mock Chart Data
    const revenueData = [
        { name: 'Mon', value: 4000 },
        { name: 'Tue', value: 3000 },
        { name: 'Wed', value: 5000 },
        { name: 'Thu', value: 2000 },
        { name: 'Fri', value: 6000 },
        { name: 'Sat', value: 9000 },
        { name: 'Sun', value: 7500 },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatsCard title={t('revenue')} value={`₹${totalRevenue.toLocaleString()}`} icon={IndianRupee} color="green" />
                <StatsCard title={t('total_users')} value={totalUsers} icon={Users} color="blue" />
                <StatsCard title={t('active_users')} value={activeBookings} icon={TrendingUp} color="purple" />
                <StatsCard title={t('verification_queue')} value={pendingKYC} icon={ShieldCheck} color="yellow" />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">{t('revenue')} (Weekly)</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Category Distribution</h3>
                    <div className="h-64 w-full flex justify-center items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={[
                                    { name: 'Photo', value: 40 },
                                    { name: 'Venue', value: 30 },
                                    { name: 'Caterer', value: 20 },
                                    { name: 'Makeup', value: 10 }
                                ]} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                                    {['#4F46E5', '#10B981', '#F59E0B', '#EC4899'].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
            
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg shadow-sm flex items-center justify-between">
                <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                    <div>
                        <h4 className="font-bold text-green-800">{t('system_healthy')}</h4>
                        <p className="text-sm text-green-700">All systems operational. AI Fraud Detection active.</p>
                    </div>
                </div>
                <Button variant="outline" size="sm">View Logs</Button>
            </div>
        </div>
    );
};

const GlobalCalendar: React.FC = () => {
    const { t } = useLanguage();
    
    // Admin sees ALL bookings
    const events: CalendarEvent[] = MOCK_BOOKINGS.map(b => ({
        id: b.id,
        title: `${b.clientName} -> ${b.vendorName}`,
        date: b.date,
        time: b.time,
        type: 'booking' as const,
        status: b.status
    }));

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900">Global Schedule</h1>
            <EventCalendar events={events} />
        </div>
    );
}

const VerificationQueue: React.FC = () => {
    const { t } = useLanguage();
    const pendingUsers = MOCK_USERS.filter(u => u.verificationStatus === 'pending');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [refresh, setRefresh] = useState(0);
    const { addToast } = useNotification();

    const handleApprove = (user: User) => {
        updateVerificationStatus(user.id, 'verified');
        addToast('User Approved', `${user.name} is now verified.`, 'success');
        setRefresh(p => p + 1);
    };

    const handleRejectClick = (user: User) => {
        setSelectedUser(user);
        setIsRejectModalOpen(true);
    };

    const confirmReject = () => {
        if (selectedUser) {
            updateVerificationStatus(selectedUser.id, 'rejected', rejectReason);
            addToast('User Rejected', `${selectedUser.name} rejection email sent.`, 'info');
            setIsRejectModalOpen(false);
            setRejectReason('');
            setSelectedUser(null);
            setRefresh(p => p + 1);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
             {pendingUsers.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
                    <ShieldCheck className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-500">{t('no_issues')}</h3>
                    <p className="text-gray-400">Verification queue is empty.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {pendingUsers.map(user => (
                        <Card key={user.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-shadow border-l-4 border-yellow-400">
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-700 font-bold">
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900">{user.name}</h4>
                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                        <Badge color="blue">{t(user.role)}</Badge>
                                        <span className="text-gray-400">•</span>
                                        {user.email}
                                    </p>
                                    <div className="mt-3 flex gap-2 text-xs text-indigo-600 font-medium cursor-pointer hover:underline">
                                        <FileText className="w-3 h-3" /> {t('review_docs')}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 md:mt-0 flex space-x-3">
                                <Button variant="danger" onClick={() => handleRejectClick(user)}>{t('reject')}</Button>
                                <Button className="bg-green-600 hover:bg-green-700 border-green-600" onClick={() => handleApprove(user)}>{t('approve_activate')}</Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
            
            <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} title={t('reject')}>
                <div className="space-y-4">
                    <Input 
                        label={t('reason_rejection')} 
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                    />
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>{t('cancel')}</Button>
                        <Button variant="danger" onClick={confirmReject} disabled={!rejectReason}>{t('confirm_rejection')}</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

const UserManagement: React.FC = () => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [refresh, setRefresh] = useState(0);
    
    const filteredUsers = MOCK_USERS.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleToggleBlock = (id: string) => {
        toggleUserBlock(id);
        setRefresh(p => p + 1);
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder={t('search_placeholder')}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" icon={Filter}>Filter</Button>
                </div>
            </div>

            <Card className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('users')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('role_select')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className={user.isBlocked ? 'bg-red-50' : ''}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                            {user.name[0]}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Badge color="gray">{t(user.role)}</Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {user.isBlocked ? (
                                        <Badge color="red">Blocked</Badge>
                                    ) : (
                                        <Badge color="green">Active</Badge>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button 
                                        onClick={() => handleToggleBlock(user.id)}
                                        className={`text-sm font-bold hover:underline ${user.isBlocked ? 'text-green-600' : 'text-red-600'}`}
                                    >
                                        {user.isBlocked ? t('unblock_user') : t('block_user')}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

const BookingManagement: React.FC = () => {
    const { t } = useLanguage();
    const [refresh, setRefresh] = useState(0);
    const { addToast } = useNotification();

    const handleCancel = (id: string) => {
        if(window.confirm("Are you sure you want to force cancel this booking? This will refund the client.")) {
            updateBookingStatus(id, 'cancelled');
            addToast('Booking Cancelled', 'Refund process initiated.', 'warning');
            setRefresh(p => p + 1);
        }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <Card className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('client_info')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {MOCK_BOOKINGS.map(booking => (
                            <tr key={booking.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">#{booking.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{booking.clientName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.vendorName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">₹{booking.amount}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                     <Badge color={booking.status === 'confirmed' ? 'green' : booking.status === 'pending' ? 'yellow' : booking.status === 'cancelled' ? 'red' : 'gray'}>
                                        {t(`status_${booking.status}`)}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                        <button onClick={() => handleCancel(booking.id)} className="text-red-600 hover:text-red-900 font-bold text-xs border border-red-200 px-2 py-1 rounded hover:bg-red-50">
                                            {t('force_cancel')}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

const FinanceOverview: React.FC = () => {
    const { t } = useLanguage();
    const [refresh, setRefresh] = useState(0);
    const totalPending = MOCK_PAYOUTS.filter(p => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0);
    const { addToast } = useNotification();

    const handleProcess = (id: string) => {
        processPayout(id);
        addToast('Payout Processed', 'Funds released to vendor account.', 'success');
        setRefresh(p => p + 1);
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard title="Pending Payouts" value={`₹${totalPending.toLocaleString()}`} icon={IndianRupee} color="yellow" />
                <StatsCard title="Platform Revenue" value="₹45,000" icon={TrendingUp} color="green" />
                <StatsCard title="Total Processed" value={`₹${MOCK_PAYOUTS.filter(p => p.status === 'processed').reduce((a,b) => a + b.amount, 0).toLocaleString()}`} icon={CheckCircle} color="blue" />
            </div>

            <h3 className="text-lg font-bold text-gray-800 mt-8 mb-4">{t('payouts')}</h3>
            <Card className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {MOCK_PAYOUTS.map(payout => (
                            <tr key={payout.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payout.vendorName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payout.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">₹{payout.amount.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Badge color={payout.status === 'pending' ? 'yellow' : 'green'}>
                                        {t(payout.status)}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {payout.status === 'pending' ? (
                                        <Button size="sm" onClick={() => handleProcess(payout.id)}>{t('process')}</Button>
                                    ) : (
                                        <span className="text-green-600 text-xs font-bold flex justify-end items-center"><CheckCircle className="w-3 h-3 mr-1" /> Done</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

const SupportTickets: React.FC = () => {
    const { t } = useLanguage();
    const [refresh, setRefresh] = useState(0);
    const { addToast } = useNotification();

    const handleResolve = (id: string) => {
        resolveTicket(id);
        addToast('Ticket Resolved', 'User notified.', 'success');
        setRefresh(p => p + 1);
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <Card className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {MOCK_TICKETS.map(ticket => (
                            <tr key={ticket.id}>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{ticket.subject}</div>
                                    <div className="text-xs text-gray-500">{ticket.date}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.userName}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Badge color={ticket.priority === 'high' ? 'red' : ticket.priority === 'medium' ? 'yellow' : 'blue'}>
                                        {ticket.priority}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Badge color={ticket.status === 'open' ? 'red' : ticket.status === 'in_progress' ? 'yellow' : 'green'}>
                                        {ticket.status}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {ticket.status !== 'resolved' && (
                                        <Button size="sm" variant="outline" onClick={() => handleResolve(ticket.id)}>{t('resolve')}</Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

const ContentManagement: React.FC = () => {
    const { t } = useLanguage();
    const [message, setMessage] = useState('');
    const { addToast } = useNotification();

    const handleSend = () => {
        if(message) {
            broadcastNotification('Admin Alert', message);
            addToast('Broadcast Sent', 'Notification sent to all users.', 'success');
            setMessage('');
        }
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-indigo-600" /> {t('broadcast_message')}
                </h3>
                <div className="flex gap-4">
                    <Input 
                        placeholder="Type your announcement here..." 
                        value={message} 
                        onChange={e => setMessage(e.target.value)} 
                        className="flex-1 mb-0"
                    />
                    <Button onClick={handleSend} disabled={!message} icon={Bell}>{t('send_alert')}</Button>
                </div>
            </Card>

            <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Banner Management (Mock)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 text-gray-400 cursor-pointer hover:border-indigo-500 hover:text-indigo-500 transition-colors">
                        + Add New Banner
                    </div>
                    <div className="h-32 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md relative group">
                        Summer Sale 20%
                        <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center rounded-lg cursor-pointer">Edit</div>
                    </div>
                    <div className="h-32 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md relative group">
                        Wedding Expo
                        <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center rounded-lg cursor-pointer">Edit</div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

const StatsCard: React.FC<{ title: string; value: string | number; icon: any; color: string }> = ({ title, value, icon: Icon, color }) => {
    const colors: any = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        purple: 'bg-purple-100 text-purple-600',
        red: 'bg-red-100 text-red-600',
    };

    return (
        <Card className="p-6 flex items-center justify-between hover:shadow-md transition-shadow border border-gray-100">
            <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
            <div className={`p-4 rounded-full ${colors[color] || 'bg-gray-100'}`}>
                <Icon className="w-6 h-6" />
            </div>
        </Card>
    );
}
