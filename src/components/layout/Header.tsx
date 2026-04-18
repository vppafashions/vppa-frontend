import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SearchIcon, ShoppingBagIcon, MenuIcon, XIcon, UserIcon, HeartIcon } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useGender } from '../../context/GenderContext';
import { collections } from '../../data/collections';
export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getCartCount, setIsCartOpen } = useCart();
  const { user, loading: authLoading } = useAuth();
  const { wishlistCount } = useWishlist();
  const { gender, setGender } = useGender();
  const location = useLocation();
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);
  return (
    <>
      <header
        className="sticky top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        
        <div
          className="px-4 md:px-8 text-foreground">
          
          <div
            className="container mx-auto">
            
            <div
              className="flex items-center justify-between h-20">
              
              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 -ml-2"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open menu">
                
                <MenuIcon
                  className="w-6 h-6" />
                
              </button>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-6 flex-1">
                <div className="flex items-center border border-border rounded-sm text-[10px] tracking-[0.2em] uppercase font-medium mr-2">
                  <button
                    className={`px-3 py-1.5 transition-colors ${gender === 'men' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setGender('men')}
                  >
                    Men
                  </button>
                  <button
                    className={`px-3 py-1.5 transition-colors ${gender === 'women' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setGender('women')}
                  >
                    Women
                  </button>
                </div>
                {collections.map((collection) =>
                <Link
                  key={collection.id}
                  to={`/collection/${collection.slug}`}
                  className="uppercase tracking-widest hover:text-primary transition-colors text-sm">
                  
                    {collection.name}
                  </Link>
                )}
              </nav>

              {/* Logo */}
              <Link
                to="/"
                className="text-center flex-1 md:flex-none">
                <img src="/vppalogo.svg" alt="VPPA" className="h-10 w-auto mx-auto invert" />
              </Link>

              {/* Right Icons */}
              <div className="flex items-center justify-end gap-3 flex-1">
                <button
                  className="p-2 hover:text-primary transition-colors"
                  aria-label="Search">
                  
                  <SearchIcon
                    className="w-5 h-5" />
                  
                </button>
                {!authLoading && user && (
                  <Link
                    to="/wishlist"
                    className="p-2 hover:text-primary transition-colors relative"
                    aria-label="Wishlist">
                    <HeartIcon
                      className="w-5 h-5" />
                    {wishlistCount > 0 && (
                      <span
                        className="absolute top-0 right-0 bg-red-500 text-white font-bold rounded-full flex items-center justify-center text-[10px] w-4 h-4">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                )}
                {!authLoading && (
                  <Link
                    to={user ? '/account' : '/login'}
                    className="p-2 hover:text-primary transition-colors"
                    aria-label={user ? 'My Account' : 'Sign In'}>
                    
                    <UserIcon
                      className="w-5 h-5" />
                    
                  </Link>
                )}
                <button
                  className="p-2 hover:text-primary transition-colors relative"
                  onClick={() => setIsCartOpen(true)}
                  aria-label="Open cart">
                  
                  <ShoppingBagIcon
                    className="w-5 h-5" />
                  
                  {getCartCount() > 0 &&
                  <span
                    className="absolute top-0 right-0 bg-primary text-primary-foreground font-bold rounded-full flex items-center justify-center text-[10px] w-4 h-4">
                    
                      {getCartCount()}
                    </span>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen &&
      <div className="fixed inset-0 bg-background z-50 flex flex-col text-foreground">
          <div className="flex items-center justify-between p-6 border-b border-border/20">
            <img src="/vppalogo.svg" alt="VPPA" className="h-8 w-auto invert" />
            <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2"
            aria-label="Close menu">
            
              <XIcon className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex flex-col p-8 gap-8 text-xl uppercase tracking-widest">
            <div className="flex items-center gap-4 border-b border-border/20 pb-8">
              <button
                className={`flex-1 py-3 text-center text-sm tracking-[0.3em] border ${gender === 'men' ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground'}`}
                onClick={() => setGender('men')}
              >
                MEN
              </button>
              <button
                className={`flex-1 py-3 text-center text-sm tracking-[0.3em] border ${gender === 'women' ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground'}`}
                onClick={() => setGender('women')}
              >
                WOMEN
              </button>
            </div>
            {collections.map((collection) =>
          <Link
            key={collection.id}
            to={`/collection/${collection.slug}`}
            className="hover:text-primary transition-colors">
            
                {collection.name}
              </Link>
          )}
            <div className="border-t border-border/20 pt-8 space-y-6">
              {user && (
                <Link
                  to="/wishlist"
                  className="flex items-center gap-3 hover:text-primary transition-colors">
                  <HeartIcon className="w-5 h-5" />
                  My Wishlist
                  {wishlistCount > 0 && (
                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              )}
              <Link
                to={user ? '/account' : '/login'}
                className="flex items-center gap-3 hover:text-primary transition-colors">
                <UserIcon className="w-5 h-5" />
                {user ? 'My Account' : 'Sign In'}
              </Link>
            </div>
          </nav>
        </div>
      }
    </>);

}
