import React from 'react';
import { Link } from 'react-router-dom';
import { collections } from '../../data/collections';
export function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-[#faf9f6] pt-20 pb-10">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <Link to="/" className="block mb-6">
              <img src="/vppalogo.svg" alt="VPPA" className="h-12 w-auto invert" />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs mb-6">
              Redefining presence through uncompromising quality and fearless
              expression. Luxury menswear for the modern era.
            </p>
            <div className="text-sm text-gray-400 leading-relaxed max-w-xs">
              <p className="text-primary text-xs uppercase tracking-widest font-semibold mb-2">
                Visit Us
              </p>
              <p>Ground Floor, Sir M, No.161/1,</p>
              <p>100 Feet Rd, 3rd Block,</p>
              <p>Sir M Vishveswaraya Layout,</p>
              <p>Jnana Ganga Nagar, Ullal,</p>
              <p>Bengaluru, Karnataka 560110</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-widest font-semibold mb-6 text-primary">
              Collections
            </h4>
            <ul className="space-y-4 text-sm text-gray-400">
              {collections.map((c) =>
              <li key={c.id}>
                  <Link
                  to={`/collection/${c.slug}`}
                  className="hover:text-white transition-colors">
                  
                    {c.name}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-widest font-semibold mb-6 text-primary">
              Client Services
            </h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Shipping & Returns
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Track Order
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-widest font-semibold mb-6 text-primary">
              Connect
            </h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Pinterest
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} VPPA. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>);

}