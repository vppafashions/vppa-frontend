import { useDocumentHead } from '../hooks/useDocumentHead';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  useDocumentHead({
    title: '404 — Page Not Found | VPPA Fashions',
    description: 'The page you are looking for could not be found. Browse our premium men\'s clothing collections.',
  });

  return (
    <main className="bg-background min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-xl">
        <p className="text-xs tracking-[0.4em] uppercase text-primary mb-6">Error 404</p>
        <h1 className="font-magazine italic text-7xl md:text-9xl mb-8 font-light">Lost</h1>
        <p className="text-muted-foreground mb-12 leading-relaxed">
          The page you are looking for does not exist or has been moved. 
          Let us guide you back to our collections.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-block px-10 py-4 bg-foreground text-background text-sm uppercase tracking-widest hover:bg-primary transition-colors"
          >
            Back to Home
          </Link>
          <Link
            to="/collection/velocity"
            className="inline-block px-10 py-4 border border-border text-sm uppercase tracking-widest hover:border-foreground transition-colors"
          >
            Browse Collections
          </Link>
        </div>
      </div>
    </main>
  );
}
