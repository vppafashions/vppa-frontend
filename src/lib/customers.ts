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

const API_BASE = import.meta.env.VITE_API_BASE || '';

export async function getCustomerByUserId(userId: string): Promise<CustomerData | null> {
  try {
    const response = await fetch(`${API_BASE}/api/customers?userId=${encodeURIComponent(userId)}`);
    if (!response.ok) return null;
    const doc = await response.json();
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
  } catch {
    return null;
  }
}

export async function saveCustomer(data: CustomerData): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.ok;
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
