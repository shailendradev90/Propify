// In-memory store used when Firebase is not configured (demo mode).

import { Inquiry, ListingType, Property, PropertyStatus, PropertyType } from '../types';

type Unsubscribe = () => void;

let idCounter = 1;
const nextId = () => `demo-${idCounter++}`;

const seed = (): Property[] => [
  {
    id: nextId(),
    ownerId: 'demo-owner',
    ownerName: 'Demo Owner',
    ownerPhone: '+91 99999 99999',
    title: 'Modern 2BHK Apartment',
    description: 'Spacious apartment with parking and balcony.',
    listingType: 'buy',
    propertyType: 'apartment',
    price: 8500000,
    bedrooms: 2,
    bathrooms: 2,
    areaSqft: 1200,
    city: 'Pune',
    sector: 'Baner',
    pincode: '411045',
    address: 'Baner Road, near Balewadi',
    images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200'],
    status: 'available',
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: nextId(),
    ownerId: 'demo-dealer',
    ownerName: 'Demo Dealer',
    ownerPhone: '+91 90000 00000',
    title: 'Sea-view 3BHK Villa',
    description: 'Luxury villa with private garden and pool access.',
    listingType: 'buy',
    propertyType: 'villa',
    price: 24500000,
    bedrooms: 3,
    bathrooms: 3,
    areaSqft: 2100,
    city: 'Goa',
    sector: 'Candolim',
    pincode: '403515',
    address: 'Beach Road, Candolim',
    images: ['https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200'],
    status: 'available',
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
  },
];

let properties: Property[] = seed();
let inquiries: Inquiry[] = [];

const propertySubscribers = new Set<() => void>();
const inquirySubscribers = new Set<() => void>();

const notifyProperties = () => propertySubscribers.forEach(cb => cb());
const notifyInquiries = () => inquirySubscribers.forEach(cb => cb());

const subscribe = (bucket: Set<() => void>, callback: () => void): Unsubscribe => {
  bucket.add(callback);
  callback();
  return () => bucket.delete(callback);
};

const sortByCreatedAt = <T extends { createdAt: number }>(items: T[]) =>
  [...items].sort((a, b) => b.createdAt - a.createdAt);

export const mockStore = {
  createProperty: async (data: Omit<Property, 'id' | 'createdAt' | 'status'>) => {
    const created: Property = {
      ...data,
      id: nextId(),
      status: 'available' as PropertyStatus,
      createdAt: Date.now(),
    };
    properties = [created, ...properties];
    notifyProperties();
    return created.id;
  },

  subscribeAvailable: (
    listingType: ListingType | 'all',
    onChange: (items: Property[]) => void,
    propertyType?: PropertyType,
  ) =>
    subscribe(propertySubscribers, () => {
      const filtered = properties.filter(item => {
        const listingMatches = listingType === 'all' || item.listingType === listingType;
        const propertyMatches = !propertyType || propertyType === 'all' || item.propertyType === propertyType;
        return item.status === 'available' && listingMatches && propertyMatches;
      });
      onChange(sortByCreatedAt(filtered));
    }),

  subscribeDealerProperties: (ownerId: string, onChange: (items: Property[]) => void) =>
    subscribe(propertySubscribers, () => {
      const owned = properties.filter(item => item.ownerId === ownerId);
      onChange(sortByCreatedAt(owned));
    }),

  updateProperty: async (id: string, patch: Partial<Property>) => {
    properties = properties.map(item => (item.id === id ? { ...item, ...patch } : item));
    notifyProperties();
  },

  deleteProperty: async (id: string) => {
    properties = properties.filter(item => item.id !== id);
    inquiries = inquiries.filter(item => item.propertyId !== id);
    notifyProperties();
    notifyInquiries();
  },

  createInquiry: async (data: Omit<Inquiry, 'id' | 'createdAt'>) => {
    const duplicate = inquiries.some(
      item => item.propertyId === data.propertyId && item.userId === data.userId,
    );
    if (duplicate) {
      throw new Error('You have already shown interest in this property.');
    }
    const created: Inquiry = {
      ...data,
      id: nextId(),
      createdAt: Date.now(),
    };
    inquiries = [created, ...inquiries];
    notifyInquiries();
    return created.id;
  },

  subscribeDealerInquiries: (dealerId: string, onChange: (items: Inquiry[]) => void) =>
    subscribe(inquirySubscribers, () => {
      const ownedPropertyIds = new Set(
        properties.filter(p => p.ownerId === dealerId).map(p => p.id),
      );
      const filtered = inquiries.filter(
        item => item.dealerId === dealerId || (!item.dealerId && ownedPropertyIds.has(item.propertyId)),
      );
      onChange(sortByCreatedAt(filtered));
    }),

  getContactedProperties: (userId: string, onChange: (items: Property[]) => void) =>
    subscribe(inquirySubscribers, () => {
      const propertyIds = new Set(
        inquiries.filter(item => item.userId === userId).map(item => item.propertyId),
      );
      const filtered = properties.filter(item => propertyIds.has(item.id));
      onChange(sortByCreatedAt(filtered));
    }),

  removeContactedProperty: async (userId: string, propertyId: string) => {
    inquiries = inquiries.filter(
      item => !(item.userId === userId && item.propertyId === propertyId),
    );
    notifyInquiries();
  },
};