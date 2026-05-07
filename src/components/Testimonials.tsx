import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Testimonial } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Quote, User, ChevronLeft, ChevronRight } from 'lucide-react';

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'), limit(10));
        const snap = await getDocs(q);
        setTestimonials(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial)));
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      }
    }
    fetchTestimonials();
  }, []);

  const [itemsPerView, setItemsPerView] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setItemsPerView(3);
      else if (window.innerWidth >= 768) setItemsPerView(2);
      else setItemsPerView(1);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const next = () => {
    setCurrentIndex((prev) => {
      const maxIndex = Math.max(0, testimonials.length - itemsPerView);
      return prev >= maxIndex ? 0 : prev + 1;
    });
  };

  const prev = () => {
    setCurrentIndex((prev) => {
      const maxIndex = Math.max(0, testimonials.length - itemsPerView);
      return prev <= 0 ? maxIndex : prev - 1;
    });
  };

  // Auto play
  useEffect(() => {
    if (testimonials.length === 0) return;
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length, itemsPerView]);

  const getX = () => {
    const slipPerItem = 100 / itemsPerView;
    const gap = 24 / itemsPerView; // approximate gap compensation
    return `calc(-${currentIndex * slipPerItem}% - ${currentIndex * (24 - gap)}px)`;
  };

  if (testimonials.length === 0) return null;

  return (
    <section className="py-24 relative overflow-hidden bg-[#0A0A0A]">
      {/* Background accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-accent/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-gold/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-brand-accent text-sm font-bold uppercase tracking-widest"
          >
            Testimonial
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-bold mt-4"
          >
            Apa Kata Mereka?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 mt-6 max-w-2xl mx-auto text-lg"
          >
            Kepuasan pelanggan adalah prioritas utama kami. Berikut adalah pengalaman tulus dari para pelanggan setia Life Is Star.
          </motion.p>
        </div>

        <div className="relative group">
          <div className="overflow-hidden py-10">
            <motion.div
              className="flex gap-6"
              animate={{ x: getX() }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {testimonials.map((t) => (
                <div 
                  key={t.id} 
                  className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] shrink-0"
                  style={{ flex: "0 0 auto" }}
                >
                  <div className="bg-white/5 border border-white/10 p-8 rounded-3xl relative backdrop-blur-sm h-full flex flex-col hover:border-brand-accent/30 transition-all">
                    <Quote className="absolute top-6 right-8 w-12 h-12 text-white/5" />
                    
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                        {t.avatarUrl ? (
                          <img src={t.avatarUrl} alt={t.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg leading-tight">{t.name}</h4>
                        {t.role && <p className="text-sm text-gray-500 mt-0.5">{t.role}</p>}
                      </div>
                    </div>

                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}`}
                        />
                      ))}
                    </div>

                    <p className="text-gray-300 leading-relaxed italic block relative flex-grow">
                      "{t.content}"
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Navigation Buttons */}
          <button 
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-brand-accent hover:border-brand-accent transition-all opacity-0 group-hover:opacity-100 z-10 hidden md:flex"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button 
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-brand-accent hover:border-brand-accent transition-all opacity-0 group-hover:opacity-100 z-10 hidden md:flex"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.slice(0, Math.max(1, testimonials.length - itemsPerView + 1)).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'w-8 bg-brand-accent' : 'bg-white/20'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
