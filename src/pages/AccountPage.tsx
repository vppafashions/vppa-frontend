import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { getCustomerByUserId, saveCustomer, INDIAN_STATES, type CustomerData } from '../lib/customers';

export function AccountPage() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    alternatePhone: '',
    companyName: '',
    gstin: '',
    shippingAddress: '',
    shippingCity: '',
    shippingState: '',
    shippingPincode: '',
    shippingCountry: 'India',
    landmark: '',
    sameAsShipping: true,
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingPincode: '',
    billingCountry: 'India',
  });

  useEffect(() => {
    if (!user) return;
    getCustomerByUserId(user.$id).then((data) => {
      if (data) {
        setCustomer(data);
        setForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          alternatePhone: data.alternatePhone || '',
          companyName: data.companyName || '',
          gstin: data.gstin || '',
          shippingAddress: data.shippingAddress || '',
          shippingCity: data.shippingCity || '',
          shippingState: data.shippingState || '',
          shippingPincode: data.shippingPincode || '',
          shippingCountry: data.shippingCountry || 'India',
          landmark: data.landmark || '',
          sameAsShipping: data.sameAsShipping ?? true,
          billingAddress: data.billingAddress || '',
          billingCity: data.billingCity || '',
          billingState: data.billingState || '',
          billingPincode: data.billingPincode || '',
          billingCountry: data.billingCountry || 'India',
        });
      }
    });
  }, [user]);

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const success = await saveCustomer({
      userId: user.$id,
      firstName: form.firstName,
      lastName: form.lastName,
      email: user.email,
      phone: form.phone,
      alternatePhone: form.alternatePhone,
      companyName: form.companyName,
      gstin: form.gstin,
      shippingAddress: form.shippingAddress,
      shippingCity: form.shippingCity,
      shippingState: form.shippingState,
      shippingPincode: form.shippingPincode,
      shippingCountry: form.shippingCountry,
      landmark: form.landmark,
      sameAsShipping: form.sameAsShipping,
      billingAddress: form.sameAsShipping ? form.shippingAddress : form.billingAddress,
      billingCity: form.sameAsShipping ? form.shippingCity : form.billingCity,
      billingState: form.sameAsShipping ? form.shippingState : form.billingState,
      billingPincode: form.sameAsShipping ? form.shippingPincode : form.billingPincode,
      billingCountry: form.sameAsShipping ? form.shippingCountry : form.billingCountry,
    });
    if (success) {
      const updated = await getCustomerByUserId(user.$id);
      setCustomer(updated);
      setIsEditing(false);
    }
    setSaving(false);
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

          <div className="space-y-4 mb-8">
            <div className="flex justify-between py-3 border-b border-border/20">
              <span className="text-muted-foreground text-sm">Email</span>
              <span className="text-sm">{user.email}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/20">
              <span className="text-muted-foreground text-sm">Name</span>
              <span className="text-sm">{user.name || '—'}</span>
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
            onClick={async () => {
              await logout();
              navigate('/');
            }}
            className="w-full py-3 px-6 border border-border/30 rounded-full text-sm uppercase tracking-widest hover:bg-foreground hover:text-background transition-all duration-300"
          >
            Sign Out
          </button>
        </div>

        {/* Saved Address Section */}
        <div className="border border-border/30 rounded-2xl p-8 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold uppercase tracking-widest">
              {customer ? 'Saved Address' : 'Add Address'}
            </h2>
            {customer && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm underline underline-offset-4 hover:text-foreground/70 transition-colors"
              >
                Edit
              </button>
            )}
          </div>

          {!isEditing && customer ? (
            <div className="space-y-6">
              {/* Shipping Address Display */}
              <div>
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Shipping Address</h3>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{customer.firstName} {customer.lastName}</p>
                  <p>{customer.shippingAddress}</p>
                  {customer.landmark && <p>{customer.landmark}</p>}
                  <p>{customer.shippingCity}, {customer.shippingState} {customer.shippingPincode}</p>
                  <p>{customer.shippingCountry}</p>
                  <p className="text-muted-foreground mt-2">{customer.phone}</p>
                </div>
              </div>

              {/* Billing Address Display */}
              {!customer.sameAsShipping && (
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Billing Address</h3>
                  <div className="text-sm space-y-1">
                    <p>{customer.billingAddress}</p>
                    <p>{customer.billingCity}, {customer.billingState} {customer.billingPincode}</p>
                    <p>{customer.billingCountry}</p>
                  </div>
                </div>
              )}
              {customer.sameAsShipping && (
                <p className="text-xs text-muted-foreground italic">Billing address same as shipping</p>
              )}
            </div>
          ) : (
            /* Address Edit Form */
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="text"
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                />
                <Input
                  type="text"
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                />
                <Input
                  type="tel"
                  placeholder="Alternate Phone (optional)"
                  value={form.alternatePhone}
                  onChange={(e) => updateField('alternatePhone', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="text"
                  placeholder="Company Name (optional)"
                  value={form.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
                />
                <Input
                  type="text"
                  placeholder="GSTIN (optional)"
                  value={form.gstin}
                  onChange={(e) => updateField('gstin', e.target.value)}
                />
              </div>

              <h3 className="text-xs uppercase tracking-widest text-muted-foreground pt-2">Shipping Address</h3>
              <Input
                type="text"
                placeholder="Address (House No, Street, Area)"
                value={form.shippingAddress}
                onChange={(e) => updateField('shippingAddress', e.target.value)}
              />
              <Input
                type="text"
                placeholder="Landmark (optional)"
                value={form.landmark}
                onChange={(e) => updateField('landmark', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="text"
                  placeholder="City"
                  value={form.shippingCity}
                  onChange={(e) => updateField('shippingCity', e.target.value)}
                />
                <select
                  className="w-full px-4 py-3 bg-transparent border border-border/30 text-sm focus:outline-none focus:border-foreground transition-colors"
                  value={form.shippingState}
                  onChange={(e) => updateField('shippingState', e.target.value)}
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="text"
                  placeholder="PIN Code"
                  pattern="[0-9]{6}"
                  title="Enter a valid 6-digit PIN code"
                  value={form.shippingPincode}
                  onChange={(e) => updateField('shippingPincode', e.target.value)}
                />
                <Input
                  type="text"
                  placeholder="Country"
                  value={form.shippingCountry}
                  onChange={(e) => updateField('shippingCountry', e.target.value)}
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={form.sameAsShipping}
                  onChange={(e) => updateField('sameAsShipping', e.target.checked)}
                  className="w-4 h-4 accent-foreground"
                />
                <span className="text-sm">Billing address same as shipping</span>
              </label>

              {!form.sameAsShipping && (
                <>
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground pt-2">Billing Address</h3>
                  <Input
                    type="text"
                    placeholder="Billing Address (House No, Street, Area)"
                    value={form.billingAddress}
                    onChange={(e) => updateField('billingAddress', e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="text"
                      placeholder="City"
                      value={form.billingCity}
                      onChange={(e) => updateField('billingCity', e.target.value)}
                    />
                    <select
                      className="w-full px-4 py-3 bg-transparent border border-border/30 text-sm focus:outline-none focus:border-foreground transition-colors"
                      value={form.billingState}
                      onChange={(e) => updateField('billingState', e.target.value)}
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="text"
                      placeholder="PIN Code"
                      pattern="[0-9]{6}"
                      title="Enter a valid 6-digit PIN code"
                      value={form.billingPincode}
                      onChange={(e) => updateField('billingPincode', e.target.value)}
                    />
                    <Input
                      type="text"
                      placeholder="Country"
                      value={form.billingCountry}
                      onChange={(e) => updateField('billingCountry', e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Address'}
                </Button>
                {customer && (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 border border-border/30 text-sm uppercase tracking-widest hover:bg-foreground hover:text-background transition-all duration-300"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
