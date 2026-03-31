import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
export function CheckoutPage() {
  const { items, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const subtotal = getCartTotal();
  const shipping = 0; // Complimentary
  const total = subtotal + shipping;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      clearCart();
      navigate('/thank-you');
    }, 1500);
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
      </main>);

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
                  <Input type="email" placeholder="Email Address" required />
                  <Input type="tel" placeholder="Phone Number" required />
                </div>
              </section>

              {/* Shipping Info */}
              <section>
                <h2 className="text-sm uppercase tracking-widest font-semibold mb-6 pb-2 border-b border-border/50">
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input type="text" placeholder="First Name" required />
                    <Input type="text" placeholder="Last Name" required />
                  </div>
                  <Input type="text" placeholder="Address" required />
                  <Input
                    type="text"
                    placeholder="Apartment, suite, etc. (optional)" />
                  
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      type="text"
                      placeholder="City"
                      required
                      className="col-span-1" />
                    
                    <Input
                      type="text"
                      placeholder="State"
                      required
                      className="col-span-1" />
                    
                    <Input
                      type="text"
                      placeholder="ZIP Code"
                      required
                      className="col-span-1" />
                    
                  </div>
                </div>
              </section>

              {/* Payment Info */}
              <section>
                <h2 className="text-sm uppercase tracking-widest font-semibold mb-6 pb-2 border-b border-border/50">
                  Payment Details
                </h2>
                <div className="bg-accent/10 p-6 border border-border/50">
                  <div className="space-y-4">
                    <Input type="text" placeholder="Card Number" required />
                    <Input type="text" placeholder="Name on Card" required />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="text"
                        placeholder="Expiration Date (MM/YY)"
                        required />
                      
                      <Input
                        type="text"
                        placeholder="Security Code (CVV)"
                        required />
                      
                    </div>
                  </div>
                </div>
              </section>

              <Button
                type="submit"
                variant="primary"
                className="w-full h-14 text-lg mt-8"
                disabled={isSubmitting}>
                
                {isSubmitting ?
                'Processing...' :
                `Pay ₹${total.toLocaleString('en-IN')}`}
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
                {items.map((item) =>
                <li key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-accent/20 flex-shrink-0 relative">
                      <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover" />
                    
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
                )}
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
    </main>);

}
