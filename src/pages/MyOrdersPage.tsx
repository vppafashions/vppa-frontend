import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileTextIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserOrders, type OrderDocument } from '../lib/orders';
import { openInvoicePrint } from '../lib/invoice';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Shipped', className: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Delivered', className: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
};

export function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    getUserOrders(user.$id).then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, [user, authLoading, navigate]);

  const parseItems = (itemsStr: string): OrderItem[] => {
    try {
      return JSON.parse(itemsStr);
    } catch {
      return [];
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-28 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="font-magazine text-4xl tracking-tight mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16 border border-border/30 rounded-2xl bg-card/50">
            <p className="text-muted-foreground mb-6">You haven&apos;t placed any orders yet.</p>
            <Link
              to="/"
              className="inline-block px-8 py-3 bg-foreground text-background text-sm uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const items = parseItems(order.items);
              const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
              const isExpanded = expandedOrder === order.$id;

              return (
                <div
                  key={order.$id}
                  className="border border-border/30 rounded-2xl bg-card/50 backdrop-blur-sm overflow-hidden"
                >
                  {/* Order Header */}
                  <button
                    className="w-full p-6 flex items-center justify-between text-left hover:bg-accent/5 transition-colors"
                    onClick={() => setExpandedOrder(isExpanded ? null : order.$id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-mono text-muted-foreground">
                          #{order.$id.slice(0, 8).toUpperCase()}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.$createdAt)} &middot; {items.length} item(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-xl">
                        ₹{order.total.toLocaleString('en-IN')}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {isExpanded ? 'Hide details' : 'View details'}
                      </span>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-border/20 pt-4 space-y-4">
                      {/* Items */}
                      <div>
                        <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Items</h3>
                        <div className="space-y-2">
                          {items.map((item, i) => (
                            <div
                              key={`${item.productId}-${i}`}
                              className="flex justify-between text-sm"
                            >
                              <span>
                                {item.name} x{item.quantity}
                                {item.size ? ` (${item.size})` : ''}
                              </span>
                              <span className="font-medium">
                                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      {order.address && (
                        <div>
                          <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                            Shipping Address
                          </h3>
                          <p className="text-sm">{order.address}</p>
                        </div>
                      )}

                      {/* Tracking */}
                      {order.trackingNumber && (
                        <div className="bg-accent/10 p-4 border border-border/30 rounded-lg">
                          <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                            Tracking Information
                          </h3>
                          <div className="text-sm space-y-1">
                            {order.courier && (
                              <p>
                                <span className="text-muted-foreground">Courier:</span>{' '}
                                {order.courier}
                              </p>
                            )}
                            <p>
                              <span className="text-muted-foreground">Tracking #:</span>{' '}
                              <span className="font-mono">{order.trackingNumber}</span>
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Payment ID */}
                      {order.razorpayPaymentId && (
                        <div>
                          <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                            Payment Reference
                          </h3>
                          <p className="text-xs font-mono text-muted-foreground">
                            {order.razorpayPaymentId}
                          </p>
                        </div>
                      )}

                      {/* Download Invoice */}
                      {(order.status === 'confirmed' || order.status === 'shipped' || order.status === 'delivered') && (
                        <button
                          onClick={() => openInvoicePrint(order)}
                          className="flex items-center gap-2 px-4 py-2.5 border border-border/30 rounded-lg text-sm hover:bg-foreground hover:text-background transition-all duration-300 w-full justify-center"
                        >
                          <FileTextIcon className="w-4 h-4" />
                          Download Invoice
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
