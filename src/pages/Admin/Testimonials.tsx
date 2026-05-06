import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare,
  Plus, 
  Trash2, 
  ChevronLeft,
  Star,
  User,
  X,
  Save,
  Upload,
  Link as LinkIcon
} from 'lucide-react';
import { auth, db, OperationType, handleFirestoreError } from '../../lib/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  query,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import React, { useRef } from 'react';

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageTab, setImageTab] = useState<'url' | 'upload'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    content: '',
    rating: 5,
    avatarUrl: ''
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate('/admin');
    });
    fetchData();
    return () => unsubscribe();
  }, [navigate]);

  async function fetchData() {
    try {
      setLoading(true);
      const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setTestimonials(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial)));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'testimonials');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'testimonials'), {
        ...formData,
        createdAt: serverTimestamp()
      });
      toast.success('Testimoni ditambahkan');
      setIsModalOpen(false);
      setFormData({ name: '', role: '', content: '', rating: 5, avatarUrl: '' });
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'testimonials');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // Limit to 5MB
      toast.error('Avatar terlalu besar. Maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, avatarUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };
  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus testimoni ini?')) return;
    try {
      await deleteDoc(doc(db, 'testimonials', id));
      toast.success('Testimoni dihapus');
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `testimonials/${id}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center text-sm text-gray-500 hover:text-white mb-2"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Dashboard
          </button>
          <h1 className="text-3xl font-display font-bold">Kelola Testimoni</h1>
          <p className="text-gray-400 mt-1">Daftar apa yang dikatakan pelanggan tentang kami.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-brand-accent text-white rounded-xl hover:bg-blue-600 transition-all font-bold flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Testimoni Baru
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div>
        </div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
          <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold">Belum ada testimoni</h3>
          <p className="text-gray-500 mt-2">Mulai tambahkan testimoni dari pelanggan setia Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={t.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 relative group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden shrink-0 border border-white/5">
                  {t.avatarUrl ? (
                    <img src={t.avatarUrl} alt={t.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold">{t.name}</h4>
                  {t.role && <p className="text-xs text-gray-500">{t.role}</p>}
                </div>
              </div>

              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                  />
                ))}
              </div>

              <p className="text-gray-300 text-sm italic">"{t.content}"</p>

              <button
                onClick={() => handleDelete(t.id)}
                className="absolute top-4 right-4 p-2 text-gray-600 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-[#111] border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4">
                 <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white">
                   <X className="w-6 h-6" />
                 </button>
              </div>

              <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-3 text-brand-accent">
                <MessageSquare className="w-6 h-6" /> Testimoni Baru
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Nama Customer</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none transition-all"
                    placeholder="Contoh: Budi Santoso"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Pekerjaan / Role (Optional)</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none transition-all"
                    placeholder="Contoh: Photographer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Avatar Customer</label>
                  <div className="flex bg-white/5 p-1 rounded-xl mb-3">
                    <button 
                      type="button" 
                      onClick={() => setImageTab('upload')}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${imageTab === 'upload' ? "bg-brand-accent text-white" : "text-gray-500 hover:text-white"}`}
                    >
                      <Upload className="w-3 h-3" /> UPLOAD
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setImageTab('url')}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${imageTab === 'url' ? "bg-brand-accent text-white" : "text-gray-500 hover:text-white"}`}
                    >
                      <LinkIcon className="w-3 h-3" /> URL
                    </button>
                  </div>

                  {imageTab === 'upload' ? (
                    <div className="flex items-center gap-4">
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-16 h-16 rounded-full bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-brand-accent/50 transition-all overflow-hidden shrink-0"
                      >
                        {formData.avatarUrl && formData.avatarUrl.startsWith('data:') ? (
                          <img src={formData.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <Upload className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-gray-500">Klik lingkaran untuk upload avatar</p>
                        <p className="text-[10px] text-gray-700 mt-0.5">Maks 5MB</p>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={formData.avatarUrl.startsWith('data:') ? '' : formData.avatarUrl}
                      onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none transition-all"
                      placeholder="https://..."
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Rating</label>
                  <select
                    value={formData.rating}
                    onChange={e => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none transition-all"
                  >
                    {[5,4,3,2,1].map(num => (
                      <option key={num} value={num} className="bg-[#1a1a1a]">{num} Bintang</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Testimoni</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none transition-all resize-none"
                    placeholder="Tulis testimoni customer di sini..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-brand-accent text-white rounded-xl hover:bg-blue-600 transition-all font-bold flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" /> Simpan Testimoni
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
