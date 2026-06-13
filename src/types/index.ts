export type UserRole = 'user' | 'dealer';

export type ListingType = 'buy' | 'rent' | 'pg/hostel';

export type PropertyStatus = 'available' | 'sold/rented' | 'inactive';

export type PropertyType = 'all' | 'apartment' | 'builder-floor' | 'villa' | 'plot' | 'commercial';

export type InquiryStatus = 'new' | 'in-progress' | 'closed';

export type SubscriptionPlan = 'basic' | 'standard' | 'premium';

export interface AppUser {
  uid: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  createdAt: number;
  subscriptionPlan?: SubscriptionPlan;
  subscriptionExpiry?: number;
  // Dealer-specific fields
  businessName?: string;
  reraNumber?: string;
  businessAddress?: string;
  businessCity?: string;
  businessPhone?: string;
  businessWebsite?: string;
  profilePhoto?: string;
}

export interface Property {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerPhone?: string;
  title: string;
  description: string;
  listingType: ListingType;
  propertyType: PropertyType;
  price: number;
  pricePerMonth?: number;
  bedrooms: number;
  bathrooms: number;
  balcony?: number;
  areaSqft: number;
  city: string;
  sector?: string;
  pincode: string;
  address: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  images: string[];
  videos?: string[];
  status: PropertyStatus;
  amenities?: string[];
  nearbyPlaces?: string[];
  createdAt: number;
  updatedAt?: number;
  featured?: boolean;
}

export interface Inquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage?: string;
  dealerId: string;
  userId: string;
  userName: string;
  userPhone?: string;
  userEmail: string;
  message: string;
  status: InquiryStatus;
  createdAt: number;
  updatedAt?: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'inquiry' | 'booking' | 'approval' | 'general';
  read: boolean;
  createdAt: number;
  relatedId?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  propertyId?: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export interface Subscription {
  plan: SubscriptionPlan;
  price: number;
  duration: string;
  features: string[];
  activeListings: number;
  prioritySupport: boolean;
  featuredListing: boolean;
  unlimitedListings: boolean;
}

export interface FilterOptions {
  propertyType: PropertyType;
  priceRange: { min: number; max: number };
  bedrooms: number | 'any';
  listingType?: ListingType;
  city?: string;
}
