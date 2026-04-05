import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { getCustomerByUserId, saveCustomer, INDIAN_STATES, type CustomerData } from '../lib/customers';
import { getAddresses, createAddress, updateAddress, deleteAddress, type Address } from '../lib/addresses';

const ADDRESS_LABELS = ['Home', 'Work', 'Office', 'Other'];

const emptyAddressForm = {
  label: 'Home',
  firstName: '',
  lastName: '',
  phone: '',
  address: '',
  landmark: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
  isDefault: false,
};

export function AccountPage() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    alternatePhone: '',
    companyName: '',
    gstin: '',
  });
  const [addressForm, setAddressForm] = useState(emptyAddressForm);

  const loadAddresses = async () => {
    if (!user) return;
    const list = await getAddresses(user.$id);
    setAddresses(list);
  };

  useEffect(() => {
    if (!user) return;
    getCustomerByUserId(user.$id).then((data) => {
      if (data) {
        setCustomer(data);
        setProfileForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          alternatePhone: data.alternatePhone || '',
          companyName: data.companyName || '',
          gstin: data.gstin || '',
        });
      }
    });
    loadAddresses();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const success = await saveCustomer({
      userId: user.$id,
      firstName: profileForm.firstName,
      lastName: profileForm.lastName,
      email: user.email,
      phone: profileForm.phone,
      alternatePhone: profileForm.alternatePhone,
      companyName: profileForm.companyName,
      gstin: profileForm.gstin,
      shippingAddress: customer?.shippingAddress || '',
      shippingCity: customer?.shippingCity || '',
      shippingState: customer?.shippingState || '',
      shippingPincode: customer?.shippingPincode || '',
      shippingCountry: customer?.shippingCountry || 'India',
      billingAddress: customer?.billingAddress || '',
      billingCity: customer?.billingCity || '',
      billingState: customer?.billingState || '',
      billingPincode: customer?.billingPincode || '',
      billingCountry: customer?.billingCountry || 'India',
      sameAsShipping: customer?.sameAsShipping ?? true,
    });
    if (success) {
      const updated = await getCustomerByUserId(user.$id);
      setCustomer(updated);
      setIsEditingProfile(false);
    }
    setSaving(false);
  };

  const handleSaveAddress = async () => {
    if (!user) return;
    setSaving(true);
    if (editingAddressId) {
      await updateAddress(editingAddressId, user.$id, {
        label: addressForm.label,
        firstName: addressForm.firstName,
        lastName: addressForm.lastName,
        phone: addressForm.phone,
        address: addressForm.address,
        landmark: addressForm.landmark,
        city: addressForm.city,
        state: addressForm.state,
        pincode: addressForm.pincode,
        country: addressForm.country,
        isDefault: addressForm.isDefault,
      });
    } else {
      await createAddress({
        userId: user.$id,
        label: addressForm.label,
        firstName: addressForm.firstName,
        lastName: addressForm.lastName,
        phone: addressForm.phone,
        address: addressForm.address,
        landmark: addressForm.landmark,
        city: addressForm.city,
        state: addressForm.state,
        pincode: addressForm.pincode,
        country: addressForm.country,
        isDefault: addressForm.isDefault,
      });
    }
    await loadAddresses();
    setShowAddressForm(false);
    setEditingAddressId(null);
    setAddressForm(emptyAddressForm);
    setSaving(false);
  };

  const handleEditAddress = (addr: Address) => {
    setEditingAddressId(addr.$id);
    setAddressForm({
      label: addr.label || 'Home',
      firstName: addr.firstName,
      lastName: addr.lastName,
      phone: addr.phone,
      address: addr.address,
      landmark: addr.landmark || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      country: addr.country || 'India',
      isDefault: addr.isDefault,
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    setDeletingId(addressId);
    await deleteAddress(addressId);
    await loadAddresses();
    setDeletingId(null);
  };

  const handleSetDefault = async (addr: Address) => {
    if (!user) return;
    await updateAddress(addr.$id, user.$id, { isDefault: true });
    await loadAddresses();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-background pt-28 pb-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="font-magazine text-4xl tracking-tight mb-8">My Account</h1>

        {/* Profile Card */}
        <div className="border border-border/30 rounded-2xl p-8 bg-card/50 backdrop-blur-sm mb-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-medium">
              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-medium">{user.name || 'User'}</h2>
              <p className="text-muted-foreground text-sm">{user.email}</p>
            </div>
          </div>

          {!isEditingProfile ? (
            <>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between py-3 border-b border-border/20">
                  <span className="text-muted-foreground text-sm">Email</span>
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border/20">
                  <span className="text-muted-foreground text-sm">Name</span>
                  <span className="text-sm">{customer ? `${customer.firstName} ${customer.lastName}` : (user.name || '—')}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border/20">
                  <span className="text-muted-foreground text-sm">Member since</span>
                  <span className="text-sm">{new Date(user.$createdAt).toLocaleDateString()}</span>
                </div>
                {customer?.phone && (
                  <div className="flex justify-between py-3 border-b border-border/20">
                    <span className="text-muted-foreground text-sm">Phone</span>
                    <span className="text-sm">{customer.phone}</span>
                  </div>
                )}
                {customer?.gstin && (
                  <div className="flex justify-between py-3 border-b border-border/20">
                    <span className="text-muted-foreground text-sm">GSTIN</span>
                    <span className="text-sm">{customer.gstin}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsEditingProfile(true)}
                className="w-full py-3 px-6 border border-border/30 rounded-full text-sm uppercase tracking-widest hover:bg-foreground hover:text-background transition-all duration-300 mb-3"
              >
                Edit Profile
              </button>
            </>
          ) : (
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <Input type="text" placeholder="First Name" value={profileForm.firstName} onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })} />
                <Input type="text" placeholder="Last Name" value={profileForm.lastName} onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input type="tel" placeholder="Phone Number" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
                <Input type="tel" placeholder="Alternate Phone (optional)" value={profileForm.alternatePhone} onChange={(e) => setProfileForm({ ...profileForm, alternatePhone: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input type="text" placeholder="Company Name (optional)" value={profileForm.companyName} onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })} />
                <Input type="text" placeholder="GSTIN (optional)" value={profileForm.gstin} onChange={(e) => setProfileForm({ ...profileForm, gstin: e.target.value })} />
              </div>
              <div className="flex gap-4 pt-2">
                <Button variant="primary" className="flex-1" onClick={handleSaveProfile} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
                <button onClick={() => setIsEditingProfile(false)} className="px-6 py-3 border border-border/30 text-sm uppercase tracking-widest hover:bg-foreground hover:text-background transition-all duration-300">
                  Cancel
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => navigate('/orders')}
            className="w-full py-3 px-6 border border-border/30 rounded-full text-sm uppercase tracking-widest hover:bg-foreground hover:text-background transition-all duration-300 mb-3"
          >
            My Orders
          </button>

          <button
            onClick={() => navigate('/wishlist')}
            className="w-full py-3 px-6 border border-border/30 rounded-full text-sm uppercase tracking-widest hover:bg-foreground hover:text-background transition-all duration-300 mb-3"
          >
            My Wishlist
          </button>

          <button
            onClick={async () => { await logout(); navigate('/'); }}
            className="w-full py-3 px-6 border border-border/30 rounded-full text-sm uppercase tracking-widest hover:bg-foreground hover:text-background transition-all duration-300"
          >
            Sign Out
          </button>
        </div>

        {/* Saved Addresses Section */}
        <div className="border border-border/30 rounded-2xl p-8 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold uppercase tracking-widest">
              Saved Addresses
            </h2>
            {!showAddressForm && (
              <button
                onClick={() => {
                  setEditingAddressId(null);
                  setAddressForm(emptyAddressForm);
                  setShowAddressForm(true);
                }}
                className="text-sm underline underline-offset-4 hover:text-foreground/70 transition-colors"
              >
                + Add New
              </button>
            )}
          </div>

          {/* Address List */}
          {!showAddressForm && addresses.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-8">
              No saved addresses yet. Add one to speed up your checkout.
            </p>
          )}

          {!showAddressForm && addresses.map((addr) => (
            <div
              key={addr.$id}
              className={`border rounded-xl p-5 mb-4 transition-all ${
                addr.isDefault ? 'border-foreground/40 bg-foreground/5' : 'border-border/30'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest font-semibold bg-foreground/10 px-2 py-1 rounded">
                    {addr.label || 'Home'}
                  </span>
                  {addr.isDefault && (
                    <span className="text-xs uppercase tracking-widest text-foreground/60 bg-foreground/5 px-2 py-1 rounded">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr)}
                      className="text-xs underline underline-offset-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleEditAddress(addr)}
                    className="text-xs underline underline-offset-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(addr.$id)}
                    disabled={deletingId === addr.$id}
                    className="text-xs underline underline-offset-2 text-red-500 hover:text-red-700 transition-colors"
                  >
                    {deletingId === addr.$id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
              <div className="text-sm space-y-1">
                <p className="font-medium">{addr.firstName} {addr.lastName}</p>
                <p>{addr.address}</p>
                {addr.landmark && <p className="text-muted-foreground">{addr.landmark}</p>}
                <p>{addr.city}, {addr.state} {addr.pincode}</p>
                <p>{addr.country}</p>
                <p className="text-muted-foreground mt-2">{addr.phone}</p>
              </div>
            </div>
          ))}

          {/* Address Form (Add / Edit) */}
          {showAddressForm && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest mb-2">
                {editingAddressId ? 'Edit Address' : 'New Address'}
              </h3>

              <div className="flex gap-2 flex-wrap">
                {ADDRESS_LABELS.map((lbl) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => setAddressForm({ ...addressForm, label: lbl })}
                    className={`px-4 py-2 text-xs uppercase tracking-widest border rounded-full transition-all ${
                      addressForm.label === lbl
                        ? 'bg-foreground text-background border-foreground'
                        : 'border-border/30 hover:border-foreground/50'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input type="text" placeholder="First Name *" value={addressForm.firstName} onChange={(e) => setAddressForm({ ...addressForm, firstName: e.target.value })} />
                <Input type="text" placeholder="Last Name *" value={addressForm.lastName} onChange={(e) => setAddressForm({ ...addressForm, lastName: e.target.value })} />
              </div>
              <Input type="tel" placeholder="Phone Number *" value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} />
              <Input type="text" placeholder="Address (House No, Street, Area) *" value={addressForm.address} onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })} />
              <Input type="text" placeholder="Landmark (optional)" value={addressForm.landmark} onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <Input type="text" placeholder="City *" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} />
                <select
                  className="w-full px-4 py-3 bg-transparent border border-border/30 text-sm focus:outline-none focus:border-foreground transition-colors"
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                >
                  <option value="">Select State *</option>
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input type="text" placeholder="PIN Code *" pattern="[0-9]{6}" title="Enter a valid 6-digit PIN code" value={addressForm.pincode} onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })} />
                <Input type="text" placeholder="Country" value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="w-4 h-4 accent-foreground"
                />
                <span className="text-sm">Set as default address</span>
              </label>

              <div className="flex gap-4 pt-2">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleSaveAddress}
                  disabled={saving || !addressForm.firstName || !addressForm.lastName || !addressForm.phone || !addressForm.address || !addressForm.city || !addressForm.state || !addressForm.pincode}
                >
                  {saving ? 'Saving...' : (editingAddressId ? 'Update Address' : 'Save Address')}
                </Button>
                <button
                  onClick={() => { setShowAddressForm(false); setEditingAddressId(null); setAddressForm(emptyAddressForm); }}
                  className="px-6 py-3 border border-border/30 text-sm uppercase tracking-widest hover:bg-foreground hover:text-background transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
