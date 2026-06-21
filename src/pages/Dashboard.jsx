import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, ListTodo, Plus, MoreVertical, X, Check, CalendarDays, Edit, Bell, Save, MapPin, Calendar, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', date: '', time: '', priority: 'Med' });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [filterType, setFilterType] = useState('selected'); // 'selected' or 'all'
  const [isEditing, setIsEditing] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [allSchedules, setAllSchedules] = useState([]);

  const API_URL = (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

  useEffect(() => {
    const init = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        await Promise.all([
          fetchTasks(parsedUser.id),
          fetchUpcomingSchedules(parsedUser.id),
          fetchAllSchedules(parsedUser.id)
        ]);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const fetchTasks = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${userId}`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchUpcomingSchedules = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/schedules/upcoming/${userId}`);
      const data = await response.json();
      setUpcomingSchedules(data);
    } catch (error) {
      console.error('Error fetching upcoming schedules:', error);
    }
  };

  const fetchAllSchedules = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/schedules/${userId}`);
      const data = await response.json();
      setAllSchedules(data);
    } catch (error) {
      console.error('Error fetching all schedules:', error);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    // 0 is Sunday, but our calendar starts with Monday (Sen)
    // so we adjust: (day + 6) % 7
    let day = new Date(year, month, 1).getDay();
    return (day + 6) % 7;
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];

    // Previous month days
    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        month: month - 1,
        year: year,
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month: month,
        year: year,
        isCurrentMonth: true
      });
    }

    // Next month days
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({
        day: i,
        month: month + 1,
        year: year,
        isCurrentMonth: false
      });
    }

    return days;
  };

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const isToday = (day, month, year) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  const isSelected = (day, month, year) => {
    return selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
  };

  const hasTasksOnDate = (day, month, year) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.some(task => task.date === dateStr);
  };

  const hasSchedulesOnDate = (day, month, year) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return allSchedules.some(s => s.schedule_date === dateStr);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim() || !user) return;

    try {
      if (isEditing) {
        // Update existing task
        const response = await fetch(`${API_URL}/tasks/${editingTaskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...newTask, done: tasks.find(t => t.id === editingTaskId)?.done })
        });

        if (!response.ok) throw new Error('Failed to update task');

        setTasks(prevTasks => prevTasks.map(t => t.id === editingTaskId ? { ...t, ...newTask } : t));
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        // Add new task
        const response = await fetch(`${API_URL}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...newTask, userId: user.id })
        });
        const task = await response.json();
        setTasks(prevTasks => [task, ...prevTasks]);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }

      setNewTask({ title: '', description: '', date: '', time: '', priority: 'Med' });
      setShowModal(false);
      setIsEditing(false);
      setEditingTaskId(null);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleEditTask = (task) => {
    setNewTask({
      title: task.title,
      description: task.description || '',
      date: task.date || '',
      time: task.time || '',
      priority: task.priority || 'Med'
    });
    setEditingTaskId(task.id);
    setIsEditing(true);
    setShowModal(true);
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
    try {
      await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.done).length;
  const pendingTasks = totalTasks - doneTasks;

  const stats = [
    { title: 'Total Tugas', value: totalTasks, icon: ListTodo, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10 dark:bg-blue-500/20', border: 'border-blue-500/20 dark:border-blue-500/30' },
    { title: 'Selesai', value: doneTasks, icon: CheckCircle2, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-500/10 dark:bg-cyan-500/20', border: 'border-cyan-500/20 dark:border-cyan-500/30' },
    { title: 'Belum Selesai', value: pendingTasks, icon: Clock, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10 dark:bg-purple-500/20', border: 'border-purple-500/20 dark:border-purple-500/30' },
  ];

  // Priority badge styles
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High': return 'bg-[#F15BB5]/15 text-[#F15BB5] border border-[#F15BB5]/30';
      case 'Med': return 'bg-[#FFE66D]/20 text-[#c4a800] dark:text-[#FFE66D] border border-[#FFE66D]/30';
      case 'Low': return 'bg-[#4CC9F0]/15 text-[#4CC9F0] border border-[#4CC9F0]/30';
      default: return 'bg-slate-500/10 dark:bg-gray-500/20 text-slate-600 dark:text-gray-400';
    }
  };

  // style Card per prioritas
  const getCardStyle = (priority) => {
    switch (priority) {
      case 'High': return 'border-l-[3px] border-l-[#F15BB5] bg-[#F15BB5]/5 dark:bg-[#F15BB5]/10 hover:bg-[#F15BB5]/10 dark:hover:bg-[#F15BB5]/15';
      case 'Med': return 'border-l-[3px] border-l-[#FFE66D] bg-[#FFE66D]/5 dark:bg-[#FFE66D]/10 hover:bg-[#FFE66D]/10 dark:hover:bg-[#FFE66D]/15';
      case 'Low': return 'border-l-[3px] border-l-[#4CC9F0] bg-[#4CC9F0]/5 dark:bg-[#4CC9F0]/10 hover:bg-[#4CC9F0]/10 dark:hover:bg-[#4CC9F0]/15';
      default: return 'border-l-[3px] border-l-slate-300 bg-black/5 dark:bg-white/5';
    }
  };

  const formatDateTime = (date, time) => {
    let parts = [];
    if (date) {
      try {
        const d = new Date(date + 'T00:00:00');
        parts.push(d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }));
      } catch {
        parts.push(date);
      }
    }
    if (time) {
      parts.push(time);
    }
    return parts.length > 0 ? parts.join(' • ') : 'Belum dijadwalkan';
  };

  const daysLabel = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const calendarData = generateCalendarDays();

  // Filter tasks based on filterType
  const filteredTasks = tasks.filter(task => {
    if (filterType === 'all') return true;
    if (!task.date) return false;

    // Convert task.date (YYYY-MM-DD) and selectedDate to comparable strings
    const taskDateStr = task.date;
    const offset = selectedDate.getTimezoneOffset() * 60000;
    const localSelectedDate = new Date(selectedDate.getTime() - offset);
    const finalSelectedDateStr = localSelectedDate.toISOString().split('T')[0];

    return taskDateStr === finalSelectedDateStr;
  });

  // Calculate upcoming deadlines for reminders
  const getUpcomingReminders = () => {
    if (!user || !user.notification_preference || user.notification_preference === 'none') return [];

    const now = new Date();
    let leadTimeMs = 0;

    if (user.notification_preference === '12h') leadTimeMs = 12 * 60 * 60 * 1000;
    else if (user.notification_preference === '1d') leadTimeMs = 24 * 60 * 60 * 1000;
    else if (user.notification_preference === '2d') leadTimeMs = 48 * 60 * 60 * 1000;

    const taskReminders = tasks
      .filter(task => {
        if (task.done || !task.date) return false;
        const deadline = new Date(`${task.date}T${task.time || '00:00'}:00`);
        const diff = deadline.getTime() - now.getTime();
        return diff > 0 && diff <= leadTimeMs;
      })
      .map(t => ({ ...t, reminderType: 'task' }));

    const scheduleReminders = allSchedules
      .filter(s => {
        if (s.status !== 'upcoming' || !s.schedule_date) return false;
        const start = new Date(`${s.schedule_date}T${s.start_time || '00:00'}:00`);
        const diff = start.getTime() - now.getTime();
        return diff > 0 && diff <= leadTimeMs;
      })
      .map(s => ({ 
        ...s, 
        reminderType: 'schedule', 
        date: s.schedule_date, 
        time: s.start_time,
        priority: 'High' // Schedules are generally high priority reminders
      }));

    return [...taskReminders, ...scheduleReminders].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time || '00:00'}:00`);
      const dateB = new Date(`${b.date}T${b.time || '00:00'}:00`);
      return dateA - dateB;
    });
  };

  const upcomingReminders = getUpcomingReminders();

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            Halo, {user ? user.name.split(' ')[0] : 'User'}!
          </h1>
          <p className="text-slate-600 dark:text-gray-400">Berikut adalah ringkasan hari ini.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="glass-panel p-4 sm:p-6 rounded-3xl flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-gray-400 font-medium mb-1 text-sm sm:text-base">{stat.title}</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${stat.bg} flex items-center justify-center border ${stat.border}`}>
                <Icon className={stat.color} size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Reminders Section */}
      {upcomingReminders.length > 0 && (
        <div className="animate-slide-up">
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 border border-amber-500/20 dark:border-amber-500/30 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Bell size={120} />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg">
                <Bell size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Pengingat Deadline</h2>
                <p className="text-slate-600 dark:text-gray-400 text-sm">Tugas berikut mendekati batas waktu</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingReminders.map(item => (
                <div key={`${item.reminderType}-${item.id}`} className={`bg-white/50 dark:bg-black/20 backdrop-blur-md border p-4 rounded-2xl flex items-center justify-between group transition-all ${item.reminderType === 'schedule' ? 'border-blue-500/30 hover:border-blue-500' : 'border-white/20 dark:border-white/10 hover:border-amber-500/50'}`}>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-md ${item.reminderType === 'schedule' ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white'}`}>
                        {item.reminderType === 'schedule' ? 'JADWAL' : 'TUGAS'}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white truncate">{item.title}</h4>
                    </div>
                    <p className={`text-xs font-medium flex items-center gap-1 ${item.reminderType === 'schedule' ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      <Clock size={12} /> {formatDateTime(item.date, item.time)}
                    </p>
                  </div>
                  {item.reminderType === 'task' ? (
                    <button
                      onClick={() => toggleDone(item.id)}
                      className="w-8 h-8 rounded-full bg-amber-500/20 hover:bg-amber-500 text-amber-600 dark:text-amber-400 hover:text-white flex items-center justify-center transition-all"
                    >
                      <Check size={16} />
                    </button>
                  ) : (
                    <Link
                      to="/schedules"
                      className="w-8 h-8 rounded-full bg-blue-500/20 hover:bg-blue-500 text-blue-600 dark:text-blue-400 hover:text-white flex items-center justify-center transition-all"
                    >
                      <ArrowRight size={16} />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Schedules Widget */}
      <div className="animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar size={20} className="text-blue-500" />
            Jadwal Mendatang
          </h2>
          <a href="/schedules" className="text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline">Lihat Semua</a>
        </div>
        {upcomingSchedules.length === 0 ? (
          <div className="glass-panel p-6 rounded-3xl text-center">
            <p className="text-slate-500 dark:text-gray-500 text-sm italic">Tidak ada jadwal dalam waktu dekat.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {upcomingSchedules.map(schedule => (
              <Link 
                key={schedule.id} 
                to="/schedules" 
                className="glass-panel p-4 rounded-2xl border-l-4 border-l-blue-500 hover:scale-[1.02] transition-all block hover:bg-blue-500/5 dark:hover:bg-blue-500/10 cursor-pointer"
              >
                <h4 className="font-bold text-slate-900 dark:text-white truncate text-sm mb-1">{schedule.title}</h4>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock size={10} /> {schedule.start_time}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-gray-400 flex items-center gap-1">
                    <CalendarDays size={10} /> {new Date(schedule.schedule_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </p>
                  {schedule.location && (
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 flex items-center gap-1 truncate">
                      <MapPin size={10} /> {schedule.location}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Task List */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {filterType === 'all'
                ? 'Semua Tugas'
                : `Tugas ${selectedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' }) === new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long' }) ? 'Hari Ini' : selectedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`
              }
            </h2>
            <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/10 dark:border-white/10 w-full sm:w-auto">
              <button
                onClick={() => setFilterType('selected')}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'selected' ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Dipilih
              </button>
              <button
                onClick={() => setFilterType('all')}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'all' ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Semua
              </button>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center mx-auto mb-4 border border-blue-500/20 dark:border-blue-500/30">
                <ListTodo className="text-blue-600 dark:text-blue-400" size={28} />
              </div>
              <p className="text-slate-600 dark:text-gray-400 font-medium">Belum ada tugas</p>
              <p className="text-slate-500 dark:text-gray-500 text-sm mt-1">Klik "Tambah Tugas" untuk memulai</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map(task => (
                <div
                  key={task.id}
                  className={`group border border-black/10 dark:border-white/10 p-4 rounded-2xl flex items-center justify-between transition-all ${getCardStyle(task.priority)} ${task.done ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleDone(task.id)}
                      className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${task.done
                        ? 'bg-blue-500 border-blue-500 dark:bg-blue-400 dark:border-blue-400'
                        : 'border-slate-400 dark:border-gray-500 group-hover:border-blue-500 dark:group-hover:border-blue-400'
                        }`}
                    >
                      {task.done && <Check size={12} className="text-white" />}
                    </button>
                    <div>
                      <h4 className={`font-medium transition-all ${task.done ? 'line-through text-slate-400 dark:text-gray-500' : 'text-slate-900 dark:text-white'}`}>
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className={`text-xs mt-1 mb-2 ${task.done ? 'text-slate-400 dark:text-gray-600' : 'text-slate-600 dark:text-gray-400'}`}>
                          {task.description}
                        </p>
                      )}
                      <span className="text-xs text-slate-500 dark:text-gray-400 flex items-center gap-1">
                        <CalendarDays size={11} /> {formatDateTime(task.date, task.time)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${getPriorityStyle(task.priority)}`}>
                      {task.priority}
                    </span>
                    <button
                      onClick={() => handleEditTask(task)}
                      className="text-slate-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors sm:opacity-0 sm:group-hover:opacity-100 p-1"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-slate-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors sm:opacity-0 sm:group-hover:opacity-100 p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calendar Widget */}
        <div className="glass-panel p-6 rounded-3xl h-fit">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={handlePrevMonth}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-gray-400 transition-colors"
              >
                &lt;
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-gray-400 transition-colors"
              >
                &gt;
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2 text-center">
            {daysLabel.map(day => (
              <div key={day} className="text-xs font-semibold text-slate-500 dark:text-gray-400">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {calendarData.map((item, idx) => {
              const active = isToday(item.day, item.month, item.year);
              const selected = isSelected(item.day, item.month, item.year);

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(new Date(item.year, item.month, item.day))}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all cursor-pointer relative
                    ${!item.isCurrentMonth ? 'text-slate-400 dark:text-gray-600' : 'text-slate-700 dark:text-gray-300 hover:bg-blue-500/10 dark:hover:bg-blue-500/20'}
                    ${active ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 dark:border-blue-500/50 font-bold' : ''}
                    ${selected && !active ? 'border border-slate-300 dark:border-gray-600 bg-black/5 dark:bg-white/5' : ''}
                    ${selected ? 'ring-2 ring-blue-500/30' : ''}
                  `}
                >
                  <span>{item.day}</span>
                  {item.isCurrentMonth && hasTasksOnDate(item.day, item.month, item.year) && (
                    <div className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${active ? 'bg-red-600 dark:bg-red-500' : 'bg-red-500 dark:bg-red-400/80'}`}></div>
                  )}
                  {item.isCurrentMonth && hasSchedulesOnDate(item.day, item.month, item.year) && (
                    <div className={`absolute bottom-1 w-4 h-0.5 rounded-full ${active ? 'bg-white dark:bg-blue-400' : 'bg-blue-500 dark:bg-blue-400'}`}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ───── Add Task Modal ───── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          {/* Modal */}
          <div className="glass-panel w-full max-w-md p-8 rounded-3xl relative z-10 shadow-[0_0_60px_rgba(0,123,255,0.15)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {isEditing ? 'Edit Tugas' : 'Tambah Tugas Baru'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setIsEditing(false);
                  setEditingTaskId(null);
                }}
                className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-5">
              {/* Task Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Nama Tugas</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Contoh: Review desain halaman..."
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-3 px-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all focus:bg-white/50 dark:focus:bg-white/10"
                  autoFocus
                  required
                />
              </div>

              {/* Task Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Deskripsi (Opsional)</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Tambahkan detail tugas..."
                  rows={3}
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-3 px-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all focus:bg-white/50 dark:focus:bg-white/10 resize-none"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Tanggal</label>
                  <input
                    type="date"
                    value={newTask.date}
                    onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all focus:bg-white/50 dark:focus:bg-white/10 [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Jam</label>
                  <input
                    type="time"
                    value={newTask.time}
                    onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all focus:bg-white/50 dark:focus:bg-white/10 [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Prioritas</label>
                <div className="flex gap-3">
                  {['High', 'Med', 'Low'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewTask({ ...newTask, priority: p })}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border ${newTask.priority === p
                        ? p === 'High'
                          ? 'bg-[#F15BB5]/20 text-[#F15BB5] border-[#F15BB5]/40 shadow-[0_0_10px_rgba(241,91,181,0.2)]'
                          : p === 'Med'
                            ? 'bg-[#FFE66D]/20 text-[#c4a800] dark:text-[#FFE66D] border-[#FFE66D]/40 shadow-[0_0_10px_rgba(255,230,109,0.2)]'
                            : 'bg-[#4CC9F0]/20 text-[#4CC9F0] border-[#4CC9F0]/40 shadow-[0_0_10px_rgba(76,201,240,0.2)]'
                        : 'bg-black/5 dark:bg-white/5 text-slate-500 dark:text-gray-400 border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10'
                        }`}
                    >
                      {p === 'High' ? '🪩 High' : p === 'Med' ? '🟡 Med' : '🔵 Low'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 dark:hover:from-blue-500 dark:hover:to-blue-300 text-white py-3 rounded-xl font-semibold transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,123,255,0.2)] dark:shadow-[0_0_15px_rgba(0,123,255,0.3)] mt-2"
              >
                {isEditing ? (
                  <>
                    <Save size={18} /> Simpan Perubahan
                  </>
                ) : (
                  <>
                    <Plus size={18} /> Tambah Tugas
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* ───── Success Toast ───── */}
      {showToast && (
        <div className="fixed bottom-8 right-8 z-[60] animate-slide-up">
          <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 dark:border-black/10">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <Check size={18} className="text-white" />
            </div>
            <p className="font-bold">
              {isEditing ? 'Tugas berhasil diperbarui!' : 'Tugas berhasil ditambahkan!'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
