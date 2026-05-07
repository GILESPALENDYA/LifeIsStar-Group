import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  Package, 
  Settings, 
  LogOut, 
  Plus, 
  Users, 
  ExternalLink,
  ChevronRight,
  LayoutDashboard,
  MessageSquare,
  Eye
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';
import { auth, db } from '../../lib/firebase';
import { cn } from '../../lib/utils';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ products: 0, categories: 0, totalViews: 0 });
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/admin');
      } else {
        setUser(user);
        fetchStats();
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  async function fetchStats() {
    try {
      const pSnap = await getDocs(collection(db, 'products'));
      const cSnap = await getDocs(collection(db, 'categories'));
      
      let totalViews = 0;
      const productsData: any[] = [];
      pSnap.forEach(doc => {
        const data = doc.data();
        const views = data.views || 0;
        totalViews += views;
        productsData.push({
          name: data.name.length > 15 ? data.name.substring(0, 15) + '...' : data.name,
          views: views
        });
      });

      // Sort by views and take top 4
      const top4 = productsData
        .sort((a, b) => b.views - a.views)
        .slice(0, 4);

      setTopProducts(top4);
      setStats({
        products: pSnap.size,
        categories: cSnap.size,
        totalViews
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logout berhasil');
      navigate('/admin');
    } catch (error: any) {
      toast.error('Gagal logout');
    }
  };

  const PIE_COLORS = ['#4F8AFA', '#D1239F', '#79B93B', '#FCB040'];

  if (loading) return null;

  const quickActions = [
    { name: 'Tambah Produk', path: '/admin/products', icon: Plus, color: 'text-brand-accent', bg: 'bg-brand-accent/10' },
    { name: 'Kelola Testimoni', path: '/admin/testimonials', icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { name: 'Update Profil', path: '/admin/profile', icon: Settings, color: 'text-brand-gold', bg: 'bg-brand-gold/10' },
    { name: 'Lihat Website', path: '/', icon: ExternalLink, color: 'text-green-400', bg: 'bg-green-400/10' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-gray-400">Selamat datang kembali, {user?.displayName}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-brand-accent/10 rounded-lg">
              <Package className="w-5 h-5 text-brand-accent" />
            </div>
          </div>
          <div className="text-2xl font-bold">{stats.products}</div>
          <div className="text-sm text-gray-400">Total Produk</div>
        </div>
        
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-brand-gold/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-brand-gold" />
            </div>
          </div>
          <div className="text-2xl font-bold">{stats.categories}</div>
          <div className="text-sm text-gray-400">Kategori Aktif</div>
        </div>

        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-400/10 rounded-lg">
              <Eye className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div className="text-2xl font-bold">{stats.totalViews}</div>
          <div className="text-sm text-gray-400">Total Kunjungan Produk</div>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="bg-white/5 border border-white/10 p-8 rounded-3xl mb-12 backdrop-blur-sm shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-display font-bold">Produk Terpopuler</h2>
            <p className="text-sm text-gray-400 mt-1">Berdasarkan jumlah kunjungan halaman detail</p>
          </div>
          <BarChart3 className="w-6 h-6 text-brand-accent opacity-50" />
        </div>
        
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={topProducts}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={8}
                dataKey="views"
                stroke="none"
              >
                {topProducts.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={PIE_COLORS[index % PIE_COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#0A0A0A', 
                  borderColor: '#ffffff10',
                  borderRadius: '12px',
                  color: '#fff'
                }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="text-gray-400 text-sm font-medium">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-display font-semibold">Akses Cepat</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                to={action.path}
                className="group flex flex-col p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all"
              >
                <div className={cn("p-3 rounded-xl w-fit mb-4 transition-transform group-hover:scale-110", action.bg)}>
                  <action.icon className={cn("w-6 h-6", action.color)} />
                </div>
                <span className="font-medium">{action.name}</span>
                <ChevronRight className="w-4 h-4 mt-2 text-gray-500 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          <h2 className="text-xl font-display font-semibold">Status Sistem</h2>
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
             <div className="flex items-center justify-between text-sm">
               <span className="text-gray-400">Firebase Auth</span>
               <span className="text-green-400 flex items-center">
                 <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                 Active
               </span>
             </div>
             <div className="flex items-center justify-between text-sm">
               <span className="text-gray-400">Firestore DB</span>
               <span className="text-green-400 flex items-center">
                 <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                 Connected
               </span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
