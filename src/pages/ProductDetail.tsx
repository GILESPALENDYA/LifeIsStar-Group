import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { motion } from 'motion/react';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { Product, MarketplaceLinks } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { ArrowLeft, ExternalLink, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [links, setLinks] = useState<MarketplaceLinks | null>(null);
  const [loading, setLoading] = useState(true);
  const lastCountedId = useRef<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      try {
        setLoading(true);
        const pSnap = await getDoc(doc(db, 'products', id));
        if (pSnap.exists()) {
          setProduct({ id: pSnap.id, ...pSnap.data() } as Product);
          
          // Increment views only once per product visit
          if (lastCountedId.current !== id) {
            lastCountedId.current = id;
            updateDoc(doc(db, 'products', id), {
              views: increment(1)
            }).catch(err => console.error("Error incrementing views:", err));
          }

          const lSnap = await getDoc(doc(db, 'products', id, 'links', 'main'));
          if (lSnap.exists()) {
            setLinks(lSnap.data() as MarketplaceLinks);
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `products/${id}`);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Produk tidak ditemukan</h2>
        <Link to="/" className="text-brand-accent hover:underline">Kembali ke Katalog</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Kembali ke Katalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Gallery */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative aspect-square rounded-3xl overflow-hidden bg-white/5 border border-white/10"
        >
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">{product.name}</h1>
          <p className="text-3xl font-bold text-brand-accent mb-2">{formatCurrency(product.price)}</p>
          <div className="flex items-center gap-2 mb-8">
            <span className={cn(
              "text-xs font-bold uppercase px-2 py-1 rounded-md border",
              product.stock > 0 
                ? "bg-green-400/10 border-green-400/20 text-green-400" 
                : "bg-red-400/10 border-red-400/20 text-red-400"
            )}>
              {product.stock > 0 ? `Stock: ${product.stock}` : 'Stock Habis'}
            </span>
          </div>
          
          <div className="prose prose-invert max-w-none mb-10">
            <h3 className="text-lg font-semibold text-white mb-3 font-display">Deskripsi Produk</h3>
            <p className="text-gray-400 whitespace-pre-wrap leading-relaxed">{product.description}</p>
          </div>

          <div className="space-y-6 mb-12">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <ShieldCheck className="w-6 h-6 text-brand-gold" />
              </div>
              <div>
                <h4 className="font-medium">Garansi Resmi</h4>
                <p className="text-sm text-gray-400">Jaminan keaslian dan layanan purnajual.</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <Truck className="w-6 h-6 text-brand-accent" />
              </div>
              <div>
                <h4 className="font-medium">Pengiriman Aman</h4>
                <p className="text-sm text-gray-400">Packing kayu & asuransi untuk setiap pengiriman.</p>
              </div>
            </div>
          </div>

          {/* Checkout Options */}
          <div className="mt-auto">
            <h3 className="text-lg font-semibold mb-4 font-display">Beli di Marketplace</h3>
            {product.stock > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {links?.tokopedia && (
                  <a
                    href={links.tokopedia}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-4 py-3 bg-[#42b549] text-white rounded-xl hover:opacity-90 transition-all font-medium"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Tokopedia
                  </a>
                )}
                {links?.shopee && (
                  <a
                    href={links.shopee}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-4 py-3 bg-[#ee4d2d] text-white rounded-xl hover:opacity-90 transition-all font-medium"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Shopee
                  </a>
                )}
                {links?.blibli && (
                  <a
                    href={links.blibli}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-4 py-3 bg-[#0095da] text-white rounded-xl hover:opacity-90 transition-all font-medium"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    BliBli
                  </a>
                )}
                {!links?.tokopedia && !links?.shopee && !links?.blibli && (
                  <p className="text-gray-500 italic text-sm col-span-full">Link belum tersedia. Silakan hubungi admin.</p>
                )}
              </div>
            ) : (
              <div className="p-4 bg-red-400/10 border border-red-400/20 rounded-xl text-center">
                <p className="text-red-400 font-bold uppercase tracking-widest text-sm">Maaf, Stok Sedang Kosong</p>
                <p className="text-gray-500 text-xs mt-1 italic">Silakan hubungi admin untuk informasi restock</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
