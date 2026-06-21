import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Plus, MoreVertical, X, Check, Edit, Trash2, CalendarDays, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState({
    title: '',
    description: '',
    schedule_date: '',
    start_time: '',
    end_time: '',
    location: '',
    status: 'upcoming'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const API_URL = (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchSchedules(parsedUser.id);
    }
  }, []);

  const fetchSchedules = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/schedules/${userId}`);
      const data = await response.json();
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (schedule = null) => {
    if (schedule) {
      setCurrentSchedule(schedule);
      setIsEditing(true);
      setEditingId(schedule.id);
    } else {
      setCurrentSchedule({
        title: '',
        description: '',
        schedule_date: new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: '',
        location: '',
        status: 'upcoming'
      });
      setIsEditing(false);
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentSchedule.title.trim() || !user) return;

    try {
      const url = isEditing ? `${API_URL}/schedules/${editingId}` : `${API_URL}/schedules`;
      const method = isEditing ? 'PUT' : 'POST';
      const body = isEditing ? currentSchedule : { ...currentSchedule, userId: user.id };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error('Failed to save schedule');

      await fetchSchedules(user.id);
      setToastMessage(isEditing ? 'Jadwal berhasil diperbarui' : 'Jadwal berhasil ditambahkan');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setShowModal(false);
    } catch (error) {
      console.error('Error saving schedule:', error);
      setToastMessage('Gagal menyimpan jadwal: ' + error.message);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;
    try {
      await fetch(`${API_URL}/schedules/${id}`, { method: 'DELETE' });
      setSchedules(schedules.filter(s => s.id !== id));
      setToastMessage('Jadwal berhasil dihapus');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'completed': return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-600 dark:text-gray-400';
    }
  };

  const filteredSchedules = schedules.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (s.location && s.location.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative">
        <div className="pr-12 md:pr-0">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Jadwal Saya</h1>
          <p className="text-slate-600 dark:text-gray-400">Kelola janji temu dan acara penting Anda.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="absolute top-0 right-0 md:static bg-blue-600 hover:bg-blue-700 text-white p-2.5 md:px-6 md:py-2.5 rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-blue-600/20"
        >
          <Plus size={20} />
          <span className="hidden md:inline">Tambah Jadwal</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="glass-panel p-4 rounded-3xl flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Cari jadwal atau lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-2.5 pl-12 pr-4 focus:outline-none focus:border-blue-500/50 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'upcoming', 'completed', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2.5 rounded-2xl text-sm font-bold capitalize transition-all ${
                statusFilter === status 
                ? 'bg-blue-600 text-white' 
                : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:bg-black/10'
              }`}
            >
              {status === 'all' ? 'Semua' : status === 'upcoming' ? 'Akan Datang' : status === 'completed' ? 'Selesai' : 'Batal'}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule List */}
      {filteredSchedules.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl">
          <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="text-blue-600" size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Tidak Ada Jadwal</h3>
          <p className="text-slate-600 dark:text-gray-400 mt-2">Mulai tambahkan jadwal penting Anda hari ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchedules.map((schedule) => (
            <div key={schedule.id} className="glass-panel p-6 rounded-3xl group hover:border-blue-500/30 transition-all flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(schedule.status)}`}>
                  {schedule.status === 'upcoming' ? 'Akan Datang' : schedule.status === 'completed' ? 'Selesai' : 'Batal'}
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenModal(schedule)} className="p-2 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white transition-all">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => handleDelete(schedule.id)} className="p-2 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">{schedule.title}</h3>
              <p className="text-slate-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">{schedule.description}</p>
              
              <div className="space-y-2 pt-4 border-t border-black/5 dark:border-white/5">
                <div className="flex items-center gap-3 text-slate-600 dark:text-gray-400 text-sm">
                  <CalendarDays size={16} className="text-blue-500" />
                  <span>{new Date(schedule.schedule_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 dark:text-gray-400 text-sm">
                  <Clock size={16} className="text-purple-500" />
                  <span>{schedule.start_time} - {schedule.end_time || 'Selesai'}</span>
                </div>
                {schedule.location && (
                  <div className="flex items-center gap-3 text-slate-600 dark:text-gray-400 text-sm">
                    <MapPin size={16} className="text-red-500" />
                    <span className="line-clamp-1">{schedule.location}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="glass-panel w-full max-w-lg p-8 rounded-3xl relative z-10 animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {isEditing ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Judul Jadwal</label>
                <input
                  type="text"
                  required
                  value={currentSchedule.title}
                  onChange={(e) => setCurrentSchedule({...currentSchedule, title: e.target.value})}
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:border-blue-500"
                  placeholder="Contoh: Meeting Proyek A"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Deskripsi</label>
                <textarea
                  value={currentSchedule.description}
                  onChange={(e) => setCurrentSchedule({...currentSchedule, description: e.target.value})}
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:border-blue-500 resize-none"
                  rows={3}
                  placeholder="Detail jadwal..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={currentSchedule.schedule_date}
                    onChange={(e) => setCurrentSchedule({...currentSchedule, schedule_date: e.target.value})}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Status</label>
                  <select
                    value={currentSchedule.status}
                    onChange={(e) => setCurrentSchedule({...currentSchedule, status: e.target.value})}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:border-blue-500"
                  >
                    <option value="upcoming">Akan Datang</option>
                    <option value="completed">Selesai</option>
                    <option value="cancelled">Batal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Jam Mulai</label>
                  <input
                    type="time"
                    required
                    value={currentSchedule.start_time}
                    onChange={(e) => setCurrentSchedule({...currentSchedule, start_time: e.target.value})}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Jam Selesai</label>
                  <input
                    type="time"
                    value={currentSchedule.end_time}
                    onChange={(e) => setCurrentSchedule({...currentSchedule, end_time: e.target.value})}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Lokasi</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={currentSchedule.location}
                    onChange={(e) => setCurrentSchedule({...currentSchedule, location: e.target.value})}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500"
                    placeholder="Contoh: Kantor Pusat, Zoom, dll."
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all"
              >
                {isEditing ? 'Simpan Perubahan' : 'Tambah Jadwal'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 right-8 z-[60] animate-slide-up">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <Check size={18} />
            </div>
            <p className="font-bold">{toastMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
