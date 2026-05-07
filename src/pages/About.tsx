import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Target, 
  Rocket, 
  User, 
  Quote, 
  MapPin, 
  Phone,
  ArrowRight,
  ShieldCheck,
  Award,
  Users
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface AboutSettings {
  vision?: string;
  mission?: string;
  ownerName?: string;
  ownerQuote?: string;
  ownerMessage?: string;
  ownerPhoto?: string;
  address?: string;
  phone?: string;
}

export default function About() {
  const [settings, setSettings] = useState<AboutSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const sSnap = await getDocs(collection(db, 'settings'));
        const profSettings = sSnap.docs.find(d => d.id === 'profile');
        if (profSettings) {
          setSettings(profSettings.data() as AboutSettings);
        }
      } catch (error) {
        console.error("Error fetching about settings:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-accent"></div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="text-brand-accent font-bold tracking-widest uppercase text-xs mb-4 block px-4 py-1.5 bg-brand-accent/10 rounded-full w-fit mx-auto border border-brand-accent/20">
              Tentang LIFEISSTAR
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-8 leading-tight">
              Bintang Utama Dalam <span className="text-brand-accent italic">Gaya Hidup</span> Anda
            </h1>
            <p className="text-gray-400 text-lg md:text-xl leading-relaxed">
              Dedikasi kami untuk menghadirkan kualitas terbaik, keaslian tak terbantahkan, dan layanan yang memanjakan setiap pelanggan.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-24 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div 
              whileInView={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: -20 }}
              className="p-8 md:p-12 bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-3xl"
            >
              <div className="w-16 h-16 bg-brand-accent/20 rounded-2xl flex items-center justify-center mb-8">
                <Target className="w-8 h-8 text-brand-accent" />
              </div>
              <h2 className="text-3xl font-display font-bold mb-6">Visi Kami</h2>
              <p className="text-gray-400 text-lg leading-relaxed whitespace-pre-wrap">
                {settings?.vision || "Menjadi destinasi utama yang menginspirasi gaya hidup berkualitas dengan produk-produk pilihan yang terjamin keasliannya."}
              </p>
            </motion.div>

            <motion.div 
              whileInView={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: 20 }}
              className="p-8 md:p-12 bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-3xl"
            >
              <div className="w-16 h-16 bg-brand-gold/20 rounded-2xl flex items-center justify-center mb-8">
                <Rocket className="w-8 h-8 text-brand-gold" />
              </div>
              <h2 className="text-3xl font-display font-bold mb-6">Misi Kami</h2>
              <p className="text-gray-400 text-lg leading-relaxed whitespace-pre-wrap">
                {settings?.mission || "Membangun kepercayaan pelanggan melalui transparansi produk, inovasi layanan, dan komitmen terhadap keunggulan di setiap langkah."}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Owner Section */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              whileInView={{ opacity: 1, scale: 1 }}
              initial={{ opacity: 0, scale: 0.95 }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl overflow-hidden bg-white/5 border border-white/10">
                <img 
                  src={settings?.ownerPhoto || "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1374&auto=format&fit=crop"} 
                  alt={settings?.ownerName || "Owner"}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 p-6 bg-brand-accent rounded-2xl shadow-2xl hidden md:block max-w-xs">
                <Quote className="w-8 h-8 text-white/50 mb-4" />
                <p className="text-white font-medium italic mb-2">
                  "{settings?.ownerQuote || "Kepercayaan Anda adalah semangat kami untuk terus bertumbuh."}"
                </p>
                <div className="h-px w-12 bg-white/20 mb-2" />
                <span className="text-xs font-bold uppercase tracking-widest text-white/80">{settings?.ownerName || "Founder LIFEISSTAR"}</span>
              </div>
            </motion.div>

            <div className="space-y-8">
              <span className="text-brand-accent font-bold tracking-widest uppercase text-xs">The Founder's Message</span>
              <h2 className="text-4xl font-display font-bold">Pesan Dari Pemilik</h2>
              <p className="text-gray-400 leading-relaxed text-lg italic whitespace-pre-wrap">
                "{settings?.ownerMessage || "Berawal dari semangat untuk menghadirkan yang terbaik, LIFEISSTAR lahir sebagai jawaban atas kebutuhan akan produk berkualitas yang dapat diandalkan. Kami percaya bahwa setiap pelanggan adalah bintang, dan setiap pembelian adalah awal dari hubungan jangka panjang."}"
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <ShieldCheck className="w-6 h-6 text-brand-accent mb-3" />
                  <h4 className="font-bold text-sm mb-1">Authenticity</h4>
                  <p className="text-xs text-gray-500">100% Produk Original</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <Award className="w-6 h-6 text-brand-gold mb-3" />
                  <h4 className="font-bold text-sm mb-1">Layanan Prima</h4>
                  <p className="text-xs text-gray-500">Prioritas Pelanggan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Address */}
      <section className="py-24 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-display font-bold mb-16">Hubungi Toko Kami</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div 
               whileHover={{ y: -5 }}
               className="p-8 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center"
            >
              <div className="w-12 h-12 bg-brand-accent/20 rounded-xl flex items-center justify-center mb-6">
                <MapPin className="w-6 h-6 text-brand-accent" />
              </div>
              <h3 className="font-bold mb-4">Alamat Toko</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {settings?.address || "Jl. Sudirman No. 123, Jakarta Pusat, DKI Jakarta - 10110"}
              </p>
            </motion.div>

            <motion.div 
               whileHover={{ y: -5 }}
               className="p-8 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center"
            >
              <div className="w-12 h-12 bg-brand-gold/20 rounded-xl flex items-center justify-center mb-6">
                <Phone className="w-6 h-6 text-brand-gold" />
              </div>
              <h3 className="font-bold mb-4">Nomor Telepon / WA</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {settings?.phone || "+62 812 3456 7890"}
              </p>
              <a 
                href={`https://wa.me/${settings?.phone?.replace(/\D/g, '')}`} 
                target="_blank" 
                className="mt-6 text-brand-gold font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-80 transition-all"
              >
                Chat Sekarang <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
