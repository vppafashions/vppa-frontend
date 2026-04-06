import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { getCustomerByUserId, saveCustomer, INDIAN_STATES } from '../lib/customers';
import { createOrder } from '../lib/orders';
import { initiateRazorpayPayment } from '../lib/razorpay';
import { checkCartStock } from '../lib/stock';
import { getAddresses, createAddress, type Address } from '../lib/addresses';

interface CheckoutForm {
  email: string;
  phone: string;
  alternatePhone: string;
  firstName: string;
  lastName: string;
  companyName: string;
  gstin: string;
  shippingAddress: string;
  shippingLandmark: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  shippingCountry: string;
  sameAsShipping: boolean;
  billingAddress: string;
  billingLandmark: string;
  billingCity: string;
  billingState: string;
  billingPincode: string;
  billingCountry: string;
}

const initialForm: CheckoutForm = {
  email: '',
  phone: '',
  alternatePhone: '',
  firstName: '',
  lastName: '',
  companyName: '',
  gstin: '',
  shippingAddress: '',
  shippingLandmark: '',
  shippingCity: '',
  shippingState: '',
  shippingPincode: '',
  shippingCountry: 'India',
  sameAsShipping: true,
  billingAddress: '',
  billingLandmark: '',
  billingCity: '',
  billingState: '',
  billingPincode: '',
  billingCountry: 'India',
};

