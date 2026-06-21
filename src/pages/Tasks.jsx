import React, { useState, useEffect } from 'react';
import { ListTodo, Plus, Search, Filter, Check, Edit, X, CalendarDays, Clock, Trash2, ChevronLeft, ChevronRight, Save } from 'lucide-react';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', date: '', time: '', priority: 'Med' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // All, Pending, Completed
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const API_URL = (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchTasks(parsedUser.id);
    }
  }, []);

  const fetchTasks = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${userId}`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (task = null) => {
    if (task) {
      setNewTask({
        title: task.title,
        description: task.description || '',
        date: task.date || '',
        time: task.time || '',
        priority: task.priority || 'Med'
      });
      setIsEditing(true);
      setEditingTaskId(task.id);
    } else {
      setNewTask({ title: '', description: '', date: new Date().toISOString().split('T')[0], time: '', priority: 'Med' });
      setIsEditing(false);
      setEditingTaskId(null);
    }
    setShowModal(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim() || !user) return;

    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing ? `${API_URL}/tasks/${editingTaskId}` : `${API_URL}/tasks`;
      const body = isEditing 
        ? { ...newTask, done: tasks.find(t => t.id === editingTaskId)?.done }
        : { ...newTask, userId: user.id };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error('Failed to save task');

      await fetchTasks(user.id);
      setToastMessage(isEditing ? 'Tugas berhasil diperbarui' : 'Tugas berhasil ditambahkan');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setShowModal(false);
    } catch (error) {
      console.error('Error saving task:', error);
      setToastMessage('Gagal menyimpan tugas');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const toggleDone = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: !task.done })
      });

      if (!response.ok) throw new Error('Failed to update task');
      setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Hapus tugas ini?')) return;
    try {
      await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
      setTasks(tasks.filter(t => t.id !== id));
      setToastMessage('Tugas berhasil dihapus');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
    const matchesStatus = statusFilter === 'All' || 
                         (statusFilter === 'Completed' && task.done) || 
                         (statusFilter === 'Pending' && !task.done);
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High': return 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20';
      case 'Med': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Low': return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
      default: return 'bg-slate-500/10 text-slate-600 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative">
        <div className="pr-12 md:pr-0">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Daftar Tugas</h1>
          <p className="text-slate-600 dark:text-gray-400">Kelola semua tugas dan tanggung jawab Anda.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="absolute top-0 right-0 md:static bg-blue-600 hover:bg-blue-700 text-white p-2.5 md:px-6 md:py-2.5 rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-blue-600/20"
        >
          <Plus size={20} />
          <span className="hidden md:inline">Tambah Tugas Baru</span>
        </button>
      </div>

      <div className="glass-panel p-6 rounded-3xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative col-span-1 md:col-span-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari tugas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 rounded-2xl py-2.5 pl-12 pr-4 focus:outline-none focus:border-blue-500/50 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="flex-1 bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 rounded-2xl py-2.5 px-4 focus:outline-none focus:border-blue-500/50 text-sm font-bold text-slate-900 dark:text-white transition-all"
            >
              <option value="All" className="dark:bg-slate-900">Semua Prioritas</option>
              <option value="High" className="dark:bg-slate-900">Tinggi</option>
              <option value="Med" className="dark:bg-slate-900">Sedang</option>
              <option value="Low" className="dark:bg-slate-900">Rendah</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 rounded-2xl py-2.5 px-4 focus:outline-none focus:border-blue-500/50 text-sm font-bold text-slate-900 dark:text-white transition-all"
            >
              <option value="All" className="dark:bg-slate-900">Semua Status</option>
              <option value="Pending" className="dark:bg-slate-900">Belum Selesai</option>
              <option value="Completed" className="dark:bg-slate-900">Selesai</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <ListTodo size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">Tidak ada tugas ditemukan.</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div 
                key={task.id} 
                className={`glass-panel p-6 rounded-3xl group hover:border-blue-500/30 transition-all flex flex-col relative overflow-hidden ${task.done ? 'bg-black/5 dark:bg-white/5' : ''}`}
              >
                {/* Priority Indicator Strip (Left Side) */}
                <div className={`absolute top-0 left-0 w-1.5 h-full ${
                  task.priority === 'High' ? 'bg-pink-500' : 
                  task.priority === 'Med' ? 'bg-amber-500' : 'bg-cyan-500'
                }`} />

                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleDone(task.id)}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${task.done ? 'bg-blue-500 border-blue-500' : 'border-slate-300 dark:border-gray-600 group-hover:border-blue-500'}`}
                    >
                      {task.done && <Check size={12} className="text-white" />}
                    </button>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityStyle(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(task)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 transition-all">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => deleteTask(task.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h4 className={`text-lg font-bold mb-2 transition-all ${task.done ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                  {task.title}
                </h4>
                
                {task.description && (
                  <p className={`text-sm mb-4 line-clamp-2 flex-grow ${task.done ? 'text-slate-400' : 'text-slate-600 dark:text-slate-300'}`}>
                    {task.description}
                  </p>
                )}

                <div className="space-y-2 mt-auto pt-4 border-t border-black/5 dark:border-white/10">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <CalendarDays size={14} className="text-blue-500" />
                    <span>{task.date || 'Tanpa Tanggal'}</span>
                  </div>
                  {task.time && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Clock size={14} className="text-purple-500" />
                      <span>{task.time}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="glass-panel w-full max-w-md p-8 rounded-3xl relative z-10 animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {isEditing ? 'Edit Tugas' : 'Tambah Tugas Baru'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Judul Tugas</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:border-blue-500"
                  placeholder="Beli susu, Meeting, dll."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Deskripsi</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:border-blue-500 resize-none"
                  rows={3}
                  placeholder="Detail tugas..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Tanggal</label>
                  <input
                    type="date"
                    value={newTask.date}
                    onChange={(e) => setNewTask({...newTask, date: e.target.value})}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Waktu</label>
                  <input
                    type="time"
                    value={newTask.time}
                    onChange={(e) => setNewTask({...newTask, time: e.target.value})}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Prioritas</label>
                <div className="flex gap-2">
                  {['High', 'Med', 'Low'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewTask({...newTask, priority: p})}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${newTask.priority === p ? getPriorityStyle(p) : 'bg-black/5 dark:bg-white/5 text-slate-500 border-transparent'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all"
              >
                {isEditing ? 'Simpan Perubahan' : 'Tambah Tugas'}
              </button>
            </form>
          </div>
        </div>
      )}

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
