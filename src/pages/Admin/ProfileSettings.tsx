import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
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
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

export default function ProfileSettings() {
  const [profile, setProfile] = useState<ProfileSection[]>([]);
  const [profileTitle, setProfileTitle] = useState('Kenapa Memilih LIFEISSTAR?');
  const [aboutSettings, setAboutSettings] = useState({
    vision: '',
    mission: '',
    ownerName: '',
    ownerQuote: '',
    ownerMessage: '',
    ownerPhoto: '',
    address: '',
    phone: ''
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [admins, setAdmins] = useState<{ id: string; email: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCat, setNewCat] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [savingTitle, setSavingTitle] = useState(false);

  // Dialog States
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info' | 'success';
    onConfirm: () => void;
    isLoading?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => {},
  });

  const [successConfig, setSuccessConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
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
      const cSnap = await getDocs(collection(db, 'categories'));
      setCategories(cSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));

      const pSnap = await getDocs(query(collection(db, 'profile'), orderBy('order')));
      setProfile(pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProfileSection)));

      // Fetch Profile Settings (Title)
      try {
        const sSnap = await getDocs(collection(db, 'settings'));
        const profSettings = sSnap.docs.find(d => d.id === 'profile');
        if (profSettings) {
          const data = profSettings.data();
          setProfileTitle(data.mainTitle || 'Kenapa Memilih LIFEISSTAR?');
          setAboutSettings({
            vision: data.vision || '',
            mission: data.mission || '',
            ownerName: data.ownerName || '',
            ownerQuote: data.ownerQuote || '',
            ownerMessage: data.ownerMessage || '',
            ownerPhoto: data.ownerPhoto || '',
            address: data.address || '',
            phone: data.phone || ''
          });
        }
      } catch (e) {
        console.error("Error fetching profile settings:", e);
      }

      const aSnap = await getDocs(collection(db, 'admins'));
      setAdmins(aSnap.docs.map(doc => ({ id: doc.id, email: doc.id })));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'admin_profile');
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateProfileTitle = async () => {
    try {
      setSavingTitle(true);
      await setDoc(doc(db, 'settings', 'profile'), { 
        mainTitle: profileTitle,
        ...aboutSettings,
        updatedAt: serverTimestamp()
      }, { merge: true });
      toast.success('Pembaruan tersimpan');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/profile');
    } finally {
      setSavingTitle(false);
    }
  };

  const handleAboutPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File terlalu besar (Maks 2MB)');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setAboutSettings({ ...aboutSettings, ownerPhoto: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleAddCategory = () => {
    if (!newCat.trim()) return;
    setConfirmConfig({
      isOpen: true,
      title: 'Tambah Kategori?',
      message: `Apakah Anda ingin menambahkan kategori "${newCat.trim()}" ke daftar produk?`,
      type: 'info',
      onConfirm: async () => {
        try {
          setConfirmConfig(prev => ({ ...prev, isLoading: true }));
          await addDoc(collection(db, 'categories'), { name: newCat.trim() });
          setNewCat('');
          setConfirmConfig(prev => ({ ...prev, isOpen: false, isLoading: false }));
          
          setSuccessConfig({
            isOpen: true,
            title: 'Kategori Ditambahkan',
            message: 'Kategori baru telah berhasil ditambahkan.'
          });
          
          fetchData();
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, 'categories');
          setConfirmConfig(prev => ({ ...prev, isOpen: false, isLoading: false }));
        }
      }
    });
  };

  const handleDeleteCategory = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Hapus Kategori?',
      message: 'Apakah Anda yakin ingin menghapus kategori ini? Produk dalam kategori ini mungkin tidak memiliki kategori induk lagi.',
      type: 'danger',
      onConfirm: async () => {
        try {
          setConfirmConfig(prev => ({ ...prev, isLoading: true }));
          await deleteDoc(doc(db, 'categories', id));
          setConfirmConfig(prev => ({ ...prev, isOpen: false, isLoading: false }));
          
          setSuccessConfig({
            isOpen: true,
            title: 'Kategori Dihapus',
            message: 'Kategori telah berhasil dihapus.'
          });
          
          fetchData();
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `categories/${id}`);
          setConfirmConfig(prev => ({ ...prev, isOpen: false, isLoading: false }));
        }
      }
    });
  };

  const handleUpdateProfile = async (id: string, updates: Partial<ProfileSection>) => {
    try {
      await updateDoc(doc(db, 'profile', id), updates);
      toast.success('Pembaruan tersimpan secara otomatis');
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `profile/${id}`);
    }
  };

  const handleCreateProfile = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Tambah Seksi Profil?',
      message: 'Apakah Anda ingin menambah seksi baru pada profil perusahaan?',
      type: 'info',
      onConfirm: async () => {
        try {
          setConfirmConfig(prev => ({ ...prev, isLoading: true }));
          await addDoc(collection(db, 'profile'), {
            title: 'Judul Baru',
            content: 'Konten profil...',
            order: profile.length
          });
          setConfirmConfig(prev => ({ ...prev, isOpen: false, isLoading: false }));
          setSuccessConfig({
            isOpen: true,
            title: 'Seksi Ditambahkan',
            message: 'Seksi profil baru telah ditambahkan.'
          });
          fetchData();
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, 'profile');
          setConfirmConfig(prev => ({ ...prev, isOpen: false, isLoading: false }));
        }
      }
    });
  };

  const handleAddAdmin = () => {
    if (!newAdminEmail.trim() || !newAdminEmail.includes('@')) return;
    setConfirmConfig({
      isOpen: true,
      title: 'Tambah Admin?',
      message: `Apakah Anda yakin ingin memberikan akses admin kepada ${newAdminEmail.trim().toLowerCase()}?`,
      type: 'warning',
      onConfirm: async () => {
        try {
          setConfirmConfig(prev => ({ ...prev, isLoading: true }));
          const email = newAdminEmail.trim().toLowerCase();
          await setDoc(doc(db, 'admins', email), { 
            email, 
            addedAt: serverTimestamp(),
            addedBy: auth.currentUser?.email 
          });
          setNewAdminEmail('');
          setConfirmConfig(prev => ({ ...prev, isOpen: false, isLoading: false }));
          
          setSuccessConfig({
            isOpen: true,
            title: 'Admin Ditambahkan',
            message: 'Akses admin baru telah berhasil didaftarkan.'
          });
          
          fetchData();
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `admins/${newAdminEmail}`);
          setConfirmConfig(prev => ({ ...prev, isOpen: false, isLoading: false }));
        }
      }
    });
  };

  const handleDeleteAdmin = (email: string) => {
    if (email === 'gilesptw4321@gmail.com') {
      toast.error('Admin utama tidak dapat dihapus');
      return;
    }
    
    setConfirmConfig({
      isOpen: true,
      title: 'Cabut Akses Admin?',
      message: `Apakah Anda yakin ingin mencabut akses admin untuk ${email}? User ini tidak akan bisa lagi mengakses Dashboard CMS.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          setConfirmConfig(prev => ({ ...prev, isLoading: true }));
          await deleteDoc(doc(db, 'admins', email));
          setConfirmConfig(prev => ({ ...prev, isOpen: false, isLoading: false }));
          
          setSuccessConfig({
            isOpen: true,
            title: 'Akses Dicabut',
            message: `Akses admin untuk ${email} telah berhasil dicabut.`
          });
          
          fetchData();
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `admins/${email}`);
          setConfirmConfig(prev => ({ ...prev, isOpen: false, isLoading: false }));
        }
      }
    });
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
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

          <div className="p-4 bg-brand-accent/5 border border-brand-accent/20 rounded-xl space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-accent">Judul Utama Seksi About</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={profileTitle}
                onChange={e => setProfileTitle(e.target.value)}
                className="flex-grow bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-accent outline-none"
                placeholder="Kenapa Memilih LIFEISSTAR?"
              />
              <button
                onClick={handleUpdateProfileTitle}
                disabled={savingTitle}
                className="px-3 py-2 bg-brand-accent text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-all disabled:opacity-50"
              >
                {savingTitle ? '...' : <Save className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {profile.map(section => (
              <div key={section.id} className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-4">
                <input
                  type="text"
                  value={section.title || ''}
                  onChange={e => {
                    const newProfile = [...profile];
                    const index = newProfile.findIndex(p => p.id === section.id);
                    if (index !== -1) {
                      newProfile[index] = { ...newProfile[index], title: e.target.value };
                      setProfile(newProfile);
                    }
                  }}
                  onBlur={e => handleUpdateProfile(section.id, { title: e.target.value })}
                  className="w-full bg-transparent text-lg font-bold border-b border-transparent focus:border-brand-accent outline-none pb-2"
                />
                <textarea
                  rows={3}
                  value={section.content || ''}
                  onChange={e => {
                    const newProfile = [...profile];
                    const index = newProfile.findIndex(p => p.id === section.id);
                    if (index !== -1) {
                      newProfile[index] = { ...newProfile[index], content: e.target.value };
                      setProfile(newProfile);
                    }
                  }}
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

        {/* Dedicated Card for About Us Page */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-8 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-accent/20 rounded-2xl flex items-center justify-center">
                <Info className="w-6 h-6 text-brand-accent" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold">Pengaturan Halaman Tentang Kami</h2>
                <p className="text-xs text-gray-500">Kelola visi, misi, dan informasi pemilik toko</p>
              </div>
            </div>
            <button
              onClick={handleUpdateProfileTitle}
              disabled={savingTitle}
              className="px-6 py-3 bg-brand-accent text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {savingTitle ? '...' : 'Simpan Perubahan'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold text-brand-accent tracking-widest">Visi Toko</label>
                <textarea 
                  value={aboutSettings.vision}
                  onChange={e => setAboutSettings({...aboutSettings, vision: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-brand-accent outline-none min-h-[120px]"
                  placeholder="Apa impian besar LIFEISSTAR?"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold text-brand-accent tracking-widest">Misi Toko</label>
                <textarea 
                  value={aboutSettings.mission}
                  onChange={e => setAboutSettings({...aboutSettings, mission: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-brand-accent outline-none min-h-[120px]"
                  placeholder="Bagaimana cara kita mencapainya?"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-grow space-y-4">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold text-brand-accent tracking-widest">Nama Pemilik</label>
                    <input 
                      type="text"
                      value={aboutSettings.ownerName}
                      onChange={e => setAboutSettings({...aboutSettings, ownerName: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-brand-accent outline-none"
                      placeholder="Nama Founder..."
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold text-brand-accent tracking-widest">Quote Singkat</label>
                    <textarea 
                      value={aboutSettings.ownerQuote}
                      onChange={e => setAboutSettings({...aboutSettings, ownerQuote: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-brand-accent outline-none min-h-[80px] italic"
                      placeholder="Sapaan atau motivasi singkat..."
                    />
                  </div>
                </div>

                <div className="space-y-3 text-center shrink-0">
                  <label className="text-[10px] uppercase font-bold text-brand-accent tracking-widest block">Foto Pemilik</label>
                  <div 
                    onClick={() => document.getElementById('owner-photo-input')?.click()}
                    className="w-36 h-36 mx-auto rounded-3xl bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer overflow-hidden group hover:border-brand-accent/50 transition-all shadow-inner"
                  >
                    {aboutSettings.ownerPhoto ? (
                      <img src={aboutSettings.ownerPhoto} className="w-full h-full object-cover" />
                    ) : (
                      <Plus className="w-8 h-8 text-gray-700 group-hover:text-brand-accent" />
                    )}
                  </div>
                  <input id="owner-photo-input" type="file" accept="image/*" className="hidden" onChange={handleAboutPhotoUpload} />
                  <p className="text-[10px] text-gray-600">JPG/PNG, Max 2MB</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold text-brand-accent tracking-widest">Pesan Lengkap Dari Pemilik</label>
                <textarea 
                  value={aboutSettings.ownerMessage}
                  onChange={e => setAboutSettings({...aboutSettings, ownerMessage: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-brand-accent outline-none min-h-[160px]"
                  placeholder="Ceritakan latar belakang LIFEISSTAR lebih mendalam..."
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/5 pt-8">
             <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold text-brand-accent tracking-widest">Alamat Store</label>
                <input 
                  type="text"
                  value={aboutSettings.address}
                  onChange={e => setAboutSettings({...aboutSettings, address: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-brand-accent outline-none"
                  placeholder="Lokasi fisik toko..."
                />
             </div>
             <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold text-brand-accent tracking-widest">Konten Telepon / WhatsApp</label>
                <input 
                  type="text"
                  value={aboutSettings.phone}
                  onChange={e => setAboutSettings({...aboutSettings, phone: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-brand-accent outline-none"
                  placeholder="+62..."
                />
             </div>
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

      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        isLoading={confirmConfig.isLoading}
      />

      <ConfirmDialog
        isOpen={successConfig.isOpen}
        onClose={() => setSuccessConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => setSuccessConfig(prev => ({ ...prev, isOpen: false }))}
        title={successConfig.title}
        message={successConfig.message}
        type="success"
        confirmLabel="Siap!"
      />
    </div>
  );

  async function handleDeleteDoc(col: string, id: string) {
    setConfirmConfig({
      isOpen: true,
      title: 'Hapus Data?',
      message: 'Apakah Anda yakin ingin menghapus konten ini?',
      type: 'danger',
      onConfirm: async () => {
        try {
          setConfirmConfig(prev => ({ ...prev, isLoading: true }));
          await deleteDoc(doc(db, col, id));
          setConfirmConfig(prev => ({ ...prev, isOpen: false, isLoading: false }));
          
          setSuccessConfig({
            isOpen: true,
            title: 'Data Dihapus',
            message: 'Konten telah berhasil dihapus.'
          });
          
          fetchData();
        } catch (error) {
          console.error(error);
          setConfirmConfig(prev => ({ ...prev, isOpen: false, isLoading: false }));
        }
      }
    });
  }
}
