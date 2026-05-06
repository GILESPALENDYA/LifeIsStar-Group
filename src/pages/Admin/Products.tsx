import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  Package, 
  Link as LinkIcon,
  Image as ImageIcon,
  ChevronLeft,
  Upload
} from 'lucide-react';
import { auth, db, OperationType, handleFirestoreError } from '../../lib/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  getDoc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { Product, Category, MarketplaceLinks } from '../../types';
import { formatCurrency, cn } from '../../lib/utils';
import toast from 'react-hot-toast';
import React, { useRef } from 'react';

const FIXED_CATEGORIES = ['Android', 'Iphone', 'MacBook', 'Tablet', 'Ipad'];

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingLinks, setEditingLinks] = useState<MarketplaceLinks>({});
  const [imageTab, setImageTab] = useState<'url' | 'upload'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: 0,
    description: '',
    imageUrl: '',
    status: 'active' as 'active' | 'hidden'
  });

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
      const fetchedCats = cSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      
      // If categories collection is empty or doesn't have our fixed ones, we'll use our fixed list
      // This ensures the dropdown is never empty
      const displayCats = FIXED_CATEGORIES.map(name => {
        const found = fetchedCats.find(c => c.name.toLowerCase() === name.toLowerCase());
        return found || { id: name.toLowerCase(), name };
      });

      setCategories(displayCats);

      const pSnap = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')));
      setProducts(pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'admin_products');
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = async (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      categoryId: product.categoryId,
      price: product.price,
      description: product.description,
      imageUrl: product.imageUrl,
      status: product.status
    });

    // Fetch links
    const lSnap = await getDoc(doc(db, 'products', product.id, 'links', 'main'));
    if (lSnap.exists()) {
      setEditingLinks(lSnap.data() as MarketplaceLinks);
    } else {
      setEditingLinks({});
    }
    
    setImageTab(product.imageUrl.startsWith('data:') ? 'upload' : 'url');
    setModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // Limit to 5MB
      toast.error('File terlalu besar. Maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, imageUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      categoryId: categories[0]?.id || FIXED_CATEGORIES[0].toLowerCase(),
      price: 0,
      description: '',
      imageUrl: '',
      status: 'active'
    });
    setEditingLinks({});
    setImageTab('upload');
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus produk ini?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast.success('Produk dihapus');
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = {
        ...formData,
        price: Number(formData.price),
        updatedAt: serverTimestamp(),
      };

      let productId = '';
      if (editingProduct) {
        productId = editingProduct.id;
        await updateDoc(doc(db, 'products', productId), data);
      } else {
        const docRef = await addDoc(collection(db, 'products'), {
          ...data,
          createdAt: serverTimestamp()
        });
        productId = docRef.id;
      }

      // Update Links
      await setDoc(doc(db, 'products', productId, 'links', 'main'), editingLinks);

      toast.success(editingProduct ? 'Produk diperbarui' : 'Produk ditambahkan');
      setModalOpen(false);
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'products');
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-display font-bold">Manajemen Produk</h1>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-2 px-6 py-3 bg-brand-accent text-white font-bold rounded-xl hover:bg-blue-600 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Produk Baru</span>
        </button>
      </div>

      {loading && products.length === 0 ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-brand-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                <th className="px-6 py-4">Produk</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Harga</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                        <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {categories.find(c => c.id === p.categoryId)?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 font-medium text-brand-accent">
                    {formatCurrency(p.price)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] font-bold uppercase px-2 py-1 rounded-full border",
                      p.status === 'active' 
                        ? "bg-green-400/10 border-green-400/20 text-green-400" 
                        : "bg-gray-400/10 border-gray-400/20 text-gray-400"
                    )}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(p)}
                        className="p-2 text-gray-400 hover:text-brand-accent hover:bg-brand-accent/10 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-brand-bg border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                  <h2 className="text-xl font-bold font-display">
                    {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
                  </h2>
                  <button onClick={() => setModalOpen(false)} type="button" className="p-2 text-gray-400 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-grow overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Basic Info */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center">
                      <Package className="w-4 h-4 mr-2" /> Informasi Dasar
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Nama Produk</label>
                        <input
                          required
                          type="text"
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none transition-all"
                          placeholder="Contoh: iPhone 15 Pro Max"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Kategori</label>
                          <select
                            required
                            value={formData.categoryId}
                            onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none transition-all"
                          >
                            {categories.map(c => (
                              <option key={c.id} value={c.id} className="bg-[#1a1a1a] text-white">
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                          <select
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none transition-all"
                          >
                            <option value="active" className="bg-[#1a1a1a] text-white">Active</option>
                            <option value="hidden" className="bg-[#1a1a1a] text-white">Hidden</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Harga (Rupiah)</label>
                        <div className="relative">
                          <input
                            required
                            type="text"
                            inputMode="numeric"
                            value={formData.price ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(formData.price) : ''}
                            onChange={e => {
                              const value = e.target.value.replace(/\D/g, '');
                              setFormData({ ...formData, price: value ? parseInt(value) : 0 });
                            }}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none transition-all font-mono"
                            placeholder="Rp 0"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Deskripsi</label>
                        <textarea
                          required
                          rows={4}
                          value={formData.description}
                          onChange={e => setFormData({ ...formData, description: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none transition-all resize-none"
                          placeholder="Spesifikasi lengkap..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Media & Links */}
                  <div className="space-y-8">
                    <div className="space-y-6">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center">
                        <ImageIcon className="w-4 h-4 mr-2" /> Media
                      </h3>

                      <div className="flex bg-white/5 p-1 rounded-xl mb-4">
                        <button 
                          type="button" 
                          onClick={() => setImageTab('upload')}
                          className={cn(
                            "flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2",
                            imageTab === 'upload' ? "bg-brand-accent text-white" : "text-gray-500 hover:text-white"
                          )}
                        >
                          <Upload className="w-3.5 h-3.5" /> UPLOAD
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setImageTab('url')}
                          className={cn(
                            "flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2",
                            imageTab === 'url' ? "bg-brand-accent text-white" : "text-gray-500 hover:text-white"
                          )}
                        >
                          <LinkIcon className="w-3.5 h-3.5" /> URL
                        </button>
                      </div>

                      {imageTab === 'upload' ? (
                        <div>
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full aspect-video bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-accent/50 hover:bg-white/10 transition-all overflow-hidden"
                          >
                            {formData.imageUrl && formData.imageUrl.startsWith('data:') ? (
                              <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <>
                                <Upload className="w-8 h-8 text-gray-600 mb-2" />
                                <span className="text-gray-500 text-sm">Klik untuk upload gambar</span>
                                <span className="text-gray-700 text-[10px] mt-1">Maksimal 5MB (JPG/PNG/WEBP)</span>
                              </>
                            )}
                          </div>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept="image/*" 
                            className="hidden" 
                          />
                          {formData.imageUrl && formData.imageUrl.startsWith('data:') && (
                             <button 
                               type="button" 
                               onClick={() => setFormData({...formData, imageUrl: ''})}
                               className="text-[10px] uppercase font-bold text-red-400 mt-2 hover:underline"
                             >
                               Hapus Gambar
                             </button>
                          )}
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">URL Gambar</label>
                          <input
                            required
                            type="url"
                            value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl}
                            onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none transition-all"
                            placeholder="https://..."
                          />
                          {formData.imageUrl && !formData.imageUrl.startsWith('data:') && (
                            <div className="mt-4 aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/10">
                              <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-contain" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center">
                        <LinkIcon className="w-4 h-4 mr-2" /> Marketplace Links
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-[#42b549] uppercase mb-1">Tokopedia URL</label>
                          <input
                            type="url"
                            value={editingLinks.tokopedia || ''}
                            onChange={e => setEditingLinks({ ...editingLinks, tokopedia: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#42b549] outline-none transition-all text-sm"
                            placeholder="https://tokopedia.com/..."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#ee4d2d] uppercase mb-1">Shopee URL</label>
                          <input
                            type="url"
                            value={editingLinks.shopee || ''}
                            onChange={e => setEditingLinks({ ...editingLinks, shopee: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#ee4d2d] outline-none transition-all text-sm"
                            placeholder="https://shopee.co.id/..."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#0095da] uppercase mb-1">BliBli URL</label>
                          <input
                            type="url"
                            value={editingLinks.blibli || ''}
                            onChange={e => setEditingLinks({ ...editingLinks, blibli: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#0095da] outline-none transition-all text-sm"
                            placeholder="https://blibli.com/..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-white/10 flex items-center justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-6 py-3 text-sm font-bold text-gray-400 hover:text-white transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center space-x-2 px-8 py-3 bg-brand-accent text-white font-bold rounded-xl hover:bg-blue-600 transition-all disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    <span>{editingProduct ? 'Update Produk' : 'Simpan Produk'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
