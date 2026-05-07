import { motion } from 'motion/react';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

import React from 'react';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-brand-accent/50 transition-colors"
    >
      {/* Image Container */}
      <div className="aspect-square overflow-hidden bg-white/5 relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          className={cn(
            "w-full h-full object-cover group-hover:scale-110 transition-transform duration-500",
            product.stock === 0 && "opacity-50 grayscale"
          )}
          referrerPolicy="no-referrer"
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-red-500/90 text-white px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider backdrop-blur-sm">
              Stock Habis
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 text-center flex flex-col items-center">
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1 group-hover:text-brand-accent transition-colors break-words w-full">
          {product.name}
        </h3>
        <p className="text-sm text-gray-400 mb-4 line-clamp-2 h-10 mx-auto max-w-full break-words">
          {product.description}
        </p>
        <p className="text-xl font-bold text-brand-accent mb-6">
          {formatCurrency(product.price)}
        </p>

        <div className="flex items-center justify-center space-x-4 w-full pt-4 border-t border-white/5">
          <Link
            to={`/product/${product.id}`}
            className="flex items-center text-sm font-medium text-gray-300 hover:text-white group/btn"
          >
            Lihat Detail
            <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
          
          <div className="w-px h-4 bg-white/10" />

          <Link
            to={product.stock > 0 ? `/product/${product.id}?action=buy` : '#'}
            onClick={(e) => product.stock === 0 && e.preventDefault()}
            className={cn(
              "flex items-center text-sm font-medium transition-colors",
              product.stock > 0 ? "text-brand-accent hover:text-brand-accent/80" : "text-gray-600 cursor-not-allowed"
            )}
          >
            Beli
            <ExternalLink className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
