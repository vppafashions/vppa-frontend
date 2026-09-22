import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { GenderProvider } from './context/GenderContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { HomePage } from './pages/HomePage';
import { CollectionPage } from './pages/CollectionPage';
import { ProductPage } from './pages/ProductPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ThankYouPage } from './pages/ThankYouPage';
import { LoginPage } from './pages/LoginPage';
import { AccountPage } from './pages/AccountPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { WishlistPage } from './pages/WishlistPage';
import { MagicLinkCallbackPage } from './pages/MagicLinkCallbackPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { ShippingReturnsPage } from './pages/ShippingReturnsPage';
import { FAQPage } from './pages/FAQPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { Analytics } from './components/Analytics';
import { CookieConsent } from './components/seo/CookieConsent';
export function App() {
  return <AuthProvider>
      <GenderProvider>
      <WishlistProvider>
      <CartProvider>
        <Router>
          <Analytics />
          <div className="min-h-screen flex flex-col font-sans text-foreground bg-background selection:bg-primary selection:text-primary-foreground">
            <Header />
            <CartDrawer />
            <div className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/collection/:slug" element={<CollectionPage />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/:gender/:type/:productSlug" element={<ProductPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/thank-you" element={<ThankYouPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/orders" element={<MyOrdersPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/magic-link-callback" element={<MagicLinkCallbackPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/shipping-returns" element={<ShippingReturnsPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
            <Footer />
            <CookieConsent />
          </div>
        </Router>
      </CartProvider>
      </WishlistProvider>
      </GenderProvider>
    </AuthProvider>;
}
