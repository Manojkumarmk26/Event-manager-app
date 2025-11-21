
import { VendorProfile, Booking, Package, User, KYCDocuments, UserRole, VerificationStatus, ChatMessage, Language, Payout, SupportTicket, Quotation, SavedSearch, Guest, MenuItem, AppNotification } from '../types';

// --- Mock Users (Auth Database) ---
export let MOCK_USERS: User[] = [
  {
    id: 'c1',
    name: 'Alice Client',
    email: 'client@demo.com',
    password: 'password',
    role: 'client',
    verificationStatus: 'verified',
    phone: '9876543210',
    language: 'en',
    favorites: ['v1'],
    savedSearches: [
        { id: 's1', name: 'Wedding Photographers', criteria: { term: 'Wedding', category: 'photographer', price: 'all' } }
    ],
    city: 'Chennai',
    bio: 'Planning my dream wedding!',
    languagesKnown: ['English', 'Tamil']
  },
  {
    id: 'c_tamil',
    name: 'Muthu Kumar',
    email: 'tamil@demo.com',
    password: 'password',
    role: 'client',
    verificationStatus: 'verified',
    phone: '9876543211',
    language: 'ta',
    favorites: [],
    savedSearches: [],
    city: 'Madurai',
    bio: 'Looking for traditional services.',
    languagesKnown: ['Tamil']
  },
  {
    id: 'a1',
    name: 'Super Admin',
    email: 'admin@demo.com',
    password: 'password',
    role: 'admin',
    verificationStatus: 'verified',
    language: 'en',
    city: 'Bangalore',
    bio: 'System Administrator'
  },
  {
    id: 'v1',
    name: 'Lens & Light Studios',
    companyName: 'Lens & Light',
    email: 'photo@demo.com',
    password: 'password',
    role: 'photographer',
    verificationStatus: 'verified',
    kycDocuments: { idProof: 'pan_card.jpg', portfolio: 'portfolio_link.pdf' },
    language: 'en',
    city: 'Chennai',
    bio: 'Professional wedding photographer with 5 years of experience.',
    languagesKnown: ['English', 'Tamil', 'Telugu']
  },
  {
    id: 'v2',
    name: 'Gourmet Delights',
    companyName: 'Gourmet Delights Co.',
    email: 'caterer@demo.com',
    password: 'password',
    role: 'caterer',
    verificationStatus: 'verified',
    kycDocuments: { businessLicense: 'fssai_license.pdf' },
    language: 'te',
    city: 'Hyderabad',
    bio: 'Best authentic catering service in town.',
    languagesKnown: ['Telugu', 'English']
  },
  {
    id: 'v3',
    name: 'The Grand Ballroom',
    companyName: 'Grand Estates',
    email: 'venue@demo.com',
    password: 'password',
    role: 'venue',
    verificationStatus: 'verified',
    kycDocuments: { ownershipProof: 'deed.pdf' },
    language: 'ml',
    city: 'Kochi',
    bio: 'Luxury banquet hall for all occasions.',
    languagesKnown: ['Malayalam', 'English']
  },
  {
    id: 'v4',
    name: 'Glamour by Sarah',
    companyName: 'Sarah Artistry',
    email: 'makeup@demo.com',
    password: 'password',
    role: 'makeup',
    verificationStatus: 'verified',
    kycDocuments: { certification: 'cert.pdf' },
    language: 'kn',
    city: 'Bangalore',
    bio: 'Certified makeup artist specializing in bridal looks.',
    languagesKnown: ['Kannada', 'English', 'Hindi']
  },
  {
    id: 'v5',
    name: 'Urban Frames',
    companyName: 'Urban Frames',
    email: 'urban@demo.com',
    password: 'password',
    role: 'photographer',
    verificationStatus: 'pending', // Pending Verification
    kycDocuments: { idProof: 'id_card_front.jpg', portfolio: 'behance.net/urbanframes' },
    language: 'en',
    city: 'Mumbai',
    bio: 'Freelance photographer.',
    languagesKnown: ['English', 'Hindi']
  },
  {
    id: 'v6_blocked',
    name: 'Fraud Vendor',
    companyName: 'Fake Services',
    email: 'fraud@demo.com',
    password: 'password',
    role: 'photographer',
    verificationStatus: 'rejected',
    language: 'en',
    isBlocked: true,
    city: 'Nowhere',
    bio: 'Fake profile'
  }
];

