import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { XIcon, MinusIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Button } from '../ui/Button';
export function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    getCartTotal
  } = useCart();
  const navigate = useNavigate();
  if (!isCartOpen) return null;
  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };
  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true" />
      
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-background shadow-2xl z-50 flex flex-col transform transition-transform duration-500 ease-in-out border-l border-border/20" style={{ backgroundColor: '#faf9f6' }}>
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <h2 className="font-serif text-2xl">Shopping Bag</h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-accent rounded-full transition-colors"
            aria-label="Close cart">
            
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ?
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <p className="text-muted-foreground text-lg">
                Your bag is empty.
              </p>
              <Button onClick={() => setIsCartOpen(false)} variant="outline">
                Continue Shopping
              </Button>
            </div> :

          <ul className="space-y-8">
              {items.map((item) =>
            <li key={item.id} className="flex gap-4">
                  <div className="w-24 h-24 bg-accent/20 flex-shrink-0">
                    <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover" />
                
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-serif text-lg leading-tight">
                          {item.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Size: {item.size} | Color:{' '}
                          <span
                        className="inline-block w-3 h-3 rounded-full border border-border align-middle ml-1"
                        style={{
                          backgroundColor: item.color
                        }} />
                      
                        </p>
                      </div>
                      <p className="font-medium">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center border border-border/50">
                        <button
                      onClick={() =>
                      updateQuantity(item.id, item.quantity - 1)
                      }
                      className="p-2 hover:bg-accent transition-colors"
                      aria-label="Decrease quantity">
                      
                          <MinusIcon className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                      onClick={() =>
                      updateQuantity(item.id, item.quantity + 1)
                      }
                      className="p-2 hover:bg-accent transition-colors"
                      aria-label="Increase quantity">
                      
                          <PlusIcon className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors text-sm flex items-center gap-1 uppercase tracking-wider">
                    
                        <TrashIcon className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>
                </li>
            )}
            </ul>
          }
        </div>

        {items.length > 0 &&
        <div className="p-6 border-t border-border/50 bg-background">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg">Subtotal</span>
              <span className="font-serif text-2xl">
                ₹{getCartTotal().toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-6 text-center">
              Shipping and taxes calculated at checkout.
            </p>
            <Button
            onClick={handleCheckout}
            className="w-full h-14 text-lg"
            variant="primary">
            
              Proceed to Checkout
            </Button>
          </div>
        }
      </div>
    </>);

}
