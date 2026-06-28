import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { FaUser, FaWhatsapp, FaTags, FaCalendarAlt, FaClock, FaLock, FaSignOutAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

function App() {
  const [view, setView] = useState('user');
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  
  // Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_whatsapp: '',
    service_id: '',
    booking_date: '',
    start_time: ''
  });

  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) setIsAdminAuth(true);
  }, []);

  useEffect(() => {
    fetch('https://smart-booking-backend-ashen.vercel.app/api/services')
      .then(res => res.json())
      .then(data => { if(data.success) setServices(data.data); })
      .catch(() => toast.error("Gagal narik layanan dari server"));
  }, []);

  const fetchBookings = () => {
    fetch('https://smart-booking-backend-ashen.vercel.app/api/bookings')
      .then(res => res.json())
      .then(data => { if(data.success) setBookings(data.data); })
      .catch(() => toast.error("Gagal narik data booking"));
  };

  useEffect(() => {
    if (view === 'admin' && isAdminAuth) fetchBookings();
  }, [view, isAdminAuth]);

  // ==================== AUTH LOGIC ====================
  const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoginLoading(true);
    const loadingToast = toast.loading("Mengecek kredensial...");
    
    try {
      const response = await fetch('https://smart-booking-backend-ashen.vercel.app/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const result = await response.json();
      
      toast.dismiss(loadingToast);
      if (result.success) {
        localStorage.setItem('adminToken', result.token);
        setIsAdminAuth(true);
        setLoginData({ username: '', password: '' });
        toast.success('Login Berhasil! Selamat datang Admin.');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Gagal terhubung ke server.');
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdminAuth(false);
    setView('user');
    toast.success("Berhasil Logout 👋");
  };

  // ==================== BOOKING LOGIC ====================
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const loadingToast = toast.loading("Menyiapkan pembayaran...");

    try {
      const response = await fetch('https://smart-booking-backend-ashen.vercel.app/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      
      toast.dismiss(loadingToast);
      
      if (result.success && result.snap_token) {
        window.snap.pay(result.snap_token, {
          onSuccess: function(){
            toast.success("🎉 Pembayaran Sukses! Jadwal diamankan.");
            setFormData({ customer_name: '', customer_whatsapp: '', service_id: '', booking_date: '', start_time: '' });
          },
          onPending: function(){
            toast.success("⏳ Lanjutkan pembayaran kamu ya!");
            setFormData({ customer_name: '', customer_whatsapp: '', service_id: '', booking_date: '', start_time: '' });
          },
          onError: function(){
            toast.error("❌ Waduh, pembayaran gagal. Coba lagi!");
          },
          onClose: function(){
            toast.error('⚠️ Kamu menutup pop-up sebelum selesai.');
          }
        });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    const loadingToast = toast.loading("Memperbarui status...");
    try {
      const response = await fetch(`https://smart-booking-backend-ashen.vercel.app/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const result = await response.json();
      toast.dismiss(loadingToast);
      if (result.success) {
        toast.success(`Status diubah jadi ${newStatus.toUpperCase()}`);
        fetchBookings();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Gagal mengubah status booking.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-6 flex flex-col items-center font-sans text-gray-800">
      {/* Wadah untuk Toast Notifications */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* Navigasi Utama */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-10 bg-white/60 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 tracking-wider">
          ⚡ CHARMING CHIC MAKEUP
        </div>
        <div className="flex gap-3">
          <button onClick={() => setView('user')} 
            className={`px-5 py-2.5 rounded-xl font-bold transition-all duration-300 ${view === 'user' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:shadow-md'}`}>
            Booking User
          </button>
          <button onClick={() => setView('admin')} 
            className={`px-5 py-2.5 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 ${view === 'admin' ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg shadow-gray-900/30 scale-105' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:shadow-md'}`}>
            <FaLock className="text-sm"/> Admin Panel
          </button>
        </div>
      </div>

      {/* TAMPILAN USER */}
      {view === 'user' && (
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-blue-900/5 p-8 border border-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-2">Reservasi Baru</h1>
          <p className="text-center text-gray-500 mb-8 text-sm font-medium">Isi form di bawah untuk mengamankan jadwal kamu!</p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Nama Lengkap</label>
              <div className="relative">
                <FaUser className="absolute left-3.5 top-3.5 text-gray-400" />
                <input type="text" name="customer_name" value={formData.customer_name} onChange={handleChange} required
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all" placeholder="Cth: Dimas" />
              </div>
            </div>
            
            <div className="relative">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">No. WhatsApp</label>
              <div className="relative">
                <FaWhatsapp className="absolute left-3.5 top-3.5 text-gray-400" />
                <input type="number" name="customer_whatsapp" value={formData.customer_whatsapp} onChange={handleChange} required
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all" placeholder="08123456789" />
              </div>
            </div>
            
            <div className="relative">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Pilih Layanan</label>
              <div className="relative">
                <FaTags className="absolute left-3.5 top-3.5 text-gray-400 z-10" />
                <select name="service_id" value={formData.service_id} onChange={handleChange} required
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all appearance-none">
                  <option value="" disabled>-- Pilih Layanan --</option>
                  {services.map(svc => (
                    <option key={svc.id} value={svc.id}>{svc.name} - Rp {svc.price.toLocaleString('id-ID')}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-1/2 relative">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Tanggal</label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input type="date" name="booking_date" value={formData.booking_date} onChange={handleChange} required
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl py-3 pl-10 pr-2 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all text-sm" />
                </div>
              </div>
              <div className="w-1/2 relative">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Jam (WIB)</label>
                <div className="relative">
                  <FaClock className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input type="time" name="start_time" value={formData.start_time} onChange={handleChange} required
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl py-3 pl-10 pr-2 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all text-sm" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={isLoading} 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-xl shadow-blue-500/30 hover:shadow-blue-600/40 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all mt-6 disabled:opacity-70 disabled:cursor-not-allowed">
              {isLoading ? '⏳ Memproses Token...' : 'Booking Sekarang ✏️'}
            </button>
          </form>
        </div>
      )}

      {/* TAMPILAN ADMIN */}
      {view === 'admin' && (
        <div className="w-full max-w-5xl">
          
          {!isAdminAuth ? (
            <div className="max-w-sm mx-auto bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 mt-10">
              <div className="text-center mb-8">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl shadow-lg shadow-gray-900/30">
                  <FaLock />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-800">Area Terbatas</h2>
                <p className="text-gray-500 text-sm mt-1 font-medium">Masukkan kredensial admin</p>
              </div>
              
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Username</label>
                  <input type="text" name="username" value={loginData.username} onChange={handleLoginChange} required
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3 outline-none focus:ring-2 focus:ring-gray-800 focus:bg-white transition-all" placeholder="username" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Password</label>
                  <input type="password" name="password" value={loginData.password} onChange={handleLoginChange} required
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3 outline-none focus:ring-2 focus:ring-gray-800 focus:bg-white transition-all" placeholder="••••••••" />
                </div>
                <button type="submit" disabled={isLoginLoading}
                  className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-black shadow-xl shadow-gray-900/20 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all mt-4 disabled:opacity-70">
                  {isLoginLoading ? 'Mengecek...' : 'Masuk Sistem'}
                </button>
              </form>
            </div>
          ) : (
            
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-gray-100 pb-6 gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Dashboard Admin</h1>
                  <p className="text-sm text-gray-500 mt-1 font-medium">Monitoring Jadwal Makeup & Status Pembayaran</p>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white font-bold py-2.5 px-5 rounded-xl transition-all duration-300 border border-red-100 hover:shadow-lg hover:shadow-red-500/20 active:scale-95">
                  <FaSignOutAlt /> Logout
                </button>
              </div>
              
              <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider border-b border-gray-200">
                      <th className="p-5">Data Pelanggan</th>
                      <th className="p-5">Layanan</th>
                      <th className="p-5">Jadwal Makeup</th>
                      <th className="p-5 text-center">Status Order</th>
                      <th className="p-5 text-center">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-100">
                    {bookings.length > 0 ? (
                      bookings.map((b) => (
                        <tr key={b.id} className="hover:bg-blue-50/40 transition duration-150">
                          <td className="p-5">
                            <div className="font-bold text-gray-800 text-base">{b.customer_name}</div>
                            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"><FaWhatsapp className="text-green-500"/> {b.customer_whatsapp}</div>
                          </td>
                          <td className="p-5">
                            <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-lg font-bold border border-blue-100">{b.service_name}</span>
                          </td>
                          <td className="p-5">
                            <div className="font-bold text-gray-800">{new Date(b.booking_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                            <div className="font-mono text-gray-500 text-xs mt-1 bg-gray-100 inline-block px-2 py-0.5 rounded border border-gray-200">
                              {b.start_time.substring(0,5)} - {b.end_time.substring(0,5)} WIB
                            </div>
                          </td>
                          <td className="p-5 text-center">
                            <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-bold border ${
                              b.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200' : 
                              b.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                            }`}>
                              {b.status === 'confirmed' && <FaCheckCircle/>}
                              {b.status === 'cancelled' && <FaTimesCircle/>}
                              {b.status === 'pending' && <FaClock/>}
                              {b.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-5 text-center">
                            <div className="flex justify-center gap-2">
                              {b.status === 'pending' && (
                                <button onClick={() => handleUpdateStatus(b.id, 'confirmed')} className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 px-3.5 rounded-lg shadow-md hover:shadow-emerald-500/30 transition-all active:scale-95">Set Lunas</button>
                              )}
                              {b.status !== 'cancelled' && (
                                <button onClick={() => handleUpdateStatus(b.id, 'cancelled')} className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold py-2 px-3.5 rounded-lg shadow-md hover:shadow-rose-500/30 transition-all active:scale-95">Batal</button>
                              )}
                              {b.status === 'cancelled' && (
                                <span className="text-xs text-gray-400 font-medium bg-gray-50 px-4 py-2 rounded-lg border border-dashed">Selesai</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="p-10 text-center text-gray-400 font-medium bg-gray-50/50">
                          <div className="flex flex-col items-center justify-center">
                            <FaCalendarAlt className="text-4xl text-gray-300 mb-3" />
                            Belum ada jadwal reservasi yang masuk.
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;