// --- Mock Notifications ---
export let MOCK_NOTIFICATIONS: AppNotification[] = [
    { id: 'n1', userId: 'c1', title: 'Welcome!', message: 'Welcome to EventHorizon. Start planning your event today.', type: 'info', read: false, timestamp: Date.now() - 1000000 },
    { id: 'n2', userId: 'v1', title: 'New Feature', message: 'You can now add video reels to your portfolio.', type: 'info', read: true, timestamp: Date.now() - 2000000 }
];

export const sendNotification = (userId: string, title: string, message: string, type: AppNotification['type'] = 'info') => {
    MOCK_NOTIFICATIONS.push({
        id: Math.random().toString(36).substr(2, 9),
        userId,
        title,
        message,
        type,
        read: false,
        timestamp: Date.now()
    });
};

export const markAllNotificationsRead = (userId: string) => {
    MOCK_NOTIFICATIONS.filter(n => n.userId === userId).forEach(n => n.read = true);
};

export const broadcastNotification = (title: string, message: string) => {
    MOCK_USERS.forEach(u => {
        sendNotification(u.id, title, message, 'info');
    });
};

// --- Mock Chat Messages ---
export let MOCK_CHATS: ChatMessage[] = [
    { id: 'm1', senderId: 'c1', receiverId: 'v1', text: 'Hi, is this date available?', originalLanguage: 'en', timestamp: Date.now() - 100000 },
    { id: 'm2', senderId: 'v1', receiverId: 'c1', text: 'Yes, it is! We have a slot.', originalLanguage: 'en', timestamp: Date.now() - 90000 },
    { id: 'm3', senderId: 'c_tamil', receiverId: 'v1', text: 'வணக்கம், உங்கள் சேவைகள் பற்றிய தகவல் வேண்டும்.', originalLanguage: 'ta', timestamp: Date.now() - 50000 }
];

// --- Mock Guests ---
export let MOCK_GUESTS: Guest[] = [
    { id: 'g1', clientId: 'c1', name: 'Uncle John', status: 'confirmed', count: 2 },
    { id: 'g2', clientId: 'c1', name: 'Aunt Mary', status: 'invited', count: 1 },
    { id: 'g3', clientId: 'c1', name: 'Best Friend Bob', status: 'declined', count: 1 }
];


