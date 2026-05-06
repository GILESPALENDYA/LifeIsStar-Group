/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import AdminLogin from './pages/Admin/Login';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminProducts from './pages/Admin/Products';
import AdminProfile from './pages/Admin/ProfileSettings';
import AdminTestimonials from './pages/Admin/Testimonials';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-brand-bg text-white">
        <Navbar />
        <main className="flex-grow pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/testimonials" element={<AdminTestimonials />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="bottom-right" toastOptions={{
          style: {
            background: '#1e1e1e',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)'
          }
        }} />
      </div>
    </Router>
  );
}
