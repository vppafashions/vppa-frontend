import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileTextIcon, RotateCcw, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserOrders, type OrderDocument, type StatusTimeline } from '../lib/orders';
import { openInvoicePrint } from '../lib/invoice';
import {
  createReturnRequest,
  getUserReturns,
  type ReturnDocument,
  type ReturnItem,
  type ReturnStatusTimeline,
} from '../lib/returns';

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

const RETURN_STATUS_LABELS: Record<string, { label: string; className: string }> = {
  requested: { label: 'Return Requested', className: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Return Approved', className: 'bg-blue-100 text-blue-800' },
  rejected: { label: 'Return Rejected', className: 'bg-red-100 text-red-800' },
  picked_up: { label: 'Picked Up', className: 'bg-purple-100 text-purple-800' },
  refunded: { label: 'Refunded', className: 'bg-green-100 text-green-800' },
};

const RETURN_REASONS = [
  'Defective / Damaged product',
  'Wrong item received',
  'Size does not fit',
  'Color mismatch',
  'Quality not as expected',
  'Changed my mind',
  'Other',
];

export function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderDocument[]>([]);
  const [returns, setReturns] = useState<ReturnDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Return request modal state
  const [returnModalOrder, setReturnModalOrder] = useState<OrderDocument | null>(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnReasonDetails, setReturnReasonDetails] = useState('');
  const [returnSelectedItems, setReturnSelectedItems] = useState<Record<string, boolean>>({});
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnSuccess, setReturnSuccess] = useState(false);

  // Return tracking expanded state
  const [expandedReturn, setExpandedReturn] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    Promise.all([getUserOrders(user.$id), getUserReturns(user.$id)]).then(
      ([ordersData, returnsData]) => {
        setOrders(ordersData);
        setReturns(returnsData);
        setLoading(false);
      }
    );
  }, [user, authLoading, navigate]);

  const parseItems = (itemsStr: string): OrderItem[] => {
    try {
      return JSON.parse(itemsStr);
    } catch {
      return [];
    }
  };

  const parseTimeline = (timelineStr?: string): StatusTimeline => {
    if (!timelineStr) return {};
    try {
      return JSON.parse(timelineStr);
    } catch {
      return {};
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const parseReturnTimeline = (timelineStr?: string): ReturnStatusTimeline => {
    if (!timelineStr) return {};
    try {
      return JSON.parse(timelineStr);
    } catch {
      return {};
    }
  };

  const getReturnForOrder = (orderId: string) => {
    return returns.find((r) => r.orderId === orderId);
  };

  const canRequestReturn = (order: OrderDocument) => {
    if (order.status !== 'delivered') return false;
    const existingReturn = getReturnForOrder(order.$id);
    if (existingReturn) return false;
    // Allow return within 7 days of delivery
    const timeline = parseTimeline(order.statusTimeline);
    if (timeline.delivered) {
      const deliveredDate = new Date(timeline.delivered);
      const daysSinceDelivery = (Date.now() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDelivery > 7) return false;
    }
    return true;
  };

  const openReturnModal = (order: OrderDocument) => {
    setReturnModalOrder(order);
    setReturnReason('');
    setReturnReasonDetails('');
    setReturnSuccess(false);
    const items = parseItems(order.items);
    const selected: Record<string, boolean> = {};
    items.forEach((_, i) => {
      selected[String(i)] = true;
    });
    setReturnSelectedItems(selected);
  };

  const closeReturnModal = () => {
    setReturnModalOrder(null);
    setReturnReason('');
    setReturnReasonDetails('');
    setReturnSelectedItems({});
    setReturnSubmitting(false);
    setReturnSuccess(false);
  };

  const handleSubmitReturn = async () => {
    if (!returnModalOrder || !user || !returnReason) return;

    const items = parseItems(returnModalOrder.items);
    const selectedItems: ReturnItem[] = items
      .filter((_, i) => returnSelectedItems[String(i)])
      .map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size || '',
        color: item.color || '',
      }));

    if (selectedItems.length === 0) return;

    const refundAmount = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    setReturnSubmitting(true);

    const result = await createReturnRequest({
      orderId: returnModalOrder.$id,
      userId: user.$id,
      customerName: returnModalOrder.customerName || user.name || '',
      customerEmail: returnModalOrder.email || user.email || '',
      customerPhone: returnModalOrder.phone || '',
      items: selectedItems,
      reason: returnReason,
      reasonDetails: returnReasonDetails,
      refundAmount,
      originalPaymentId: returnModalOrder.razorpayPaymentId || '',
    });

    setReturnSubmitting(false);

    if (result) {
      setReturnSuccess(true);
      setReturns((prev) => [result, ...prev]);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-16">
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
              const orderReturn = getReturnForOrder(order.$id);

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
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <span className="text-xs font-mono text-muted-foreground">
                          #{order.$id.slice(0, 8).toUpperCase()}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>
                        {orderReturn && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              RETURN_STATUS_LABELS[orderReturn.status]?.className || 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {RETURN_STATUS_LABELS[orderReturn.status]?.label || orderReturn.status}
                          </span>
                        )}
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
                      {/* Status Timeline */}
                      {(() => {
                        const timeline = parseTimeline(order.statusTimeline);
                        const steps: { key: string; label: string }[] = [
                          { key: 'pending', label: 'Order Placed' },
                          { key: 'confirmed', label: 'Confirmed' },
                          { key: 'shipped', label: 'Shipped' },
                          { key: 'delivered', label: 'Delivered' },
                        ];
                        if (order.status === 'cancelled' || timeline.cancelled) {
                          steps.push({ key: 'cancelled', label: 'Cancelled' });
                        }
                        const currentIndex = steps.findIndex(s => s.key === order.status);
                        const hasAnyTimestamp = Object.keys(timeline).length > 0;

                        return (
                          <div>
                            <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                              Order Status
                            </h3>
                            <div className="relative">
                              {steps.map((step, idx) => {
                                const ts = timeline[step.key];
                                const isCompleted = idx <= currentIndex;
                                const isCurrent = idx === currentIndex;
                                const isLast = idx === steps.length - 1;
                                const isCancelled = step.key === 'cancelled';

                                return (
                                  <div key={step.key} className="flex gap-3">
                                    {/* Vertical line + dot */}
                                    <div className="flex flex-col items-center">
                                      <div
                                        className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
                                          isCancelled && isCompleted
                                            ? 'border-red-500 bg-red-500'
                                            : isCompleted
                                            ? 'border-foreground bg-foreground'
                                            : 'border-muted-foreground/30 bg-transparent'
                                        }`}
                                      />
                                      {!isLast && (
                                        <div
                                          className={`w-0.5 h-8 ${
                                            isCompleted && idx < currentIndex
                                              ? 'bg-foreground'
                                              : 'bg-muted-foreground/20'
                                          }`}
                                        />
                                      )}
                                    </div>
                                    {/* Label + timestamp */}
                                    <div className={`pb-4 ${!isCompleted ? 'opacity-40' : ''}`}>
                                      <p className={`text-sm ${isCurrent ? 'font-semibold' : 'font-medium'} ${isCancelled && isCompleted ? 'text-red-600' : ''}`}>
                                        {step.label}
                                      </p>
                                      {ts ? (
                                        <p className="text-xs text-muted-foreground">
                                          {formatDateTime(ts)}
                                        </p>
                                      ) : hasAnyTimestamp && step.key === 'pending' ? (
                                        <p className="text-xs text-muted-foreground">
                                          {formatDateTime(order.$createdAt)}
                                        </p>
                                      ) : null}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Return Status Timeline */}
                      {orderReturn && (
                        <div>
                          <button
                            className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-3 hover:text-foreground transition-colors"
                            onClick={() =>
                              setExpandedReturn(
                                expandedReturn === orderReturn.$id ? null : orderReturn.$id
                              )
                            }
                          >
                            <RotateCcw className="w-3 h-3" />
                            Return Status
                            {expandedReturn === orderReturn.$id ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                          {expandedReturn === orderReturn.$id && (
                            <div className="bg-accent/10 border border-border/30 rounded-lg p-4 space-y-3">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    RETURN_STATUS_LABELS[orderReturn.status]?.className ||
                                    'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {RETURN_STATUS_LABELS[orderReturn.status]?.label ||
                                    orderReturn.status}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  Return #{orderReturn.$id.slice(0, 8).toUpperCase()}
                                </span>
                              </div>

                              <div className="text-sm space-y-1">
                                <p>
                                  <span className="text-muted-foreground">Reason:</span>{' '}
                                  <span className="font-medium">{orderReturn.reason}</span>
                                </p>
                                {orderReturn.reasonDetails && (
                                  <p className="text-muted-foreground text-xs">
                                    {orderReturn.reasonDetails}
                                  </p>
                                )}
                                {orderReturn.refundAmount > 0 && (
                                  <p>
                                    <span className="text-muted-foreground">Refund Amount:</span>{' '}
                                    <span className="font-medium">
                                      ₹{orderReturn.refundAmount.toLocaleString('en-IN')}
                                    </span>
                                  </p>
                                )}
                                {orderReturn.razorpayRefundId && (
                                  <p>
                                    <span className="text-muted-foreground">Refund ID:</span>{' '}
                                    <span className="font-mono text-xs">
                                      {orderReturn.razorpayRefundId}
                                    </span>
                                  </p>
                                )}
                              </div>

                              {/* Return timeline */}
                              {(() => {
                                const rtl = parseReturnTimeline(orderReturn.statusTimeline);
                                const returnSteps: { key: string; label: string }[] = [
                                  { key: 'requested', label: 'Return Requested' },
                                  { key: 'approved', label: 'Approved' },
                                  { key: 'picked_up', label: 'Picked Up' },
                                  { key: 'refunded', label: 'Refunded' },
                                ];
                                if (orderReturn.status === 'rejected' || rtl.rejected) {
                                  return (
                                    <div className="relative mt-2">
                                      <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                          <div className="w-3 h-3 rounded-full border-2 border-foreground bg-foreground flex-shrink-0" />
                                          <div className="w-0.5 h-8 bg-foreground" />
                                        </div>
                                        <div className="pb-4">
                                          <p className="text-sm font-medium">Return Requested</p>
                                          {rtl.requested && (
                                            <p className="text-xs text-muted-foreground">
                                              {formatDateTime(rtl.requested)}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                          <div className="w-3 h-3 rounded-full border-2 border-red-500 bg-red-500 flex-shrink-0" />
                                        </div>
                                        <div>
                                          <p className="text-sm font-semibold text-red-600">
                                            Rejected
                                          </p>
                                          {rtl.rejected && (
                                            <p className="text-xs text-muted-foreground">
                                              {formatDateTime(rtl.rejected)}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }

                                const statusOrder = [
                                  'requested',
                                  'approved',
                                  'picked_up',
                                  'refunded',
                                ];
                                const currentReturnIndex = statusOrder.indexOf(
                                  orderReturn.status
                                );

                                return (
                                  <div className="relative mt-2">
                                    {returnSteps.map((step, idx) => {
                                      const ts =
                                        rtl[step.key as keyof ReturnStatusTimeline];
                                      const isCompleted = idx <= currentReturnIndex;
                                      const isCurrent = idx === currentReturnIndex;
                                      const isLast = idx === returnSteps.length - 1;

                                      return (
                                        <div key={step.key} className="flex gap-3">
                                          <div className="flex flex-col items-center">
                                            <div
                                              className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
                                                isCompleted
                                                  ? 'border-foreground bg-foreground'
                                                  : 'border-muted-foreground/30 bg-transparent'
                                              }`}
                                            />
                                            {!isLast && (
                                              <div
                                                className={`w-0.5 h-8 ${
                                                  isCompleted && idx < currentReturnIndex
                                                    ? 'bg-foreground'
                                                    : 'bg-muted-foreground/20'
                                                }`}
                                              />
                                            )}
                                          </div>
                                          <div
                                            className={`pb-4 ${!isCompleted ? 'opacity-40' : ''}`}
                                          >
                                            <p
                                              className={`text-sm ${isCurrent ? 'font-semibold' : 'font-medium'}`}
                                            >
                                              {step.label}
                                            </p>
                                            {ts && (
                                              <p className="text-xs text-muted-foreground">
                                                {formatDateTime(ts)}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              })()}

                              {orderReturn.adminNotes && (
                                <div className="border-t border-border/20 pt-2">
                                  <p className="text-xs text-muted-foreground">
                                    <span className="font-medium">Admin Note:</span>{' '}
                                    {orderReturn.adminNotes}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tracking Information */}
                      {order.trackingNumber && (
                        <div className="bg-accent/10 p-4 border border-border/30 rounded-lg">
                          <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                            Tracking Information
                          </h3>
                          <div className="text-sm space-y-1">
                            {order.courier && (
                              <p>
                                <span className="text-muted-foreground">Courier:</span>{' '}
                                <span className="font-medium">{order.courier}</span>
                              </p>
                            )}
                            <p>
                              <span className="text-muted-foreground">Tracking #:</span>{' '}
                              <span className="font-mono font-medium">{order.trackingNumber}</span>
                            </p>
                          </div>
                        </div>
                      )}

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

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2">
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

                        {/* Request Return Button */}
                        {canRequestReturn(order) && (
                          <button
                            onClick={() => openReturnModal(order)}
                            className="flex items-center gap-2 px-4 py-2.5 border border-orange-300 bg-orange-50 text-orange-800 rounded-lg text-sm hover:bg-orange-100 transition-all duration-300 w-full justify-center"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Request Return
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Return Request Modal */}
      {returnModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background border border-border/30 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            {returnSuccess ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <RotateCcw className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold">Return Request Submitted</h2>
                <p className="text-sm text-muted-foreground">
                  Your return request has been submitted successfully. Our team will review it and
                  get back to you within 24-48 hours.
                </p>
                <p className="text-xs text-muted-foreground">
                  You can track your return status in the order details.
                </p>
                <button
                  onClick={closeReturnModal}
                  className="px-6 py-2.5 bg-foreground text-background text-sm rounded-lg hover:opacity-90 transition-opacity"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-border/20">
                  <div>
                    <h2 className="text-lg font-semibold">Request Return</h2>
                    <p className="text-xs text-muted-foreground">
                      Order #{returnModalOrder.$id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <button
                    onClick={closeReturnModal}
                    className="p-2 hover:bg-accent/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">
                  {/* Select Items */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Select items to return</h3>
                    <div className="space-y-2">
                      {parseItems(returnModalOrder.items).map((item, i) => (
                        <label
                          key={`${item.productId}-${i}`}
                          className="flex items-center gap-3 p-3 border border-border/30 rounded-lg cursor-pointer hover:bg-accent/5 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={returnSelectedItems[String(i)] || false}
                            onChange={(e) =>
                              setReturnSelectedItems((prev) => ({
                                ...prev,
                                [String(i)]: e.target.checked,
                              }))
                            }
                            className="w-4 h-4 rounded border-border accent-foreground"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.size ? `Size: ${item.size}` : ''}
                              {item.size && item.color ? ' · ' : ''}
                              {item.color ? `Color: ${item.color}` : ''}
                              {' · '}Qty: {item.quantity}
                            </p>
                          </div>
                          <span className="text-sm font-medium">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Reason */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">Reason for return</h3>
                    <div className="space-y-2">
                      {RETURN_REASONS.map((reason) => (
                        <label
                          key={reason}
                          className="flex items-center gap-3 p-2.5 border border-border/30 rounded-lg cursor-pointer hover:bg-accent/5 transition-colors"
                        >
                          <input
                            type="radio"
                            name="returnReason"
                            value={reason}
                            checked={returnReason === reason}
                            onChange={(e) => setReturnReason(e.target.value)}
                            className="w-4 h-4 accent-foreground"
                          />
                          <span className="text-sm">{reason}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">Additional details (optional)</h3>
                    <textarea
                      value={returnReasonDetails}
                      onChange={(e) => setReturnReasonDetails(e.target.value)}
                      placeholder="Describe the issue in more detail..."
                      rows={3}
                      className="w-full px-3 py-2 border border-border/30 rounded-lg text-sm bg-transparent resize-none focus:outline-none focus:ring-1 focus:ring-foreground/20"
                    />
                  </div>

                  {/* Refund Estimate */}
                  {(() => {
                    const selectedItems = parseItems(returnModalOrder.items).filter(
                      (_, i) => returnSelectedItems[String(i)]
                    );
                    const refundTotal = selectedItems.reduce(
                      (sum, item) => sum + item.price * item.quantity,
                      0
                    );
                    return selectedItems.length > 0 ? (
                      <div className="bg-accent/10 border border-border/30 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Estimated Refund ({selectedItems.length} item
                            {selectedItems.length > 1 ? 's' : ''})
                          </span>
                          <span className="text-lg font-semibold">
                            ₹{refundTotal.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Refund will be processed to your original payment method after approval.
                        </p>
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-border/20 flex gap-3">
                  <button
                    onClick={closeReturnModal}
                    className="flex-1 px-4 py-2.5 border border-border/30 rounded-lg text-sm hover:bg-accent/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReturn}
                    disabled={
                      returnSubmitting ||
                      !returnReason ||
                      Object.values(returnSelectedItems).filter(Boolean).length === 0
                    }
                    className="flex-1 px-4 py-2.5 bg-foreground text-background rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {returnSubmitting ? 'Submitting...' : 'Submit Return Request'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
