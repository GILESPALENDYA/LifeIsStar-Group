import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Users,
  Save, 
  Plus, 
  Trash2, 
  Info,
  ChevronLeft,
  Layout
} from 'lucide-react';
import { auth, db, OperationType, handleFirestoreError } from '../../lib/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query,
  orderBy,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { ProfileSection, Category } from '../../types';
import toast from 'react-hot-toast';

export default function ProfileSettings() {
  const [profile, setProfile] = useState<ProfileSection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [admins, setAdmins] = useState<{ id: string; email: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCat, setNewCat] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  
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
      const cSnap = await getDocs(collection(db, 'categories'));
      setCategories(cSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));

      const pSnap = await getDocs(query(collection(db, 'profile'), orderBy('order')));
      setProfile(pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProfileSection)));

      const aSnap = await getDocs(collection(db, 'admins'));
      setAdmins(aSnap.docs.map(doc => ({ id: doc.id, email: doc.id })));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'admin_profile');
    } finally {
      setLoading(false);
    }
  }

  const handleAddCategory = async () => {
    if (!newCat.trim()) return;
    try {
      await addDoc(collection(db, 'categories'), { name: newCat.trim() });
      setNewCat('');
      toast.success('Kategori ditambahkan');
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'categories');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Hapus kategori ini?')) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
      toast.success('Kategori dihapus');
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `categories/${id}`);
    }
  };

  const handleUpdateProfile = async (id: string, updates: Partial<ProfileSection>) => {
    try {
      await updateDoc(doc(db, 'profile', id), updates);
      toast.success('Konten diperbarui');
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `profile/${id}`);
    }
  };

  const handleCreateProfile = async () => {
    try {
      await addDoc(collection(db, 'profile'), {
        title: 'Judul Baru',
        content: 'Konten profil...',
        order: profile.length
      });
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'profile');
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim() || !newAdminEmail.includes('@')) return;
    try {
      const email = newAdminEmail.trim().toLowerCase();
      await setDoc(doc(db, 'admins', email), { 
        email, 
        addedAt: serverTimestamp(),
        addedBy: auth.currentUser?.email 
      });
      setNewAdminEmail('');
      toast.success('Admin ditambahkan');
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `admins/${newAdminEmail}`);
    }
  };

  const handleDeleteAdmin = async (email: string) => {
    if (email === 'gilesptw4321@gmail.com') {
      toast.error('Admin utama tidak dapat dihapus');
      return;
    }
    if (!window.confirm(`Hapus akses admin untuk ${email}?`)) return;
    try {
      await deleteDoc(doc(db, 'admins', email));
      toast.success('Akses admin dicabut');
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `admins/${email}`);
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
            <ChevronLeft className="w-4 h-4 mr-1" /> Kembali
          </button>
          <h1 className="text-3xl font-display font-bold">Pengaturan Web</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Category Management */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold flex items-center">
              <Layout className="w-5 h-5 mr-3 text-brand-accent" /> Kategori Produk
            </h2>
          </div>

          <div className="flex space-x-3">
            <input
              type="text"
              value={newCat}
              onChange={e => setNewCat(e.target.value)}
              className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none"
              placeholder="Nama kategori baru..."
            />
            <button
              onClick={handleAddCategory}
              className="p-3 bg-brand-accent text-white rounded-xl hover:bg-blue-600 transition-all font-bold"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-3">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl group">
                <span className="font-medium">{cat.name}</span>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Profile/About Management */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold flex items-center">
              <Info className="w-5 h-5 mr-3 text-brand-gold" /> Company Profile Content
            </h2>
            <button
              onClick={handleCreateProfile}
              className="p-2 bg-brand-gold/10 text-brand-gold rounded-lg hover:bg-brand-gold hover:text-black transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-6">
            {profile.map(section => (
              <div key={section.id} className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-4">
                <input
                  type="text"
                  defaultValue={section.title}
                  onBlur={e => handleUpdateProfile(section.id, { title: e.target.value })}
                  className="w-full bg-transparent text-lg font-bold border-b border-transparent focus:border-brand-accent outline-none pb-2"
                />
                <textarea
                  rows={3}
                  defaultValue={section.content}
                  onBlur={e => handleUpdateProfile(section.id, { content: e.target.value })}
                  className="w-full bg-transparent text-gray-400 text-sm border-none focus:ring-0 outline-none resize-none"
                />
                <div className="flex justify-end">
                   <button
                    onClick={() => handleDeleteDoc('profile', section.id)}
                    className="p-1 text-gray-600 hover:text-red-400"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Management Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-8 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold flex items-center">
              <Users className="w-5 h-5 mr-3 text-brand-accent" /> Kelola Tim Admin
            </h2>
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 text-blue-200 text-sm">
            <Info className="w-5 h-5 shrink-0" />
            <p>
              Admin yang ditambahkan di sini akan memiliki akses penuh ke Dashboard ini. 
              Pastikan alamat email yang didaftarkan adalah email Google yang aktif.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="email"
              value={newAdminEmail}
              onChange={e => setNewAdminEmail(e.target.value)}
              placeholder="Email Google Admin Baru..."
              className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none"
            />
            <button
              onClick={handleAddAdmin}
              className="px-6 py-3 bg-brand-accent text-white rounded-xl hover:bg-blue-600 transition-all font-bold flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Tambah Admin
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Primary Admin (Hardcoded in Rules) */}
            <div className="p-4 bg-brand-accent/10 border border-brand-accent/30 rounded-xl flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs text-brand-accent font-bold uppercase tracking-wider">Primary Admin</span>
                <span className="font-medium">gilesptw4321@gmail.com</span>
              </div>
            </div>

            {admins.filter(a => a.email !== 'gilesptw4321@gmail.com').map(admin => (
              <div key={admin.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between group">
                <span className="font-medium truncate mr-2">{admin.email}</span>
                <button
                  onClick={() => handleDeleteAdmin(admin.email)}
                  className="p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  async function handleDeleteDoc(col: string, id: string) {
    if (!window.confirm('Hapus data ini?')) return;
    try {
      await deleteDoc(doc(db, col, id));
      fetchData();
    } catch (error) {
      console.error(error);
    }
  }
}
