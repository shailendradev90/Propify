import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, isDemoMode } from './firebase';
import { mockStore } from './mockStore';
import { getAppUser } from './auth';
import { createNotification } from './notifications';
import { Inquiry, ListingType, Property, PropertyStatus, PropertyType } from '../types';

const COL = 'properties';

const removeUndefinedValues = <T extends object>(obj: T) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  ) as Partial<T>;

export const createProperty = async (
  data: Omit<Property, 'id' | 'createdAt' | 'status'>,
) => {
  if (isDemoMode) return mockStore.createProperty(data);
  const payload = removeUndefinedValues({
    ...data,
    status: 'available' as PropertyStatus,
    createdAt: Date.now(),
  });
  const ref = await addDoc(collection(db, COL), payload);
  return ref.id;
};

// Get properties the user has contacted (shown interest in)
export const getContactedProperties = (userId: string, onChange: (items: Property[]) => void) => {
  if (isDemoMode) return mockStore.getContactedProperties(userId, onChange);

  const q = query(collection(db, 'inquiries'), where('userId', '==', userId));
  return onSnapshot(q, async snap => {
    const propertyIds = snap.docs.map(d => (d.data() as any).propertyId);
    if (propertyIds.length === 0) {
      onChange([]);
      return;
    }

    const propertySnaps = await Promise.all(propertyIds.map((id: string) => getDoc(doc(db, COL, id))));
    const properties: Property[] = propertySnaps
      .filter(s => s.exists())
      .map(s => ({ id: s.id, ...(s.data() as Omit<Property, 'id'>) }));
    properties.sort((a, b) => b.createdAt - a.createdAt);
    onChange(properties);
  });
};

// Remove a property from user's contacted list (delete inquiry)
export const removeContactedProperty = async (userId: string, propertyId: string) => {
  if (isDemoMode) return mockStore.removeContactedProperty(userId, propertyId);

  const q = query(collection(db, 'inquiries'), where('userId', '==', userId), where('propertyId', '==', propertyId));
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
};

// Subscribes to available properties (auto-excludes sold/rented).
export const subscribeAvailable = (
  listingType: ListingType | 'all',
  onChange: (items: Property[]) => void,
  propertyType?: PropertyType,
) => {
  if (isDemoMode) return mockStore.subscribeAvailable(listingType, onChange, propertyType);
  const base = collection(db, COL);
  const constraints = [where('status', '==', 'available')] as any[];
  if (listingType !== 'all') {
    constraints.push(where('listingType', '==', listingType));
  }
  if (propertyType) {
    constraints.push(where('propertyType', '==', propertyType));
  }
  const q = query(base, ...constraints);
  return onSnapshot(q, snap => {
    const items: Property[] = snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Omit<Property, 'id'>),
    }));
    items.sort((a, b) => b.createdAt - a.createdAt);
    onChange(items);
  });
};

export const subscribeDealerProperties = (
  ownerId: string,
  onChange: (items: Property[]) => void,
) => {
  if (isDemoMode) return mockStore.subscribeDealerProperties(ownerId, onChange);
  const q = query(collection(db, COL), where('ownerId', '==', ownerId));
  return onSnapshot(q, snap => {
    const items: Property[] = snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Omit<Property, 'id'>),
    }));
    items.sort((a, b) => b.createdAt - a.createdAt);
    onChange(items);
  });
};

// When marking sold or rented, we delete so users no longer see it.
export const markAsSoldOrRented = async (id: string) => {
  if (isDemoMode) return mockStore.deleteProperty(id);
  await deleteDoc(doc(db, COL, id));
};

export const updateProperty = async (id: string, patch: Partial<Property>) => {
  if (isDemoMode) return mockStore.updateProperty(id, patch);
  await updateDoc(doc(db, COL, id), patch as any);
};

export const deleteProperty = async (id: string) => {
  if (isDemoMode) return mockStore.deleteProperty(id);
  await deleteDoc(doc(db, COL, id));
};

