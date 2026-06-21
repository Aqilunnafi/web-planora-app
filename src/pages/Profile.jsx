import React, { useState, useEffect, useRef } from 'react';
import { User, Settings, Shield, Bell, Camera, TrendingUp, Save, X, Mail, Globe, RefreshCw, Plus, Edit, Quote, Star, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LogoutModal from '../components/LogoutModal';

export default function Profile() {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [tempProfile, setTempProfile] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState([
    { total: 0, done: 0, percentage: 0 },
    { total: 0, done: 0, percentage: 0 },
    { total: 0, done: 0, percentage: 0 },
    { total: 0, done: 0, percentage: 0 },
    { total: 0, done: 0, percentage: 0 },
    { total: 0, done: 0, percentage: 0 },
    { total: 0, done: 0, percentage: 0 }
  ]);
  const [dayLabels, setDayLabels] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [review, setReview] = useState({ content: '', rating: 5, role: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const fileInputRef = useRef(null);
  
  const API_URL = (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('user');
    setIsLogoutModalOpen(false);
    navigate('/auth');
  };

  useEffect(() => {
    fetchProfile();
    fetchStats();
    generateDayLabels();
  }, []);

  const generateDayLabels = () => {
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const labels = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      labels.push(days[d.getDay()]);
    }
    setDayLabels(labels);
  };

  const fetchStats = async () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return;
    const { id } = JSON.parse(storedUser);

    setIsRefreshing(true);
    try {
      const response = await fetch(`${API_URL}/stats/${id}`);
      const data = await response.json();
      console.log('Weekly Stats Received:', data);
      setWeeklyStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const fetchProfile = async () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setIsLoading(false);
      return;
    }
    
    const parsedUser = JSON.parse(storedUser);
    const id = parsedUser.id;

    try {
      const response = await fetch(`${API_URL}/profile/${id}`);
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
        setTempProfile(data);
      } else {
        // If fetch fails, use localStorage data
        setUserProfile(parsedUser);
        setTempProfile(parsedUser);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setUserProfile(parsedUser);
      setTempProfile(parsedUser);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setTempProfile({ ...userProfile });
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/profile/${userProfile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tempProfile)
      });
      
      if (!response.ok) throw new Error('Failed to update');

      setUserProfile({ ...tempProfile });
      setIsEditing(false);
      
      // Update localStorage with new data
      localStorage.setItem('user', JSON.stringify({ ...tempProfile, id: userProfile.id }));
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Gagal memperbarui profil');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File terlalu besar. Maksimal 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setIsUploading(true);
    try {
      const response = await fetch(`${API_URL}/upload-avatar/${userProfile.id}`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      
      // Update local state
      const updatedProfile = { ...userProfile, avatar: data.avatarUrl };
      setUserProfile(updatedProfile);
      setTempProfile(updatedProfile);
      
      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...storedUser, avatar: data.avatarUrl }));
      
      alert('Foto profil berhasil diperbarui!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Gagal mengunggah foto profil');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!review.content.trim()) return;

    setIsSubmittingReview(true);
    try {
      const response = await fetch(`${API_URL}/testimonials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userProfile.id,
          content: review.content,
          rating: review.rating,
          role: review.role || 'Pengguna Planora'
        })
      });
      if (response.ok) {
        alert('Terima kasih atas ulasan Anda!');
        setReview({ content: '', rating: 5, role: '' });
        setIsReviewModalOpen(false);
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Gagal mengirim ulasan. Silakan coba lagi.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-600 dark:text-gray-400">Silakan login untuk melihat profil.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Profil Saya</h1>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="w-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 text-white p-2.5 sm:px-5 sm:py-2.5 rounded-xl font-medium transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
          >
            <Edit size={18} />
            <span className="hidden sm:inline">Edit Profil</span>
          </button>
        )}
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Side: User Info / Edit Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-8 rounded-3xl">
            <div className="relative inline-block mb-6 w-full">
              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 dark:from-blue-500 dark:to-cyan-300 p-1">
                <div className="w-full h-full rounded-full bg-white dark:bg-[#0f172a] flex items-center justify-center overflow-hidden transition-colors duration-300">
                  {userProfile.avatar ? (
                    <img 
                      src={userProfile.avatar} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={64} className="text-slate-400 dark:text-gray-400" />
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <RefreshCw size={24} className="text-white animate-spin" />
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={handleAvatarClick}
                disabled={isUploading}
                className="absolute bottom-2 right-1/2 translate-x-12 w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-[#0f172a] text-white hover:bg-blue-500 dark:hover:bg-blue-400 transition-colors shadow-lg disabled:opacity-50"
              >
                <Camera size={18} />
              </button>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {!isEditing ? (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{userProfile.name}</h2>
                <p className="text-blue-600 dark:text-blue-400 font-medium mb-4">@{userProfile.username}</p>
                <div className="space-y-3 text-left">
                  <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed text-center italic">
                    "{userProfile.bio || 'Belum ada bio'}"
                  </p>
                  <div className="pt-4 space-y-2">
                    <div className="flex items-center gap-3 text-slate-500 dark:text-gray-400 text-sm">
                      <Mail size={14} /> {userProfile.email}
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 dark:text-gray-400 text-sm">
                      <Globe size={14} /> {userProfile.website}
                    </div>
                    <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 text-sm font-medium pt-2">
                      <Bell size={14} /> 
                      {userProfile.notification_preference === '12h' ? '12 Jam' : 
                       userProfile.notification_preference === '1d' ? '1 Hari' : 
                       userProfile.notification_preference === '2d' ? '2 Hari' : 
                       userProfile.notification_preference === 'none' ? 'Mati' : '1 Hari'} (Lead time)
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-wider mb-1 ml-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={tempProfile.name}
                    onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-2.5 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-wider mb-1 ml-1">Username</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 text-sm">@</span>
                    <input
                      type="text"
                      value={tempProfile.username}
                      onChange={(e) => setTempProfile({ ...tempProfile, username: e.target.value })}
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-2.5 pl-8 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50 transition-all"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-wider mb-1 ml-1">Email</label>
                  <input
                    type="email"
                    value={tempProfile.email}
                    onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-2.5 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-wider mb-1 ml-1">Bio</label>
                  <textarea
                    value={tempProfile.bio}
                    onChange={(e) => setTempProfile({ ...tempProfile, bio: e.target.value })}
                    rows={3}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-2.5 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-wider mb-1 ml-1">Pengaturan Notifikasi</label>
                  <select
                    value={tempProfile.notification_preference || '1d'}
                    onChange={(e) => setTempProfile({ ...tempProfile, notification_preference: e.target.value })}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-2.5 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="12h" className="bg-white dark:bg-slate-900">12 Jam Sebelum Deadline</option>
                    <option value="1d" className="bg-white dark:bg-slate-900">1 Hari Sebelum Deadline</option>
                    <option value="2d" className="bg-white dark:bg-slate-900">2 Hari Sebelum Deadline</option>
                    <option value="none" className="bg-white dark:bg-slate-900">Matikan Notifikasi</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
                  >
                    <Save size={16} /> Simpan
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <X size={16} /> Batal
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="glass-panel p-4 rounded-3xl">
            <div className="space-y-1">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-900 dark:text-white bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 dark:border-blue-500/30">
                <User size={18} className="text-blue-600 dark:text-blue-400" /> Informasi Pribadi
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <Settings size={18} /> Pengaturan Akun
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <Shield size={18} /> Keamanan
              </button>
              <button 
                onClick={() => {
                  // Scroll to top of settings or just show notifications
                  const bellBtn = document.getElementById('btn-notif-test');
                  if(bellBtn) bellBtn.click();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <Bell size={18} /> Notifikasi
              </button>
              <button 
                onClick={() => setIsReviewModalOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/10 transition-colors font-semibold border border-transparent hover:border-yellow-500/20"
              >
                <Quote size={18} /> Beri Ulasan
              </button>
              <div className="pt-2 mt-2 border-t border-black/10 dark:border-white/10">
                <button 
                  onClick={handleLogoutClick}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors font-semibold border border-transparent hover:border-red-500/20"
                >
                  <LogOut size={18} /> Keluar
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Productivity Charts / Stats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-8 rounded-3xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Produktivitas Mingguan</h3>
                <p className="text-slate-600 dark:text-gray-400 text-sm">Analisis penyelesaian tugas Anda</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <button 
                  onClick={fetchStats}
                  className={`p-2 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                >
                  <RefreshCw size={18} />
                </button>
                <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl border border-blue-500/20 dark:border-blue-500/30">
                  <TrendingUp className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
              </div>
            </div>

            {/* Chart Layout */}
            <div className="h-64 flex items-stretch justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-4 pt-10">
              {weeklyStats.map((stat, idx) => (
                <div key={idx} className="flex-1 flex flex-col justify-end items-center group relative h-full">
                  <div
                    className={`w-full max-w-[40px] rounded-t-lg transition-all duration-700 ease-out flex items-center justify-center overflow-hidden ${Number(stat.percentage) > 0 ? 'bg-blue-600 dark:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-slate-200 dark:bg-slate-800 opacity-30'}`}
                    style={{ height: `${Math.max(Number(stat.percentage) || 0, 4)}%` }}
                  >
                    {stat.percentage > 15 && (
                      <span className="text-[10px] font-bold text-white mb-1">
                        {stat.percentage}%
                      </span>
                    )}
                  </div>
                  {/* Floating Tooltip */}
                  {stat.percentage > 0 && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold py-0.5 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30">
                      {stat.done}/{stat.total} Tugas
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-xs font-medium text-slate-500 dark:text-gray-400 px-2">
              {dayLabels.map((label, idx) => (
                <span key={idx}>{label}</span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="glass-panel p-6 rounded-3xl">
              <h4 className="text-slate-600 dark:text-gray-400 font-medium mb-2">Tingkat Penyelesaian</h4>
              <div className="flex items-end gap-3">
                <span className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                  {(() => {
                    const totalTasks = Array.isArray(weeklyStats) ? weeklyStats.reduce((a, b) => a + (Number(b.total) || 0), 0) : 0;
                    const doneTasks = Array.isArray(weeklyStats) ? weeklyStats.reduce((a, b) => a + (Number(b.done) || 0), 0) : 0;
                    return totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
                  })()}%
                </span>
                <span className="text-green-600 dark:text-green-400 text-sm font-medium mb-1">Minggu ini</span>
              </div>
            </div>
            <div className="glass-panel p-6 rounded-3xl">
              <h4 className="text-slate-600 dark:text-gray-400 font-medium mb-2">Total Tugas Selesai</h4>
              <div className="flex items-end gap-3">
                <span className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                  {weeklyStats.reduce((acc, curr) => acc + (curr.done || 0), 0)}
                </span>
                <span className="text-cyan-600 dark:text-cyan-400 text-sm font-medium mb-1">Tugas Selesai</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel w-full max-w-lg p-8 rounded-[2.5rem] shadow-2xl relative animate-scale-in">
              <button 
                onClick={() => setIsReviewModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                  <Quote size={30} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Beri Ulasan</h3>
                  <p className="text-slate-600 dark:text-gray-400 text-sm">Bagikan pengalaman Anda menggunakan Planora</p>
                </div>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-gray-500 uppercase mb-2 ml-1">Pekerjaan / Peran</label>
                    <input
                      type="text"
                      placeholder="Contoh: Mahasiswa"
                      value={review.role}
                      onChange={(e) => setReview({ ...review, role: e.target.value })}
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-yellow-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-gray-500 uppercase mb-2 ml-1">Rating</label>
                    <div className="flex items-center gap-2 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReview({ ...review, rating: star })}
                          className={`transition-all transform hover:scale-110 ${star <= review.rating ? 'text-yellow-500' : 'text-slate-300 dark:text-gray-600'}`}
                        >
                          <Star size={28} fill={star <= review.rating ? "currentColor" : "none"} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-gray-500 uppercase mb-2 ml-1">Ulasan Anda</label>
                  <textarea
                    placeholder="Ceritakan bagaimana Planora membantu produktivitas Anda..."
                    value={review.content}
                    onChange={(e) => setReview({ ...review, content: e.target.value })}
                    rows={4}
                    required
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-yellow-500/50 transition-all resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="flex-1 py-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-50"
                  >
                    {isSubmittingReview ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                    Kirim Ulasan
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-6 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
      {/* Logout Confirmation Modal */}
      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={handleConfirmLogout} 
      />
    </div>
  );
}
