import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Katalog', path: '/' },
    { name: 'Tentang Kami', path: '/about' },
  ];

  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-bg/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <ShoppingBag className="w-8 h-8 text-brand-accent" />
              <span className="text-xl font-display font-bold tracking-tight">LIFEISSTAR</span>
            </Link>
          </div>

          {!isAdminPath && (
            <>
              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
                <Link
                  to="/admin"
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Admin Panel"
                >
                  <ShieldCheck className="w-5 h-5" />
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden flex items-center">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </>
          )}

          {isAdminPath && (
             <div className="flex items-center space-x-4">
               <span className="text-xs font-medium text-brand-accent px-2 py-1 bg-brand-accent/10 rounded-full border border-brand-accent/20">
                 ADMIN PANEL
               </span>
               <Link to="/" className="text-sm font-medium text-gray-400 hover:text-white">
                 Lihat Web
               </Link>
             </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-brand-bg border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-4 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-4 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg"
                >
                  Admin Panel
                </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
