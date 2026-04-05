export interface Address {
  $id: string;
  userId: string;
  label: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface AddressInput {
  userId: string;
  label?: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  isDefault?: boolean;
}

const API_BASE = import.meta.env.VITE_API_BASE || '';

export async function getAddresses(userId: string): Promise<Address[]> {
  try {
    const response = await fetch(`${API_BASE}/api/addresses?userId=${encodeURIComponent(userId)}`);
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

export async function createAddress(data: AddressInput): Promise<Address | null> {
  try {
    const response = await fetch(`${API_BASE}/api/addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function updateAddress(addressId: string, userId: string, data: Partial<AddressInput>): Promise<Address | null> {
  try {
    const response = await fetch(`${API_BASE}/api/addresses`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addressId, userId, ...data }),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function deleteAddress(addressId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/addresses?addressId=${encodeURIComponent(addressId)}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch {
    return false;
  }
}