// --- Vendor Profiles (Public Search Data) ---
export let MOCK_VENDORS: VendorProfile[] = [
  {
    id: 'v1',
    role: 'photographer',
    name: 'Lens & Light Studios',
    companyName: 'Lens & Light',
    rating: 4.8,
    reviewCount: 124,
    location: 'Chennai, TN',
    priceRange: '₹₹',
    startingPrice: 1500,
    description: 'Capturing your special moments with cinematic flair. Specialized in weddings and large events.',
    images: ['https://picsum.photos/800/600?random=1', 'https://picsum.photos/800/600?random=2'],
    tags: ['Wedding', 'Candid', 'Drone'],
    verified: true,
    blockedDates: ['2023-12-25', '2024-01-01'],
    packages: [
      { id: 'p1', name: 'Basic Coverage', price: 1500, description: '4 hours coverage, 200 digital photos.', features: ['4 Hours', 'Online Gallery'], unit: 'per event' },
      { id: 'p2', name: 'Premium Cinematic', price: 2500, description: '8 hours coverage, album, drone shots.', features: ['8 Hours', 'Drone', 'Physical Album'], unit: 'per event' }
    ]
  },
  {
    id: 'v2',
    role: 'caterer',
    name: 'Gourmet Delights',
    companyName: 'Gourmet Delights Co.',
    rating: 4.5,
    reviewCount: 89,
    location: 'Hyderabad, TS',
    priceRange: '₹₹₹',
    startingPrice: 45,
    description: 'Exquisite multi-cuisine catering for all occasions. Organic and locally sourced ingredients.',
    images: ['https://picsum.photos/800/600?random=3', 'https://picsum.photos/800/600?random=4'],
    tags: ['Buffet', 'Plated', 'Vegan Options'],
    verified: true,
    capacity: 500,
    blockedDates: [],
    packages: [
        { id: 'c1', name: 'Standard Buffet', price: 45, description: '3 Appetizers, 4 Mains, 2 Desserts', features: ['Service Staff', 'Cutlery'], unit: 'per plate' },
        { id: 'c2', name: 'Royal Feast', price: 75, description: '5 Appetizers, 6 Mains, Live Station', features: ['Service Staff', 'Premium China', 'Live Counter'], unit: 'per plate' }
    ],
    menuItems: [
        { id: 'mi1', name: 'Chicken Tikka', type: 'non-veg', price: 120 },
        { id: 'mi2', name: 'Paneer Butter Masala', type: 'veg', price: 100 },
        { id: 'mi3', name: 'Mango Lassi', type: 'beverage', price: 40 }
    ]
  },
  {
    id: 'v3',
    role: 'venue',
    name: 'The Grand Ballroom',
    companyName: 'Grand Estates',
    rating: 4.9,
    reviewCount: 210,
    location: 'Kochi, KL',
    priceRange: '₹₹₹₹',
    startingPrice: 5000,
    description: 'A luxurious ballroom with crystal chandeliers and capacity for 300 guests.',
    images: ['https://picsum.photos/800/600?random=5', 'https://picsum.photos/800/600?random=6'],
    tags: ['Indoor', 'Luxury', 'AC'],
    amenities: ['Parking', 'Bridal Suite', 'Stage', 'Sound System'],
    verified: true,
    capacity: 300,
    venueType: 'Hall',
    rooms: 4,
    parking: true,
    blockedDates: ['2023-11-15'],
    packages: [
        { id: 'ven1', name: 'Hall Rental (Day)', price: 5000, description: '8 AM to 4 PM access', features: ['Tables & Chairs', 'Cleaning'], unit: 'per day' },
        { id: 'ven2', name: 'Full Day Buyout', price: 8500, description: '8 AM to 12 AM access', features: ['All Amenities', 'Security'], unit: 'per day' }
    ]
  },
  {
    id: 'v4',
    role: 'makeup',
    name: 'Glamour by Sarah',
    companyName: 'Sarah Artistry',
    rating: 4.7,
    reviewCount: 56,
    location: 'Bangalore, KA',
    priceRange: '₹₹',
    startingPrice: 300,
    description: 'Professional bridal and party makeup artist using premium brands like MAC and Huda Beauty.',
    images: ['https://picsum.photos/800/600?random=7', 'https://picsum.photos/800/600?random=8'],
    tags: ['Bridal', 'HD Makeup', 'Airbrush'],
    verified: true,
    blockedDates: [],
    productsUsed: ['MAC', 'Huda Beauty', 'Kryolan'],
    packages: [
        { id: 'm1', name: 'Party Makeup', price: 150, description: 'Standard party makeup with lashes.', features: ['Lashes included', 'Hairstyle'], unit: 'per person' },
        { id: 'm2', name: 'Bridal HD', price: 500, description: 'High definition bridal makeup with trial.', features: ['Trial session', 'Draping', 'Premium Brands'], unit: 'per person' }
    ]
  },
  {
    id: 'v5',
    role: 'photographer',
    name: 'Urban Frames',
    companyName: 'Urban Frames',
    rating: 4.2,
    reviewCount: 30,
    location: 'Mumbai, MH',
    priceRange: '₹',
    startingPrice: 800,
    description: 'Affordable event photography for birthdays and corporate events.',
    images: ['https://picsum.photos/800/600?random=9'],
    tags: ['Birthday', 'Corporate'],
    verified: false,
    blockedDates: [],
    packages: [
        { id: 'p3', name: 'Hourly Rate', price: 100, description: 'Minimum 2 hours', features: ['Digital Delivery'], unit: 'per hour' }
    ]
  }
];

