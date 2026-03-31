import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
export function ThankYouPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const orderNumber = Math.floor(100000 + Math.random() * 900000);
  return (
    <main className="pt-32 pb-24 min-h-[80vh] flex items-center justify-center bg-background px-4">
      <div className="max-w-xl w-full text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckIcon className="w-10 h-10 text-primary" />
        </div>

        <h1 className="font-serif text-4xl md:text-5xl mb-4">
          Order Confirmed
        </h1>
        <p className="text-muted-foreground mb-8 text-lg">
          Thank you for your purchase. Your order has been received and is being
          processed.
        </p>

        <div className="bg-accent/5 border border-border/50 p-8 mb-12 text-left">
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-muted-foreground uppercase tracking-widest text-xs mb-1">
                Order Number
              </p>
              <p className="font-medium">#{orderNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground uppercase tracking-widest text-xs mb-1">
                Date
              </p>
              <p className="font-medium">{new Date().toLocaleDateString()}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground uppercase tracking-widest text-xs mb-1">
                Estimated Delivery
              </p>
              <p className="font-medium">3-5 Business Days</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-8">
          A confirmation email has been sent with your order details and
          tracking information.
        </p>

        <Link to="/">
          <Button variant="primary" className="px-12 h-14">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </main>);

}