export const createInquiry = async (
  data: Omit<Inquiry, 'id' | 'createdAt'>,
) => {
  if (isDemoMode) return mockStore.createInquiry(data);

  let userPhone = data.userPhone;
  if (!userPhone) {
    const appUser = await getAppUser(data.userId);
    userPhone = appUser?.phone;
  }

  let dealerId = data.dealerId;
  if (!dealerId) {
    const propertySnap = await getDoc(doc(db, COL, data.propertyId));
    if (propertySnap.exists()) {
      dealerId = (propertySnap.data() as Property).ownerId;
    }
  }

  const existingQ = query(collection(db, 'inquiries'), where('propertyId', '==', data.propertyId));
  const existingSnap = await getDocs(existingQ);
  const duplicate = existingSnap.docs.some(
    d => (d.data() as Omit<Inquiry, 'id'>).userId === data.userId,
  );
  if (duplicate) {
    throw new Error('You have already shown interest in this property.');
  }

  const payload = removeUndefinedValues({
    ...data,
    userPhone,
    dealerId,
    createdAt: Date.now(),
  });
  const ref = await addDoc(collection(db, 'inquiries'), payload);

  // Send notification to dealer
  if (dealerId) {
    try {
      await createNotification({
        userId: dealerId,
        title: 'New Interest in Your Property',
        message: `${data.userName} has shown interest in "${data.propertyTitle}"`,
        type: 'inquiry',
        relatedId: data.propertyId,
      });
    } catch (error) {
      console.error('Failed to create notification:', error);
      // Don't fail the inquiry if notification fails
    }
  }

  return ref.id;
};

const enrichInquiryContacts = async (items: Inquiry[]) => {
  const missingUserIds = Array.from(
    new Set(items.filter(i => !i.userPhone).map(i => i.userId)),
  );
  if (missingUserIds.length === 0) return items;

  const users = await Promise.all(missingUserIds.map(async uid => ({ uid, appUser: await getAppUser(uid) })));
  const userMap = new Map(users.map(entry => [entry.uid, entry.appUser]));

  return items.map(i => {
    const appUser = userMap.get(i.userId);
    if (!appUser) return i;
    return {
      ...i,
      userPhone: i.userPhone || appUser.phone,
      userName: i.userName || appUser.fullName,
      userEmail: i.userEmail || appUser.email,
    };
  });
};

export const subscribeDealerInquiries = (
  dealerId: string,
  onChange: (items: Inquiry[]) => void,
) => {
  if (isDemoMode) return mockStore.subscribeDealerInquiries(dealerId, onChange);

  const inquiriesByDealerQ = query(collection(db, 'inquiries'), where('dealerId', '==', dealerId));
  const propertiesByDealerQ = query(collection(db, COL), where('ownerId', '==', dealerId));

  let directDealerInquiries: Inquiry[] = [];
  let ownerPropertyIds = new Set<string>();
  let allInquiries: Inquiry[] = [];
  let emitVersion = 0;

  const emit = async () => {
    const currentVersion = ++emitVersion;
    const merged = [
      ...directDealerInquiries,
      ...allInquiries.filter(i => !i.dealerId && ownerPropertyIds.has(i.propertyId)),
    ];

    const deduped = Array.from(new Map(merged.map(i => [i.id, i])).values());
    deduped.sort((a, b) => b.createdAt - a.createdAt);
    const enriched = await enrichInquiryContacts(deduped);
    if (currentVersion !== emitVersion) return;
    onChange(enriched);
  };

  const unsubDirect = onSnapshot(inquiriesByDealerQ, snap => {
    directDealerInquiries = snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Omit<Inquiry, 'id'>),
    }));
    void emit();
  });

  const unsubProps = onSnapshot(propertiesByDealerQ, snap => {
    ownerPropertyIds = new Set(snap.docs.map(d => d.id));
    void emit();
  });

  const unsubAll = onSnapshot(collection(db, 'inquiries'), snap => {
    allInquiries = snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Omit<Inquiry, 'id'>),
    }));
    void emit();
  });

  return () => {
    unsubDirect();
    unsubProps();
    unsubAll();
  };
};
