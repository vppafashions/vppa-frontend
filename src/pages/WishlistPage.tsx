import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HeartIcon, ShoppingBagIcon, TrashIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const { wishlistItems, wishlistLoading, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  if (authLoading || wishlistLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background py-16">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <HeartIcon className="w-16 h-16 mx-auto mb-6 text-muted-foreground/30" />
          <h1 className="font-magazine text-4xl tracking-tight mb-4">Wishlist</h1>
          <p className="text-muted-foreground mb-8">Sign in to save your favourite items.</p>
          <Link
            to="/login"
            className="inline-block px-8 py-3 bg-foreground text-background text-sm uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="font-magazine text-4xl tracking-tight mb-8">
          My Wishlist
          {wishlistItems.length > 0 && (
            <span className="text-lg font-sans text-muted-foreground ml-3">
              ({wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''})
            </span>
          )}
        </h1>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16 border border-border/30 rounded-2xl bg-card/50">
            <HeartIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground mb-6">Your wishlist is empty.</p>
            <Link
              to="/"
              className="inline-block px-8 py-3 bg-foreground text-background text-sm uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              Explore Collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <div
                key={item.$id}
                className="group border border-border/30 rounded-2xl bg-card/50 backdrop-blur-sm overflow-hidden"
              >
                {/* Product Image */}
                <Link to={`/product/${item.productId}`} className="block">
                  <div className="aspect-square bg-accent/10 overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                        <HeartIcon className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-4">
                  <Link to={`/product/${item.productId}`} className="block">
                    {item.collectionSlug && (
                      <p className="text-xs uppercase tracking-widest text-primary mb-1">
                        {item.collectionSlug}
                      </p>
                    )}
                    <h3 className="font-serif text-lg mb-1 group-hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-lg font-light">
                      ₹{item.price.toLocaleString('en-IN')}
                    </p>
                  </Link>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        addToCart({
                          productId: item.productId,
                          name: item.name,
                          price: item.price,
                          size: '',
                          color: '',
                          quantity: 1,
                          image: item.image,
                        });
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-foreground bg-foreground text-background text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
                    >
                      <ShoppingBagIcon className="w-3.5 h-3.5" />
                      Add to Bag
                    </button>
                    <button
                      onClick={() =>
                        toggleWishlist({
                          productId: item.productId,
                          name: item.name,
                          price: item.price,
                          image: item.image,
                          collectionSlug: item.collectionSlug,
                        })
                      }
                      className="p-2.5 border border-border/30 hover:border-red-300 hover:bg-red-50 hover:text-red-500 transition-all"
                      aria-label="Remove from wishlist"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick nav */}
        <div className="mt-12 flex justify-center gap-4">
          <button
            onClick={() => navigate('/account')}
            className="px-6 py-2.5 border border-border/30 rounded-full text-sm uppercase tracking-widest hover:bg-foreground hover:text-background transition-all duration-300"
          >
            My Account
          </button>
          <button
            onClick={() => navigate('/orders')}
            className="px-6 py-2.5 border border-border/30 rounded-full text-sm uppercase tracking-widest hover:bg-foreground hover:text-background transition-all duration-300"
          >
            My Orders
          </button>
        </div>
      </div>
    </div>
  );
}