export let MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    clientId: 'c1',
    vendorId: 'v1',
    vendorName: 'Lens & Light Studios',
    vendorRole: 'photographer',
    clientName: 'Alice Johnson',
    date: '2023-11-15',
    time: '14:00',
    status: 'confirmed',
    paymentStatus: 'paid',
    amount: 1500,
    eventType: 'Wedding',
    packageName: 'Basic Coverage',
    createdAt: Date.now() - 10000000
  },
  {
    id: 'b2',
    clientId: 'c1',
    vendorId: 'v3',
    vendorName: 'The Grand Ballroom',
    vendorRole: 'venue',
    clientName: 'Alice Johnson',
    date: '2023-11-15',
    time: '09:00',
    status: 'confirmed',
    paymentStatus: 'paid',
    amount: 5000,
    eventType: 'Wedding',
    packageName: 'Hall Rental (Day)',
    createdAt: Date.now() - 10000000
  },
  {
    id: 'b3',
    clientId: 'c2', // Virtual user for demo
    vendorId: 'v1',
    vendorName: 'Lens & Light Studios',
    vendorRole: 'photographer',
    clientName: 'Bob Smith',
    date: '2023-12-01',
    time: '18:00',
    status: 'pending',
    paymentStatus: 'pending',
    amount: 2500,
    eventType: 'Corporate Gala',
    packageName: 'Premium Cinematic',
    createdAt: Date.now() - 5000000
  }
];

export let MOCK_PAYOUTS: Payout[] = [
    { id: 'py1', vendorId: 'v1', vendorName: 'Lens & Light Studios', amount: 120000, status: 'pending', date: '2023-11-20' },
    { id: 'py2', vendorId: 'v3', vendorName: 'The Grand Ballroom', amount: 450000, status: 'processed', date: '2023-11-10' },
    { id: 'py3', vendorId: 'v4', vendorName: 'Glamour by Sarah', amount: 25000, status: 'pending', date: '2023-11-25' }
];

export let MOCK_TICKETS: SupportTicket[] = [
    { id: 't1', userId: 'c1', userName: 'Alice Client', subject: 'Refund request for cancelled event', status: 'open', priority: 'high', date: '2023-11-22' },
    { id: 't2', userId: 'v2', userName: 'Gourmet Delights', subject: 'Update menu PDF issue', status: 'in_progress', priority: 'medium', date: '2023-11-21' },
    { id: 't3', userId: 'v5', userName: 'Urban Frames', subject: 'Verification status inquiry', status: 'resolved', priority: 'low', date: '2023-11-18' }
];

export let MOCK_QUOTATIONS: Quotation[] = [
    { id: 'q1', clientId: 'c1', vendorId: 'v2', vendorName: 'Gourmet Delights', status: 'replied', details: 'Need vegan menu for 200 guests.', createdAt: Date.now() - 86400000, response: 'We can do that for ₹500/plate.' }
];

// --- Auth Services ---

export const loginUser = (email: string, pass: string): User | undefined => {
    return MOCK_USERS.find(u => u.email === email && u.password === pass);
};

export const registerUser = (userData: Partial<User>, docs?: KYCDocuments): User => {
    const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: userData.name || 'New User',
        email: userData.email || '',
        password: userData.password || 'password',
        role: userData.role || 'client',
        verificationStatus: userData.role === 'client' ? 'verified' : 'pending', // Clients auto-verified
        phone: userData.phone,
        kycDocuments: docs,
        companyName: userData.companyName,
        language: userData.language || 'en',
        favorites: [],
        savedSearches: [],
        bio: 'New to EventHorizon!',
        city: 'Unknown',
        languagesKnown: ['English']
    };
    
    MOCK_USERS.push(newUser);
    sendNotification(newUser.id, 'Welcome!', `Welcome to EventHorizon, ${newUser.name}!`, 'success');
    
    // If it's a vendor, also create a placeholder profile
    if (newUser.role !== 'client' && newUser.role !== 'admin') {
        MOCK_VENDORS.push({
            id: newUser.id,
            role: newUser.role,
            name: newUser.name,
            companyName: newUser.companyName || newUser.name,
            rating: 0,
            reviewCount: 0,
            location: 'Location Pending',
            priceRange: '₹₹',
            startingPrice: 0,
            description: 'New vendor profile.',
            images: ['https://picsum.photos/800/600?grayscale'],
            tags: [],
            verified: false,
            blockedDates: [],
            packages: [],
            menuItems: []
        });
    }

    return newUser;
};

