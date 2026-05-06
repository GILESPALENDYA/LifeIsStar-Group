import { motion } from 'motion/react';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../lib/utils';
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
      <div className="aspect-square overflow-hidden bg-white/5">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Content */}
      <div className="p-5 text-center flex flex-col items-center">
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1 group-hover:text-brand-accent transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-gray-400 mb-4 line-clamp-2 h-10 mx-auto max-w-[200px]">
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
            to={`/product/${product.id}?action=buy`}
            className="flex items-center text-sm font-medium text-brand-accent hover:text-brand-accent/80 transition-colors"
          >
            Beli
            <ExternalLink className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
