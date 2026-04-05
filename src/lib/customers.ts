import { ID, Query, Permission, Role } from 'appwrite';
import { databases, DATABASE_ID, CUSTOMERS_COLLECTION_ID } from './appwrite';

export interface CustomerData {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingPincode: string;
  billingCountry: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  shippingCountry: string;
  gstin?: string;
  companyName?: string;
  landmark?: string;
  alternatePhone?: string;
  sameAsShipping: boolean;
}

export async function getCustomerByUserId(userId: string): Promise<CustomerData | null> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      CUSTOMERS_COLLECTION_ID,
      [Query.equal('userId', userId), Query.limit(1)]
    );
    if (response.documents.length > 0) {
      const doc = response.documents[0];
      return {
        userId: doc.userId,
        firstName: doc.firstName,
        lastName: doc.lastName,
        email: doc.email,
        phone: doc.phone,
        billingAddress: doc.billingAddress || '',
        billingCity: doc.billingCity || '',
        billingState: doc.billingState || '',
        billingPincode: doc.billingPincode || '',
        billingCountry: doc.billingCountry || 'India',
        shippingAddress: doc.shippingAddress || '',
        shippingCity: doc.shippingCity || '',
        shippingState: doc.shippingState || '',
        shippingPincode: doc.shippingPincode || '',
        shippingCountry: doc.shippingCountry || 'India',
        gstin: doc.gstin || '',
        companyName: doc.companyName || '',
        landmark: doc.landmark || '',
        alternatePhone: doc.alternatePhone || '',
        sameAsShipping: doc.sameAsShipping ?? true,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveCustomer(data: CustomerData): Promise<boolean> {
  try {
    const existing = await databases.listDocuments(
      DATABASE_ID,
      CUSTOMERS_COLLECTION_ID,
      [Query.equal('userId', data.userId), Query.limit(1)]
    );

    const payload: Record<string, unknown> = { ...data };
    // Remove empty optional fields
    if (!payload.gstin) delete payload.gstin;
    if (!payload.companyName) delete payload.companyName;
    if (!payload.landmark) delete payload.landmark;
    if (!payload.alternatePhone) delete payload.alternatePhone;

    if (existing.documents.length > 0) {
      const docId = existing.documents[0].$id;
      delete payload.userId; // can't update userId
      await databases.updateDocument(
        DATABASE_ID,
        CUSTOMERS_COLLECTION_ID,
        docId,
        payload
      );
    } else {
      await databases.createDocument(
        DATABASE_ID,
        CUSTOMERS_COLLECTION_ID,
        ID.unique(),
        payload,
        [
          Permission.read(Role.user(data.userId)),
          Permission.update(Role.user(data.userId)),
          Permission.delete(Role.user(data.userId)),
        ]
      );
    }
    return true;
  } catch (error) {
    console.error('Failed to save customer:', error);
    return false;
  }
}

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];