// --- Data Management Services ---

export const updateVerificationStatus = (userId: string, status: VerificationStatus, reason?: string) => {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
        user.verificationStatus = status;
        if (status === 'rejected') {
            user.rejectionReason = reason;
            sendNotification(userId, 'KYC Rejected', `Reason: ${reason}`, 'error');
        } else if (status === 'verified') {
            user.rejectionReason = undefined;
            sendNotification(userId, 'KYC Verified', 'Your account is now verified!', 'success');
        }
    }
    
    // Update Vendor Profile Sync
    const vendor = MOCK_VENDORS.find(v => v.id === userId);
    if (vendor) {
        vendor.verified = status === 'verified';
    }
};

export const addBooking = (booking: Omit<Booking, 'id' | 'status' | 'createdAt' | 'paymentStatus'>) => {
    const newBooking: Booking = {
        ...booking,
        id: Math.random().toString(36).substr(2, 9),
        status: 'pending', // Changed to pending to show notification flow
        paymentStatus: 'paid',
        createdAt: Date.now()
    };
    MOCK_BOOKINGS.push(newBooking);
    
    // Notify Vendor
    sendNotification(booking.vendorId, 'New Booking', `New booking request from ${booking.clientName}`, 'info');
    
    return newBooking;
};

export const updateBooking = (bookingId: string, updates: Partial<Booking>) => {
    const booking = MOCK_BOOKINGS.find(b => b.id === bookingId);
    if (booking) {
        Object.assign(booking, updates);
    }
}

export const updateBookingStatus = (bookingId: string, status: Booking['status']) => {
    const booking = MOCK_BOOKINGS.find(b => b.id === bookingId);
    if (booking) {
        booking.status = status;
        
        // Notify Client
        if (status === 'confirmed') {
            sendNotification(booking.clientId, 'Booking Confirmed', `Your booking with ${booking.vendorName} is confirmed!`, 'success');
        } else if (status === 'rejected') {
            sendNotification(booking.clientId, 'Booking Rejected', `Your booking with ${booking.vendorName} was rejected.`, 'error');
        } else if (status === 'cancelled') {
            sendNotification(booking.clientId, 'Booking Cancelled', `Booking with ${booking.vendorName} was cancelled.`, 'warning');
            sendNotification(booking.vendorId, 'Booking Cancelled', `Booking with ${booking.clientName} was cancelled.`, 'warning');
        }
    }
};

export const addVendorPackage = (vendorId: string, pkg: Omit<Package, 'id'>) => {
    const vendor = MOCK_VENDORS.find(v => v.id === vendorId);
    if (vendor) {
        vendor.packages.push({ ...pkg, id: Math.random().toString(36).substr(2, 9) });
    }
};

export const addVendorMenuItem = (vendorId: string, item: Omit<MenuItem, 'id'>) => {
    const vendor = MOCK_VENDORS.find(v => v.id === vendorId);
    if (vendor) {
        if(!vendor.menuItems) vendor.menuItems = [];
        vendor.menuItems.push({ ...item, id: Math.random().toString(36).substr(2, 9) });
    }
};

export const toggleVendorAmenity = (vendorId: string, amenity: string) => {
    const vendor = MOCK_VENDORS.find(v => v.id === vendorId);
    if (vendor) {
        if(!vendor.amenities) vendor.amenities = [];
        if(vendor.amenities.includes(amenity)) {
            vendor.amenities = vendor.amenities.filter(a => a !== amenity);
        } else {
            vendor.amenities.push(amenity);
        }
    }
}

export const toggleBlockedDate = (vendorId: string, date: string) => {
    const vendor = MOCK_VENDORS.find(v => v.id === vendorId);
    if (vendor) {
        if (vendor.blockedDates.includes(date)) {
            vendor.blockedDates = vendor.blockedDates.filter(d => d !== date);
        } else {
            vendor.blockedDates.push(date);
        }
    }
};

