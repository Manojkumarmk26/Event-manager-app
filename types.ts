
export type UserRole = 'client' | 'photographer' | 'caterer' | 'venue' | 'makeup' | 'admin';

export type VerificationStatus = 'verified' | 'pending' | 'rejected';

export type Language = 'en' | 'ta' | 'te' | 'ml' | 'kn';

export interface KYCDocuments {
  idProof?: string; // Aadhar/PAN
  portfolio?: string; // URL or file ref
  businessLicense?: string; // Caterer
  ownershipProof?: string; // Venue
  certification?: string; // Makeup
  menuFile?: string; // Caterer
  venuePhotos?: string[]; // Venue
}

export interface SavedSearch {
    id: string;
    name: string;
    criteria: {
        term: string;
        category: string;
        price: string;
    };
}

export interface Guest {
    id: string;
    clientId: string;
    name: string;
    status: 'invited' | 'confirmed' | 'declined';
    count: number; // +1s
}

export interface MenuItem {
    id: string;
    name: string;
    type: 'veg' | 'non-veg' | 'beverage';
    price: number;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: number;
  link?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  verificationStatus: VerificationStatus;
  kycDocuments?: KYCDocuments;
  rejectionReason?: string;
  companyName?: string;
  password?: string; // For mock auth only
  language: Language;
  isBlocked?: boolean;
  favorites?: string[]; // Array of Vendor IDs
  savedSearches?: SavedSearch[];
  // Profile Fields
  bio?: string;
  city?: string;
  languagesKnown?: string[];
}

export interface VendorProfile {
  id: string; // Should match User ID for mapped vendors
  role: UserRole;
  name: string;
  companyName?: string;
  rating: number;
  reviewCount: number;
  location: string;
  priceRange: string; // e.g., "$$", "$$$"
  startingPrice: number;
  description: string;
  images: string[];
  tags: string[]; // e.g., "Wedding", "Birthday", "Non-Veg"
  amenities?: string[]; // For Venues
  verified: boolean;
  capacity?: number; // For Venues/Caterers
  blockedDates: string[]; // ISO Date strings 'YYYY-MM-DD'
  packages: Package[];
  menuItems?: MenuItem[]; // For Caterers
  productsUsed?: string[]; // For Makeup Artists
  venueType?: string; // For Venues
  rooms?: number; // For Venues
  parking?: boolean; // For Venues
}

export interface Booking {
  id: string;
  clientId: string;
  vendorId: string;
  vendorName: string;
  vendorRole: UserRole;
  clientName: string;
  date: string;
  time: string; // HH:MM 24h format
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  paymentStatus?: 'paid' | 'pending' | 'refunded';
  amount: number;
  eventType: string;
  packageId?: string;
  packageName?: string;
  notes?: string;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  originalLanguage: Language;
  timestamp: number;
  isImage?: boolean;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  unit?: string; // e.g., 'per plate', 'per hour', 'per event'
}

export interface Payout {
    id: string;
    vendorId: string;
    vendorName: string;
    amount: number;
    status: 'pending' | 'processed';
    date: string;
}

export interface SupportTicket {
    id: string;
    userId: string;
    userName: string;
    subject: string;
    status: 'open' | 'resolved' | 'in_progress';
    priority: 'low' | 'medium' | 'high';
    date: string;
}

export interface Quotation {
    id: string;
    clientId: string;
    vendorId: string;
    vendorName: string;
    status: 'pending' | 'replied' | 'accepted' | 'rejected';
    details: string;
    createdAt: number;
    response?: string;
    estimatedAmount?: number;
}

// Helper type for Calendar
export interface CalendarEvent {
    id: string;
    title: string;
    date: string;
    time: string;
    type: 'booking' | 'blocked' | 'personal' | 'quotation';
    status?: string;
    details?: any;
}