export function CheckoutPage() {
  const { items, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const [saveAddress, setSaveAddress] = useState(true);
  const [stockErrors, setStockErrors] = useState<Array<{ name: string; requested: number; available: number }>>([]);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const subtotal = getCartTotal();
  const shipping = 0;
  const total = subtotal + shipping;

  // Load saved addresses and customer data
  useEffect(() => {
    if (!user) return;

    // Load both addresses and customer profile in parallel
    Promise.all([
      getAddresses(user.$id),
      getCustomerByUserId(user.$id),
    ]).then(async ([addrs, customer]) => {
      // Pre-fill contact & customer details from profile
      if (customer) {
        setForm((prev) => ({
          ...prev,
          email: customer.email || user.email || '',
          phone: customer.phone || prev.phone || '',
          alternatePhone: customer.alternatePhone || '',
          firstName: customer.firstName || prev.firstName || '',
          lastName: customer.lastName || prev.lastName || '',
          companyName: customer.companyName || '',
          gstin: customer.gstin || '',
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          email: user.email || '',
          firstName: user.name?.split(' ')[0] || '',
          lastName: user.name?.split(' ').slice(1).join(' ') || '',
        }));
      }

      // If addresses collection has entries, use them
      if (addrs.length > 0) {
        setSavedAddresses(addrs);
        const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
        setSelectedAddressId(defaultAddr.$id);
        fillFormFromAddress(defaultAddr);
        return;
      }

      // No saved addresses — check if customer profile has a shipping address
      // and auto-create an address entry so it appears as a selectable card
      if (customer?.shippingAddress && customer.shippingCity && customer.shippingState && customer.shippingPincode) {
        const newAddr = await createAddress({
          userId: user.$id,
          label: 'Home',
          firstName: customer.firstName || '',
          lastName: customer.lastName || '',
          phone: customer.phone || '',
          address: customer.shippingAddress,
          landmark: customer.landmark || '',
          city: customer.shippingCity,
          state: customer.shippingState,
          pincode: customer.shippingPincode,
          country: customer.shippingCountry || 'India',
          isDefault: true,
        });

        if (newAddr) {
          setSavedAddresses([newAddr]);
          setSelectedAddressId(newAddr.$id);
          fillFormFromAddress(newAddr);
        } else {
          // Fallback: just pre-fill the form from customer data
          setUseNewAddress(true);
          setForm((prev) => ({
            ...prev,
            shippingAddress: customer.shippingAddress || '',
            shippingLandmark: customer.landmark || '',
            shippingCity: customer.shippingCity || '',
            shippingState: customer.shippingState || '',
            shippingPincode: customer.shippingPincode || '',
            shippingCountry: customer.shippingCountry || 'India',
          }));
        }
      } else {
        setUseNewAddress(true);
      }
    });
  }, [user]);

  const fillFormFromAddress = (addr: Address) => {
    setForm((prev) => ({
      ...prev,
      firstName: addr.firstName || prev.firstName,
      lastName: addr.lastName || prev.lastName,
      phone: addr.phone || prev.phone,
      shippingAddress: addr.address,
      shippingLandmark: addr.landmark || '',
      shippingCity: addr.city,
      shippingState: addr.state,
      shippingPincode: addr.pincode,
      shippingCountry: addr.country || 'India',
    }));
  };

  const handleSelectAddress = (addrId: string) => {
    setSelectedAddressId(addrId);
    setUseNewAddress(false);
    const addr = savedAddresses.find((a) => a.$id === addrId);
    if (addr) fillFormFromAddress(addr);
  };

  const handleUseNewAddress = () => {
    setSelectedAddressId(null);
    setUseNewAddress(true);
    setForm((prev) => ({
      ...prev,
      shippingAddress: '',
      shippingLandmark: '',
      shippingCity: '',
      shippingState: '',
      shippingPincode: '',
      shippingCountry: 'India',
    }));
  };

  const updateField = (field: keyof CheckoutForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const [paymentError, setPaymentError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setPaymentError('');
    setStockErrors([]);

    // Check stock availability before proceeding
    try {
      const outOfStock = await checkCartStock(
        items.map((item) => ({ productId: item.productId, name: item.name, quantity: item.quantity, size: item.size, color: item.color }))
      );
      if (outOfStock.length > 0) {
        setStockErrors(outOfStock);
        setIsSubmitting(false);
        return;
      }
    } catch {
      // If stock check fails, don't block checkout
    }

    // Save customer details and new address to Appwrite if logged in
    if (user && saveAddress) {
      await saveCustomer({
        userId: user.$id,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        billingAddress: form.sameAsShipping ? form.shippingAddress : form.billingAddress,
        billingCity: form.sameAsShipping ? form.shippingCity : form.billingCity,
        billingState: form.sameAsShipping ? form.shippingState : form.billingState,
        billingPincode: form.sameAsShipping ? form.shippingPincode : form.billingPincode,
        billingCountry: form.sameAsShipping ? form.shippingCountry : form.billingCountry,
        shippingAddress: form.shippingAddress,
        shippingCity: form.shippingCity,
        shippingState: form.shippingState,
        shippingPincode: form.shippingPincode,
        shippingCountry: form.shippingCountry,
        gstin: form.gstin,
        companyName: form.companyName,
        landmark: form.shippingLandmark,
        alternatePhone: form.alternatePhone,
        sameAsShipping: form.sameAsShipping,
      });
      // Save new address to addresses collection
      if (useNewAddress && form.shippingAddress) {
        await createAddress({
          userId: user.$id,
          label: 'Home',
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          address: form.shippingAddress,
          landmark: form.shippingLandmark,
          city: form.shippingCity,
          state: form.shippingState,
          pincode: form.shippingPincode,
          country: form.shippingCountry,
        });
      }
    }

    try {
      // Step 1-3: Server creates Razorpay order, opens checkout, verifies signature
      const response = await initiateRazorpayPayment({
        amount: total, // in rupees — razorpay.ts converts to paise
        receipt: `order_${Date.now()}`,
        prefill: {
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
          contact: form.phone,
        },
        notes: {
          shippingAddress: `${form.shippingAddress}, ${form.shippingCity}, ${form.shippingState} ${form.shippingPincode}`,
        },
      });

      // Build full address string
      const fullAddress = [
        form.shippingAddress,
        form.shippingLandmark,
        form.shippingCity,
        form.shippingState,
        form.shippingPincode,
        form.shippingCountry,
      ].filter(Boolean).join(', ');

      // Build billing info for notes
      const billingInfo = form.sameAsShipping
        ? 'Same as shipping'
        : [form.billingAddress, form.billingCity, form.billingState, form.billingPincode, form.billingCountry].filter(Boolean).join(', ');

      const orderItems = items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      }));

      // Create order in Appwrite
      await createOrder({
        customerName: `${form.firstName} ${form.lastName}`,
        email: form.email,
        phone: form.phone,
        address: fullAddress,
        items: JSON.stringify(orderItems),
        total,
        status: 'confirmed',
        notes: billingInfo + (form.gstin ? ` | GSTIN: ${form.gstin}` : '') + (form.companyName ? ` | Company: ${form.companyName}` : ''),
        userId: user?.$id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpayOrderId: response.razorpay_order_id,
      });

      clearCart();
      navigate('/thank-you');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment failed';
      if (message !== 'Payment cancelled by user') {
        setPaymentError(message);
      }
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="pt-32 pb-24 min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="font-serif text-4xl mb-6">Your Bag is Empty</h1>
        <p className="text-muted-foreground mb-8">
          Add items to your bag to proceed to checkout.
        </p>
        <Button onClick={() => navigate('/')} variant="primary">
          Return to Shop
        </Button>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-24 bg-background min-h-screen">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <h1 className="font-serif text-3xl md:text-4xl mb-12 text-center">
          Secure Checkout
        </h1>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          {/* Form Section */}
          <div className="lg:w-3/5">
            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Contact Info */}
              <section>
                <h2 className="text-sm uppercase tracking-widest font-semibold mb-6 pb-2 border-b border-border/50">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Email Address"
                    required
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="tel"
                      placeholder="Phone Number"
                      required
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
                </div>
              </section>

              {/* Customer Details */}
              <section>
                <h2 className="text-sm uppercase tracking-widest font-semibold mb-6 pb-2 border-b border-border/50">
                  Customer Details
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="text"
                      placeholder="First Name"
                      required
                      value={form.firstName}
                      onChange={(e) => updateField('firstName', e.target.value)}
                    />
                    <Input
                      type="text"
                      placeholder="Last Name"
                      required
                      value={form.lastName}
                      onChange={(e) => updateField('lastName', e.target.value)}
                    />
                  </div>
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
              </section>

              {/* Shipping Address */}
              <section>
                <h2 className="text-sm uppercase tracking-widest font-semibold mb-6 pb-2 border-b border-border/50">
                  Shipping Address
                </h2>

                {/* Saved Address Cards */}
                {user && savedAddresses.length > 0 && (
                  <div className="space-y-3 mb-6">
                    {savedAddresses.map((addr) => (
                      <button
                        key={addr.$id}
                        type="button"
                        onClick={() => handleSelectAddress(addr.$id)}
                        className={`w-full text-left p-4 border rounded-lg transition-all ${
                          selectedAddressId === addr.$id && !useNewAddress
                            ? 'border-foreground bg-foreground/5'
                            : 'border-border/30 hover:border-foreground/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              selectedAddressId === addr.$id && !useNewAddress ? 'border-foreground' : 'border-border/50'
                            }`}>
                              {selectedAddressId === addr.$id && !useNewAddress && (
                                <div className="w-2 h-2 rounded-full bg-foreground" />
                              )}
                            </div>
                            <span className="text-xs uppercase tracking-widest font-semibold">{addr.label || 'Home'}</span>
                            {addr.isDefault && (
                              <span className="text-xs text-muted-foreground">(Default)</span>
                            )}
                          </div>
                        </div>
                        <div className="text-sm pl-6 space-y-0.5">
                          <p className="font-medium">{addr.firstName} {addr.lastName}</p>
                          <p className="text-muted-foreground">
                            {addr.address}{addr.landmark ? `, ${addr.landmark}` : ''}, {addr.city}, {addr.state} {addr.pincode}
                          </p>
                          <p className="text-muted-foreground">{addr.phone}</p>
                        </div>
                      </button>
                    ))}

                    {/* Add New Address option */}
                    <button
                      type="button"
                      onClick={handleUseNewAddress}
                      className={`w-full text-left p-4 border rounded-lg transition-all ${
                        useNewAddress
                          ? 'border-foreground bg-foreground/5'
                          : 'border-border/30 hover:border-foreground/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          useNewAddress ? 'border-foreground' : 'border-border/50'
                        }`}>
                          {useNewAddress && (
                            <div className="w-2 h-2 rounded-full bg-foreground" />
                          )}
                        </div>
                        <span className="text-sm font-medium">+ Add a new address</span>
                      </div>
                    </button>
                  </div>
                )}

                {/* New Address Form - shown when no saved addresses or user chose new */}
                {(useNewAddress || savedAddresses.length === 0) && (
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Address (House No, Street, Area)"
                    required
                    value={form.shippingAddress}
                    onChange={(e) => updateField('shippingAddress', e.target.value)}
                  />
                  <Input
                    type="text"
                    placeholder="Landmark (optional)"
                    value={form.shippingLandmark}
                    onChange={(e) => updateField('shippingLandmark', e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="text"
                      placeholder="City"
                      required
                      value={form.shippingCity}
                      onChange={(e) => updateField('shippingCity', e.target.value)}
                    />
                    <select
                      className="w-full px-4 py-3 bg-transparent border border-border/30 text-sm focus:outline-none focus:border-foreground transition-colors"
                      required
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
                      required
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
                </div>
                )}
              </section>

              {/* Billing Address */}
              <section>
                <h2 className="text-sm uppercase tracking-widest font-semibold mb-6 pb-2 border-b border-border/50">
                  Billing Address
                </h2>
                <label className="flex items-center gap-3 mb-6 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.sameAsShipping}
                    onChange={(e) => updateField('sameAsShipping', e.target.checked)}
                    className="w-4 h-4 accent-foreground"
                  />
                  <span className="text-sm">Same as shipping address</span>
                </label>
                {!form.sameAsShipping && (
                  <div className="space-y-4">
                    <Input
                      type="text"
                      placeholder="Billing Address (House No, Street, Area)"
                      required
                      value={form.billingAddress}
                      onChange={(e) => updateField('billingAddress', e.target.value)}
                    />
                    <Input
                      type="text"
                      placeholder="Landmark (optional)"
                      value={form.billingLandmark}
                      onChange={(e) => updateField('billingLandmark', e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="text"
                        placeholder="City"
                        required
                        value={form.billingCity}
                        onChange={(e) => updateField('billingCity', e.target.value)}
                      />
                      <select
                        className="w-full px-4 py-3 bg-transparent border border-border/30 text-sm focus:outline-none focus:border-foreground transition-colors"
                        required
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
                        required
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
                  </div>
                )}
              </section>

              {/* Stock Errors */}
              {stockErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                  <h3 className="text-red-800 font-semibold text-sm mb-3">Some items are out of stock</h3>
                  <ul className="space-y-2">
                    {stockErrors.map((err) => (
                      <li key={err.name} className="text-red-700 text-sm">
                        <strong>{err.name}</strong>
                        {err.available === 0
                          ? ' is currently out of stock.'
                          : ` — only ${err.available} available (you requested ${err.requested}).`}
                      </li>
                    ))}
                  </ul>
                  <p className="text-red-600 text-xs mt-3">Please update your cart before proceeding.</p>
                </div>
              )}

              {/* Payment Info */}
              <section>
                <h2 className="text-sm uppercase tracking-widest font-semibold mb-6 pb-2 border-b border-border/50">
                  Payment
                </h2>
                <div className="bg-accent/10 p-6 border border-border/50 text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Secure payment powered by Razorpay
                  </p>
                  <p className="text-xs text-muted-foreground">
                    UPI, Cards, Net Banking, Wallets accepted
                  </p>
                </div>
                {paymentError && (
                  <p className="text-red-500 text-sm mt-3">{paymentError}</p>
                )}
              </section>

              {/* Save address checkbox for logged-in users */}
              {user && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="w-4 h-4 accent-foreground"
                  />
                  <span className="text-sm">Save my details for future purchases</span>
                </label>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full h-14 text-lg mt-8"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Processing...'
                  : `Pay ₹${total.toLocaleString('en-IN')}`}
              </Button>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-2/5">
            <div className="bg-accent/5 p-8 border border-border/50 sticky top-32">
              <h2 className="text-sm uppercase tracking-widest font-semibold mb-6 pb-2 border-b border-border/50">
                Order Summary
              </h2>

              <ul className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-accent/20 flex-shrink-0 relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute -top-2 -right-2 bg-foreground text-background text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 text-sm">
                      <h3 className="font-serif text-base">{item.name}</h3>
                      <p className="text-muted-foreground mt-1">
                        Size: {item.size}
                      </p>
                    </div>
                    <p className="font-medium">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="space-y-3 text-sm border-t border-border/50 pt-6 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="uppercase tracking-widest text-xs">
                    Complimentary
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-border/50 pt-6">
                <span className="text-base uppercase tracking-widest font-semibold">
                  Total
                </span>
                <span className="font-serif text-3xl">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