export const addVendorImage = (vendorId: string, imageUrl: string) => {
     const vendor = MOCK_VENDORS.find(v => v.id === vendorId);
     if(vendor) {
         vendor.images.push(imageUrl);
     }
};

export const removeVendorImage = (vendorId: string, index: number) => {
    const vendor = MOCK_VENDORS.find(v => v.id === vendorId);
    if(vendor) {
        vendor.images.splice(index, 1);
    }
};

export const addChatMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    MOCK_CHATS.push({
        ...msg,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now()
    });
    
    // Notify Receiver
    const sender = MOCK_USERS.find(u => u.id === msg.senderId);
    sendNotification(msg.receiverId, 'New Message', `New message from ${sender?.name || 'User'}`, 'info');
};

export const toggleFavorite = (userId: string, vendorId: string) => {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
        if (!user.favorites) user.favorites = [];
        if (user.favorites.includes(vendorId)) {
            user.favorites = user.favorites.filter(id => id !== vendorId);
        } else {
            user.favorites.push(vendorId);
            sendNotification(userId, 'Added to Favorites', 'Vendor saved to your list.', 'success');
        }
    }
}

export const saveSearch = (userId: string, name: string, criteria: any) => {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
        if (!user.savedSearches) user.savedSearches = [];
        user.savedSearches.push({ id: Date.now().toString(), name, criteria });
    }
}

export const addQuotation = (quotation: Omit<Quotation, 'id' | 'createdAt' | 'status'>) => {
    MOCK_QUOTATIONS.push({
        ...quotation,
        id: Math.random().toString(36).substr(2, 9),
        status: 'pending',
        createdAt: Date.now()
    });
    sendNotification(quotation.vendorId, 'New Quotation Request', 'A client requested a quote.', 'info');
}

export const addGuest = (clientId: string, name: string, count: number) => {
    MOCK_GUESTS.push({
        id: Math.random().toString(36).substr(2, 9),
        clientId,
        name,
        count,
        status: 'invited'
    });
}

export const updateGuestStatus = (guestId: string, status: Guest['status']) => {
    const guest = MOCK_GUESTS.find(g => g.id === guestId);
    if(guest) guest.status = status;
}

export const deleteGuest = (guestId: string) => {
    const idx = MOCK_GUESTS.findIndex(g => g.id === guestId);
    if(idx > -1) MOCK_GUESTS.splice(idx, 1);
}

// Check if a specific date/time is available for a vendor
export const checkAvailability = (vendorId: string, date: string, time: string): boolean => {
    // Check blocked dates
    const vendor = MOCK_VENDORS.find(v => v.id === vendorId);
    if (vendor && vendor.blockedDates.includes(date)) return false;

    // Check existing bookings. Simple conflict logic: same date & time (+/- 2 hours buffer simulated)
    // For this mock, we just check exact match on time or if the date matches and time is unspecified
    const conflict = MOCK_BOOKINGS.find(b => {
        if (b.vendorId !== vendorId || b.status === 'cancelled' || b.status === 'rejected') return false;
        if (b.date === date) {
            // Simple exact time match for demo
            if (b.time === time) return true;
        }
        return false;
    });

    return !conflict;
}

// --- Admin Actions ---

export const toggleUserBlock = (userId: string) => {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
        user.isBlocked = !user.isBlocked;
        if (user.isBlocked) {
             sendNotification(userId, 'Account Blocked', 'Your account has been blocked by admin.', 'error');
        } else {
             sendNotification(userId, 'Account Unblocked', 'Your account access has been restored.', 'success');
        }
    }
};

export const processPayout = (payoutId: string) => {
    const payout = MOCK_PAYOUTS.find(p => p.id === payoutId);
    if (payout) {
        payout.status = 'processed';
        sendNotification(payout.vendorId, 'Payout Processed', `Payout of ₹${payout.amount} has been processed.`, 'success');
    }
};

export const resolveTicket = (ticketId: string) => {
    const ticket = MOCK_TICKETS.find(t => t.id === ticketId);
    if (ticket) {
        ticket.status = 'resolved';
        sendNotification(ticket.userId, 'Support Ticket Resolved', `Ticket "${ticket.subject}" has been resolved.`, 'success');
    }
};
