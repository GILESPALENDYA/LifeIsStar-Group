import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Testimonial } from '../types';
import { motion } from 'motion/react';
import { Star, Quote, User } from 'lucide-react';

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'), limit(6));
        const snap = await getDocs(q);
        setTestimonials(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial)));
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      }
    }
    fetchTestimonials();
  }, []);

  if (testimonials.length === 0) return null;

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-accent/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-gold/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-brand-accent text-sm font-bold uppercase tracking-widest"
          >
            Testimonial
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-bold mt-4"
          >
            Apa Kata Mereka?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 mt-6 max-w-2xl mx-auto text-lg"
          >
            Kepuasan pelanggan adalah prioritas utama kami. Berikut adalah pengalaman tulus dari para pelanggan setia Life Is Star.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 border border-white/10 p-8 rounded-3xl relative backdrop-blur-sm group hover:border-brand-accent/30 transition-all"
            >
              <Quote className="absolute top-6 right-8 w-12 h-12 text-white/5 group-hover:text-brand-accent/10 transition-colors" />
              
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

              <p className="text-gray-300 leading-relaxed italic block relative">
                "{t.content}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
