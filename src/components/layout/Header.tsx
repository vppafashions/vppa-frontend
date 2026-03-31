import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SearchIcon, ShoppingBagIcon, MenuIcon, XIcon } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { collections } from '../../data/collections';
export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getCartCount, setIsCartOpen } = useCart();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);
  const isTransparent = isHomePage && !isScrolled;
  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-700 ease-in-out ${isScrolled ? 'py-3 px-4 md:px-8' : 'py-0 px-0'}`}>
        
        <div
          className={`transition-all duration-700 ease-in-out ${isScrolled ? 'max-w-3xl mx-auto rounded-full bg-[#0a0a0a]/85 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/10 px-6 md:px-8 text-white' : 'max-w-full mx-0 rounded-none bg-transparent backdrop-blur-none shadow-none border-transparent px-4 md:px-8 ' + (isTransparent ? 'text-white' : 'bg-background/95 backdrop-blur-md text-foreground border-b border-border/20')}`}>
          
          <div
            className={`container mx-auto transition-all duration-700 ${isScrolled ? 'px-0' : ''}`}>
            
            <div
              className={`flex items-center justify-between transition-all duration-700 ${isScrolled ? 'h-14' : 'h-20'}`}>
              
              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 -ml-2"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open menu">
                
                <MenuIcon
                  className={`transition-all duration-500 ${isScrolled ? 'w-5 h-5' : 'w-6 h-6'}`} />
                
              </button>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-6 flex-1">
                {collections.map((collection) =>
                <Link
                  key={collection.id}
                  to={`/collection/${collection.slug}`}
                  className={`uppercase tracking-widest hover:text-primary transition-all duration-500 ${isScrolled ? 'text-[11px]' : 'text-sm'}`}>
                  
                    {collection.name}
                  </Link>
                )}
              </nav>

              {/* Logo */}
              <Link
                to="/"
                className={`font-magazine font-light tracking-tight text-center flex-1 md:flex-none transition-all duration-700 ${isScrolled ? 'text-2xl' : 'text-4xl'}`}>
                
                VPPA
              </Link>

              {/* Right Icons */}
              <div className="flex items-center justify-end gap-3 flex-1">
                <button
                  className="p-2 hover:text-primary transition-colors"
                  aria-label="Search">
                  
                  <SearchIcon
                    className={`transition-all duration-500 ${isScrolled ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  
                </button>
                <button
                  className="p-2 hover:text-primary transition-colors relative"
                  onClick={() => setIsCartOpen(true)}
                  aria-label="Open cart">
                  
                  <ShoppingBagIcon
                    className={`transition-all duration-500 ${isScrolled ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  
                  {getCartCount() > 0 &&
                  <span
                    className={`absolute bg-primary text-primary-foreground font-bold rounded-full flex items-center justify-center transition-all duration-500 ${isScrolled ? 'top-0 right-0 text-[8px] w-3.5 h-3.5' : 'top-0 right-0 text-[10px] w-4 h-4'}`}>
                    
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
            <span className="font-magazine text-2xl tracking-tight">VPPA</span>
            <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2"
            aria-label="Close menu">
            
              <XIcon className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex flex-col p-8 gap-8 text-xl uppercase tracking-widest">
            {collections.map((collection) =>
          <Link
            key={collection.id}
            to={`/collection/${collection.slug}`}
            className="hover:text-primary transition-colors">
            
                {collection.name}
              </Link>
          )}
          </nav>
        </div>
      }
    </>);

}