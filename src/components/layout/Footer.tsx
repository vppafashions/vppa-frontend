import React from 'react';
import { Link } from 'react-router-dom';
import { collections } from '../../data/collections';

type IconProps = { className?: string };
const InstagramIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.26.07 1.65.07 4.85s0 3.6-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.26.06-1.65.07-4.85.07s-3.6 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.21 15.6 2.2 15.2 2.2 12s0-3.6.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.4 2.21 8.8 2.2 12 2.2zm0 1.8c-3.15 0-3.5 0-4.74.07-.94.04-1.45.2-1.79.34-.45.17-.77.38-1.11.72-.34.34-.55.66-.72 1.11-.13.34-.3.85-.34 1.79C3.04 8.5 3 8.85 3 12s0 3.5.07 4.74c.04.94.2 1.45.34 1.79.17.45.38.77.72 1.11.34.34.66.55 1.11.72.34.13.85.3 1.79.34C8.5 20.96 8.85 21 12 21s3.5 0 4.74-.07c.94-.04 1.45-.2 1.79-.34.45-.17.77-.38 1.11-.72.34-.34.55-.66.72-1.11.13-.34.3-.85.34-1.79.06-1.24.07-1.59.07-4.74s0-3.5-.07-4.74c-.04-.94-.2-1.45-.34-1.79a3 3 0 00-.72-1.11 3 3 0 00-1.11-.72c-.34-.13-.85-.3-1.79-.34C15.5 4.04 15.15 4 12 4zm0 3.05a4.95 4.95 0 110 9.9 4.95 4.95 0 010-9.9zm0 1.8a3.15 3.15 0 100 6.3 3.15 3.15 0 000-6.3zm5.15-2.04a1.16 1.16 0 110 2.31 1.16 1.16 0 010-2.31z" />
  </svg>
);
const YoutubeIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 00.5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 002.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 002.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4l6.4 3.6-6.4 3.6z" />
  </svg>
);
const FacebookIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M22 12.07C22 6.5 17.52 2 12 2S2 6.5 2 12.07c0 5 3.66 9.13 8.44 9.93v-7.02H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.91h-2.33V22c4.78-.8 8.44-4.93 8.44-9.93z" />
  </svg>
);
const WhatsappIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M19.05 4.91A9.82 9.82 0 0012.04 2C6.59 2 2.16 6.43 2.16 11.88c0 1.74.46 3.44 1.32 4.94L2 22l5.32-1.4a9.86 9.86 0 004.71 1.2h.01c5.45 0 9.88-4.43 9.88-9.88 0-2.64-1.03-5.12-2.87-6.99zM12.04 20.13h-.01a8.2 8.2 0 01-4.18-1.14l-.3-.18-3.16.83.84-3.08-.2-.32a8.2 8.2 0 01-1.26-4.36c0-4.54 3.69-8.23 8.24-8.23a8.2 8.2 0 015.83 2.41 8.2 8.2 0 012.41 5.83c0 4.54-3.69 8.24-8.24 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43-.14-.01-.31-.01-.48-.01a.92.92 0 00-.66.31c-.23.25-.87.85-.87 2.07s.89 2.4 1.02 2.57c.12.16 1.76 2.69 4.27 3.77.6.26 1.06.41 1.42.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.23-.18-.48-.3z" />
  </svg>
);
const TelegramIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
  </svg>
);
const MapPinIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2a8 8 0 00-8 8c0 5.4 7.05 11.43 7.35 11.68a1 1 0 001.3 0C12.95 21.43 20 15.4 20 10a8 8 0 00-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z" />
  </svg>
);

const SOCIAL_LINKS = [
  { name: 'Instagram', href: 'https://www.instagram.com/vppa_fashions?igsh=ZTZiNDFhcmx2bnox', Icon: InstagramIcon },
  { name: 'YouTube', href: 'https://youtube.com/@VPPA_fashions?si=uR175OmhS8k4R06b', Icon: YoutubeIcon },
  { name: 'Facebook', href: 'https://www.facebook.com/share/1G8UxJTThR/', Icon: FacebookIcon },
  { name: 'WhatsApp', href: 'https://whatsapp.com/channel/0029Vb6NM3P4Y9lgn9SpRx1N', Icon: WhatsappIcon },
  { name: 'Telegram', href: 'https://t.me/VPPAfashions', Icon: TelegramIcon },
  { name: 'Shop Location', href: 'https://maps.app.goo.gl/CizcZjAoyRkcRNVY7?g_st=ic', Icon: MapPinIcon },
];
export function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-[#faf9f6] pt-20 pb-10">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <Link
              to="/"
              className="font-magazine text-5xl font-light tracking-tight block mb-6">
              
              VPPA
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs mb-6">
              Redefining presence through uncompromising quality and fearless
              expression. Luxury menswear for the modern era.
            </p>
            <div className="text-sm text-gray-400 leading-relaxed max-w-xs">
              <p className="text-primary text-xs uppercase tracking-widest font-semibold mb-2">
                Visit Us
              </p>
              <p>No.161/1, Ground Floor,</p>
              <p>100 Feet Rd, 3rd Block,</p>
              <p>Sir M Vishveswaraya Layout,</p>
              <p>Ullal, Bengaluru, Karnataka 560110</p>
              <p className="mt-2">Phone: +91 90716 91999</p>
              <p>GSTIN: 29DLFPG6129H1ZY</p>
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
                <Link to="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/shipping-returns" className="hover:text-white transition-colors">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-white transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-widest font-semibold mb-6 text-primary">
              Connect
            </h4>
            <div className="flex flex-wrap items-center gap-4 text-gray-400">
              {SOCIAL_LINKS.map(({ name, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  title={name}
                  className="flex items-center justify-center size-10 rounded-full border border-gray-700 hover:border-white hover:text-white transition-colors">
                  <Icon className="size-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} VPPA. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>);

}
