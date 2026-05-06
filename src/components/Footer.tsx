import { ShoppingBag } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black/40 border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-6 h-6 text-brand-accent" />
            <span className="text-lg font-display font-bold">LIFEISSTAR</span>
          </div>
          
          <div className="text-sm text-gray-500">
            © 2024 LIFEISSTAR. All rights reserved.
          </div>
          
          <div className="flex space-x-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white">Tokopedia</a>
            <a href="#" className="hover:text-white">Shopee</a>
            <a href="#" className="hover:text-white">BliBli</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
