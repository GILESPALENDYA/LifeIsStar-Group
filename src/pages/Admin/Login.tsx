import { useState, useEffect, FormEvent } from 'react';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, ShoppingBag, User, Lock, ArrowRight } from 'lucide-react';
import { auth } from '../../lib/firebase';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/admin/dashboard');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Isi email dan password');
      return;
    }

    setLoading(true);
    try {
      let finalEmail = email.trim();
      if (!finalEmail.includes('@')) {
        finalEmail = `${finalEmail}@lifeisstar.com`;
      }
      finalEmail = finalEmail.toLowerCase();
      await signInWithEmailAndPassword(auth, finalEmail, password);
      toast.success('Login berhasil');
      navigate('/admin/dashboard');
    } catch (error: any) {
      console.error(error);
      let message = 'Gagal login: Periksa kredensial Anda';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = 'Email atau password salah. Pastikan akun sudah didaftarkan di Firebase Console.';
      } else if (error.code === 'auth/operation-not-allowed') {
        message = 'Metode Sign-in Email/Password belum diaktifkan. Silakan aktifkan di Firebase Console > Authentication > Sign-in Method.';
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white/5 border border-white/10 p-8 md:p-10 rounded-3xl"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-brand-accent/10 rounded-2xl mb-4">
            <ShieldCheck className="w-10 h-10 text-brand-accent" />
          </div>
          <h1 className="text-3xl font-display font-bold">Admin Login</h1>
          <p className="text-gray-400 mt-2">Gunakan akun admin untuk mengelola toko.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Username / Email</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="adminStar1"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:border-brand-accent outline-none transition-all"
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-1">Gunakan email lengkap jika username tidak terdaftar.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:border-brand-accent outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-4 bg-brand-accent text-white font-bold rounded-xl hover:bg-blue-600 transition-all disabled:opacity-50 shadow-lg shadow-brand-accent/20"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-center space-x-2 text-gray-500 text-sm">
          <ShoppingBag className="w-4 h-4" />
          <span>LIFEISSTAR Dashboard v1.0</span>
        </div>
      </motion.div>
    </div>
  );
}
