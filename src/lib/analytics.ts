declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_MEASUREMENT_ID = 'G-R9Y6QFB22B';

export function trackPageView(path: string, title?: string) {
  if (typeof window.gtag === 'function') {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: path,
      page_title: title,
    });
  }
}

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

// E-commerce events
export function trackAddToCart(item: {
  id: string;
  name: string;
  price: number;
  quantity: number;
}) {
  trackEvent('add_to_cart', {
    currency: 'INR',
    value: item.price * item.quantity,
    items_id: item.id,
    items_name: item.name,
    items_quantity: item.quantity,
  });
}

export function trackRemoveFromCart(item: {
  id: string;
  name: string;
  price: number;
}) {
  trackEvent('remove_from_cart', {
    currency: 'INR',
    value: item.price,
    items_id: item.id,
    items_name: item.name,
  });
}

export function trackBeginCheckout(value: number) {
  trackEvent('begin_checkout', {
    currency: 'INR',
    value,
  });
}

export function trackPurchase(order: {
  orderId: string;
  value: number;
  tax: number;
}) {
  trackEvent('purchase', {
    currency: 'INR',
    transaction_id: order.orderId,
    value: order.value,
    tax: order.tax,
  });
}

export function trackLogin(method: string) {
  trackEvent('login', { method });
}

export function trackSignUp(method: string) {
  trackEvent('sign_up', { method });
}

export function trackSearch(searchTerm: string) {
  trackEvent('search', { search_term: searchTerm });
}

export function trackViewItem(item: {
  id: string;
  name: string;
  price: number;
}) {
  trackEvent('view_item', {
    currency: 'INR',
    value: item.price,
    items_id: item.id,
    items_name: item.name,
  });
}

export function trackAddToWishlist(item: {
  id: string;
  name: string;
  price: number;
}) {
  trackEvent('add_to_wishlist', {
    currency: 'INR',
    value: item.price,
    items_id: item.id,
    items_name: item.name,
  });
}
