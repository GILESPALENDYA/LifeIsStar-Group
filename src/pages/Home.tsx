import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { motion } from 'motion/react';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { Product, Category, ProfileSection } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Testimonials } from '../components/Testimonials';
import { cn } from '../lib/utils';

const FIXED_CATEGORIES = ['Android', 'Iphone', 'MacBook', 'Tablet', 'Ipad'];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [profile, setProfile] = useState<ProfileSection[]>([]);
  const [profileTitle, setProfileTitle] = useState('Kenapa Memilih LIFEISSTAR?');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch Categories
        const catSnap = await getDocs(collection(db, 'categories'));
        const fetchedCats = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        
        // Ensure consistent categories
        const displayCats = FIXED_CATEGORIES.map(name => {
          const found = fetchedCats.find(c => c.name.toLowerCase() === name.toLowerCase());
          return found || { id: name.toLowerCase(), name };
        });
        setCategories(displayCats);

        // Fetch Profile
        const profSnap = await getDocs(query(collection(db, 'profile'), orderBy('order')));
        setProfile(profSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProfileSection)));

        // Fetch Profile Title
        try {
          const sSnap = await getDocs(collection(db, 'settings'));
          const profSettings = sSnap.docs.find(d => d.id === 'profile');
          if (profSettings) {
            setProfileTitle(profSettings.data().mainTitle || 'Kenapa Memilih LIFEISSTAR?');
          }
        } catch (e) {
          console.error("Error fetching title:", e);
        }

        // Fetch Products
        await fetchProducts('all');
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'initial_fetch');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function fetchProducts(catId: string) {
    try {
      let q = query(collection(db, 'products'), where('status', '==', 'active'));
      if (catId !== 'all') {
        q = query(q, where('categoryId', '==', catId));
      }
      const pSnap = await getDocs(q);
      setProducts(pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'products');
    }
  }

  const handleCategoryChange = (id: string) => {
    setSelectedCategory(id);
    fetchProducts(id);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center overflow-hidden px-4 py-20">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-accent/5 to-transparent opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] aspect-square bg-brand-accent/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-full flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-4xl px-4 flex flex-col items-center"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight mb-8 leading-[1.1] text-white">
              Experience the <span className="text-brand-accent">Future</span> of Tech.
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed">
              Distributor resmi Smartphone, Laptop, dan iPad terpercaya. Kualitas premium, harga kompetitif, pelayanan bintang lima.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full sm:w-auto">
              <a 
                href="#catalog"
                className="w-full sm:w-auto px-10 py-4 bg-brand-accent text-white font-semibold rounded-full hover:bg-blue-600 transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)] active:scale-95 text-center"
              >
                Mulai Belanja
              </a>
              <a 
                href="#about"
                className="w-full sm:w-auto px-10 py-4 bg-white/5 text-white font-semibold rounded-full border border-white/10 hover:bg-white/10 transition-all active:scale-95 text-center"
              >
                Tentang Kami
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Catalog Section */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="flex flex-col items-center text-center mb-12 space-y-8">
          <div>
            <h2 className="text-4xl font-display font-bold mb-4">Katalog Produk</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Temukan gadget impian Kamu dengan harga terbaik dan garansi resmi.</p>
          </div>
          
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => handleCategoryChange('all')}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-medium border transition-all",
                selectedCategory === 'all' 
                  ? "bg-brand-accent border-brand-accent text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
                  : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
              )}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-medium border transition-all",
                  selectedCategory === cat.id 
                    ? "bg-brand-accent border-brand-accent text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
                    : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl h-[400px] animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-gray-500 italic">Belum ada produk untuk kategori ini.</p>
          </div>
        )}
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* About Section */}
      <section id="about" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
        <div className="text-center">
          <span className="text-brand-accent font-semibold tracking-wider uppercase text-sm mb-4 block">Our Identity</span>
          <h2 className="text-4xl font-display font-bold mb-12">{profileTitle}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
            {profile.map((item) => (
              <div key={item.id} className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-brand-accent/50 transition-all overflow-hidden break-words">
                <h3 className="text-xl font-semibold mb-3 group-hover:text-brand-accent transition-colors break-words">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm break-words">{item.content}</p>
              </div>
            ))}
            
            {profile.length === 0 && (
              <>
                <div className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-brand-accent/50 transition-all overflow-hidden break-words">
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-brand-accent transition-colors break-words">Produk Original</h3>
                  <p className="text-gray-400 leading-relaxed text-sm break-words">Kami menjamin semua produk yang kami jual 100% original dan bergaransi resmi.</p>
                </div>
                <div className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-brand-accent/50 transition-all overflow-hidden break-words">
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-brand-accent transition-colors break-words">Harga Bersaing</h3>
                  <p className="text-gray-400 leading-relaxed text-sm break-words">Dapatkan penawaran terbaik di pasar tanpa mengorbankan kualitas layanan.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
