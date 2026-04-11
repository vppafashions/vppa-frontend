import { useState, useEffect } from 'react';

const COOKIE_CONSENT_KEY = 'vppa_cookie_consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-fade-in-up">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-background border border-border/50 shadow-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground leading-relaxed">
              We use cookies and similar technologies to enhance your browsing experience,
              analyze site traffic, and personalize content. By clicking "Accept", you
              consent to our use of cookies.{' '}
              <a href="/privacy" className="underline underline-offset-4 text-foreground hover:text-primary">
                Privacy Policy
              </a>
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={decline}
              className="px-6 py-2.5 text-xs uppercase tracking-[0.2em] border border-border hover:border-foreground transition-colors"
            >
              Decline
            </button>
            <button
              onClick={accept}
              className="px-6 py-2.5 text-xs uppercase tracking-[0.2em] bg-foreground text-background hover:bg-primary transition-colors"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
