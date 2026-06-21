import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle, Zap, ArrowRight, Check, Bell, Star, TrendingUp, UserPlus, Layout, Award, Quote, HelpCircle, User } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';

/* ───── Phone Mockup Component ───── */
function PhoneMockup() {
  return (
    <div className="relative w-[280px] h-[560px] mx-auto">
      {/* Phone Frame */}
      <div className="absolute inset-0 rounded-[40px] bg-gradient-to-b from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-900 p-[3px] shadow-2xl shadow-blue-500/20">
        <div className="w-full h-full rounded-[38px] bg-slate-950 overflow-hidden relative">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-slate-950 rounded-b-2xl z-20" />

          {/* Screen Content — Mini Dashboard */}
          <div className="w-full h-full bg-gradient-to-br from-[#0c1222] to-[#0f172a] p-4 pt-10 overflow-hidden">
            {/* Mini status bar */}
            <div className="flex items-center justify-between text-[9px] text-gray-500 mb-4 px-1">
              <span>9:41</span>
              <div className="flex gap-1 items-center">
                <div className="w-3 h-1.5 border border-gray-500 rounded-sm"><div className="w-2 h-full bg-green-400 rounded-sm" /></div>
              </div>
            </div>

            {/* Mini greeting */}
            <p className="text-[10px] text-gray-400 mb-0.5">Selamat Pagi 👋</p>
            <h3 className="text-white text-sm font-bold mb-3">Dashboard</h3>

            {/* Mini Stat Cards */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-2">
                <p className="text-[8px] text-gray-400">Total</p>
                <p className="text-white text-base font-bold">24</p>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-2">
                <p className="text-[8px] text-gray-400">Selesai</p>
                <p className="text-white text-base font-bold">16</p>
              </div>
            </div>

            {/* Mini Task Items */}
            <div className="space-y-2">
              {[
                { text: 'Review desain UI', done: true, priority: 'bg-red-500' },
                { text: 'Meeting tim Frontend', done: false, priority: 'bg-yellow-500' },
                { text: 'Update database', done: false, priority: 'bg-blue-500' },
                { text: 'Testing komponen', done: false, priority: 'bg-yellow-500' },
              ].map((task, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-2">
                  <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${task.done ? 'bg-blue-500 border-blue-500' : 'border-gray-600'}`}>
                    {task.done && <Check size={8} className="text-white" />}
                  </div>
                  <span className={`text-[10px] flex-1 ${task.done ? 'text-gray-500 line-through' : 'text-gray-300'}`}>{task.text}</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${task.priority}`} />
                </div>
              ))}
            </div>

            {/* Mini bar chart */}
            <div className="mt-3 bg-white/5 border border-white/10 rounded-xl p-2.5">
              <p className="text-[8px] text-gray-400 mb-2">Produktivitas</p>
              <div className="flex items-end justify-between gap-1 h-12">
                {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                  <div key={i} className="w-full rounded-t bg-gradient-to-t from-blue-600 to-cyan-400 opacity-70" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reflection / Glow under the phone */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-48 h-12 bg-blue-500/20 rounded-full blur-2xl" />
    </div>
  );
}

/* ───── Floating UI Cards around the phone ───── */
function FloatingCard({ children, className, style }) {
  return (
    <div
      className={`glass-panel rounded-2xl p-3 shadow-lg absolute z-20 ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}


/* ───── Landing Page ───── */
export default function Landing() {
  const [scrollY, setScrollY] = useState(0);
  const [testimonials, setTestimonials] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch((import.meta.env.PROD ? '/api/testimonials' : 'http://localhost:5000/api/testimonials'));
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) setTestimonials(data);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      navigate('/dashboard');
    }
  }, [navigate]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Default testimonials if none from API
  const displayTestimonials = testimonials.length > 0 ? testimonials : [
    {
      name: "Sarah Wijaya",
      role: "Creative Director",
      content: "Planora membantu saya mengatur jadwal meeting yang sangat padat tanpa merasa kewalahan. Desainnya benar-benar juara!",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      rating: 5
    },
    {
      name: "Budi Santoso",
      role: "Software Engineer",
      content: "Fitur checklist dan pengingat deadlinenya sangat membantu pekerjaan saya. Mode gelapnya paling nyaman untuk mata.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      rating: 5
    },
    {
      name: "Linda Kusuma",
      role: "Entrepreneur",
      content: "Aplikasi manajemen tugas terbaik yang pernah saya gunakan. Ringkas, cepat, dan sangat intuitif di semua perangkat.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      rating: 5
    }
  ];

  return (
    <div className="min-h-[200vh] flex flex-col items-center pt-24 pb-32 z-10 relative transition-colors duration-300 overflow-hidden">

      {/* Parallax Floating Orbs */}
      <div
        className="absolute top-40 left-10 w-40 h-40 bg-blue-500/20 dark:bg-blue-500/30 rounded-full blur-3xl pointer-events-none"
        style={{ transform: `translateY(${scrollY * 0.5}px)` }}
      />
      <div
        className="absolute top-80 right-20 w-64 h-64 bg-cyan-500/20 dark:bg-cyan-500/30 rounded-full blur-[60px] pointer-events-none"
        style={{ transform: `translateY(${scrollY * -0.3}px)` }}
      />
      <div
        className="absolute top-[60%] left-1/4 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-2xl pointer-events-none"
        style={{ transform: `translateY(${scrollY * 0.2}px)` }}
      />

      {/* Header / Nav */}
      <nav className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center max-w-6xl mx-auto z-50 px-4">
        <Logo />
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Link to="/login" className="text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white px-4 py-2 font-medium transition-colors">
            Login
          </Link>
          <Link to="/register" className="glass-panel px-6 py-2 rounded-full font-medium hover:bg-black/5 dark:hover:bg-white/10 transition-all text-slate-900 dark:text-white">
            Daftar
          </Link>
        </div>
      </nav>

      {/* Hero Section — parallax: moves slower than scroll, fades out */}
      <div
        className="text-center max-w-3xl mt-16 mb-10 relative z-10 px-4"
        style={{
          transform: `translateY(${scrollY * 0.35}px)`,
          opacity: Math.max(1 - scrollY / 600, 0),
        }}
      >
        <h1
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-slate-900 dark:text-white"
          style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
        >
          Rencanakan Harimu, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
            Sederhanakan Hidupmu
          </span>
        </h1>
        <p className="text-xl text-slate-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
          Tingkatkan produktivitas Anda dengan sistem manajemen tugas yang elegan. Tetap fokus pada apa yang penting.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/register" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 dark:hover:from-blue-500 dark:hover:to-blue-300 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,123,255,0.3)] dark:shadow-[0_0_20px_rgba(0,123,255,0.4)]">
            Mulai Sekarang <ArrowRight size={20} />
          </Link>
          <Link to="/login" className="glass-panel px-8 py-4 rounded-full font-semibold text-lg hover:bg-black/5 dark:hover:bg-white/10 transition-all text-slate-800 dark:text-gray-200">
            Masuk ke Akun
          </Link>
        </div>
      </div>

      {/* ───── Phone Showcase Section ───── */}
      <div
        className="relative mt-10 mb-32 z-10 px-4"
        style={{
          transform: `translateY(${scrollY * -0.15}px) scale(${Math.min(1 + scrollY * 0.0002, 1.08)})`,
        }}
      >
        {/* Phone + Floating Cards */}
        <PhoneMockup />

        {/* Floating notification card — top right */}
        <FloatingCard
          className="animate-float-slow hidden md:flex items-center gap-2"
          style={{
            top: '30px',
            right: '-160px',
            transform: `translateY(${scrollY * 0.08}px)`,
          }}
        >
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
            <Bell size={14} className="text-blue-500 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-900 dark:text-white">Notifikasi Baru</p>
            <p className="text-[9px] text-slate-500 dark:text-gray-400">Meeting jam 14:00</p>
          </div>
        </FloatingCard>

        {/* Floating rating card — top left */}
        <FloatingCard
          className="animate-float-slow hidden md:flex items-center gap-2"
          style={{
            top: '80px',
            left: '-170px',
            animationDelay: '1s',
            transform: `translateY(${scrollY * -0.06}px)`,
          }}
        >
          <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
            <Star size={14} className="text-yellow-500 dark:text-yellow-400" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-900 dark:text-white">Produktivitas</p>
            <p className="text-[9px] text-slate-500 dark:text-gray-400">Naik 12% minggu ini</p>
          </div>
        </FloatingCard>

        {/* Floating completed card — bottom left */}
        <FloatingCard
          className="animate-float-slow hidden md:flex items-center gap-2"
          style={{
            bottom: '100px',
            left: '-140px',
            animationDelay: '2s',
            transform: `translateY(${scrollY * 0.05}px)`,
          }}
        >
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
            <CheckCircle size={14} className="text-green-500 dark:text-green-400" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-900 dark:text-white">Tugas Selesai!</p>
            <p className="text-[9px] text-slate-500 dark:text-gray-400">Review desain UI ✓</p>
          </div>
        </FloatingCard>

        {/* Floating trend card — bottom right */}
        <FloatingCard
          className="animate-float-slow hidden md:flex items-center gap-2"
          style={{
            bottom: '60px',
            right: '-150px',
            animationDelay: '0.5s',
            transform: `translateY(${scrollY * -0.04}px)`,
          }}
        >
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
            <TrendingUp size={14} className="text-cyan-500 dark:text-cyan-400" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-900 dark:text-white">85% Selesai</p>
            <p className="text-[9px] text-slate-500 dark:text-gray-400">Target tercapai</p>
          </div>
        </FloatingCard>
      </div>

      {/* Features Grid — parallax: rises up as you scroll */}
      <div
        className="grid md:grid-cols-3 gap-8 max-w-5xl w-full mt-10 relative z-10 px-4"
        style={{ transform: `translateY(${scrollY * -0.1}px)` }}
      >
        {/* Feature 1 */}
        <div className="bg-white dark:bg-[#161e2c] p-8 rounded-[2.5rem] text-left shadow-xl dark:shadow-2xl border-t-4 border-t-blue-500 transition-all hover:-translate-y-2 group">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-8 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
            <CheckCircle className="text-blue-600 dark:text-blue-400 group-hover:text-white" size={32} />
          </div>
          <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Manajemen Tugas</h3>
          <p className="text-slate-600 dark:text-gray-400 leading-relaxed text-lg">
            Atur dan selesaikan pekerjaan Anda dengan sistem prioritas yang cerdas dan intuitif.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="bg-white dark:bg-[#161e2c] p-8 rounded-[2.5rem] text-left shadow-xl dark:shadow-2xl border-t-4 border-t-cyan-500 mt-0 md:mt-12 transition-all hover:-translate-y-2 group">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-8 border border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-500">
            <Calendar className="text-cyan-600 dark:text-cyan-400 group-hover:text-white" size={32} />
          </div>
          <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Kalender Pintar</h3>
          <p className="text-slate-600 dark:text-gray-400 leading-relaxed text-lg">
            Visualisasikan jadwal Anda dalam tampilan grid yang indah. Jangan pernah lewatkan tenggat waktu.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="bg-white dark:bg-[#161e2c] p-8 rounded-[2.5rem] text-left shadow-xl dark:shadow-2xl border-t-4 border-t-purple-500 transition-all hover:-translate-y-2 group">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-8 border border-purple-500/20 group-hover:bg-purple-500 group-hover:text-white transition-all duration-500">
            <Zap className="text-purple-600 dark:text-purple-400 group-hover:text-white" size={32} />
          </div>
          <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Fokus & Cepat</h3>
          <p className="text-slate-600 dark:text-gray-400 leading-relaxed text-lg">
            Desain tanpa gangguan dengan mode kaca gelap yang membantu Anda tetap fokus sepanjang hari.
          </p>
        </div>
      </div>

      {/* ───── How It Works Section ───── */}
      <div className="w-full mt-40 py-32 bg-gradient-to-br from-blue-700 to-blue-900 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full border-[30px] border-white"></div>
          <div className="absolute -bottom-20 -right-20 w-[30rem] h-[30rem] rounded-full border-[50px] border-white"></div>
          <div className="absolute inset-0 opacity-20" 
               style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl md:text-6xl font-extrabold text-white mb-6">
            Hanya dalam <span className="text-cyan-300">3 Langkah</span>
          </h2>
          <p className="text-blue-100/80 mb-24 max-w-2xl mx-auto text-xl font-medium">
            Sederhanakan manajemen waktu Anda dengan alur yang sangat intuitif.
          </p>

          <div className="grid md:grid-cols-3 gap-16 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-[48px] left-[20%] right-[20%] h-0.5 border-t-2 border-dashed border-white/20 z-0"></div>

            {[
              { 
                icon: UserPlus, 
                title: "Buat Akun", 
                desc: "Daftar gratis dalam hitungan detik dan atur preferensi notifikasi Anda.",
                iconColor: "text-blue-400"
              },
              { 
                icon: Layout, 
                title: "Input Agenda", 
                desc: "Tambahkan tugas harian dan jadwal penting Anda ke dalam kalender pintar.",
                iconColor: "text-cyan-300"
              },
              { 
                icon: Award, 
                title: "Capai Target", 
                desc: "Pantau progress Anda dan selesaikan semua rencana tepat waktu.",
                iconColor: "text-purple-300"
              }
            ].map((step, i) => (
              <div key={i} className="relative z-10 group">
                <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mx-auto mb-8 transition-all group-hover:bg-white/20 group-hover:scale-110 shadow-2xl">
                  <step.icon className={step.iconColor} size={40} />
                  <div className="absolute -top-3 -right-3 w-10 h-10 rounded-2xl bg-white text-blue-900 flex items-center justify-center text-lg font-black shadow-xl">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white tracking-tight">{step.title}</h3>
                <p className="text-blue-100/70 leading-relaxed font-medium">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ───── Testimonials Section ───── */}
      <div className="max-w-6xl w-full mt-48 relative z-10 px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Dipercaya oleh <span className="text-cyan-500">Ribuan Pengguna</span>
          </h2>
          <p className="text-slate-600 dark:text-gray-400 max-w-xl mx-auto">
            Dengar apa yang mereka katakan tentang bagaimana Planora mengubah produktivitas mereka.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {displayTestimonials.map((testi, i) => (
            <div key={i} className="glass-panel p-8 rounded-3xl relative group hover:bg-white/80 dark:hover:bg-white/15 transition-all">
              <Quote className="absolute top-6 right-8 text-blue-500/10 group-hover:text-blue-500/20 transition-all" size={60} />
              <div className="flex items-center gap-4 mb-6">
                {testi.avatar ? (
                  <img src={testi.avatar} alt={testi.name} className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/20" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border-2 border-blue-500/20">
                    <User size={24} className="text-blue-500" />
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{testi.name}</h4>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{testi.role}</p>
                </div>
              </div>
              <p className="text-slate-600 dark:text-gray-400 italic leading-relaxed">
                "{testi.content}"
              </p>
              <div className="flex gap-1 mt-6">
                {[...Array(testi.rating || 5)].map((_, s) => <Star key={s} size={14} className="fill-yellow-500 text-yellow-500" />)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ───── FAQ Section ───── */}
      <div className="max-w-4xl w-full mt-48 relative z-10 px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">Pertanyaan Umum</h2>
          <p className="text-slate-600 dark:text-gray-400">Punya pertanyaan? Kami punya jawabannya.</p>
        </div>

        <div className="space-y-4">
          {[
            { q: "Apakah Planora gratis?", a: "Ya! Anda dapat menggunakan fitur dasar manajemen tugas dan jadwal secara gratis selamanya." },
            { q: "Apakah data saya aman?", a: "Keamanan data adalah prioritas kami. Semua data Anda disimpan dengan enkripsi dan hanya dapat diakses oleh Anda." },
            { q: "Apakah bisa sinkron di banyak perangkat?", a: "Tentu saja. Anda dapat mengakses Planora melalui perangkat apa pun dan data Anda akan selalu sinkron." }
          ].map((faq, i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl border border-white/10">
              <div className="flex gap-4">
                <HelpCircle className="text-blue-500 shrink-0" size={24} />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">{faq.q}</h4>
                  <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ───── Footer ───── */}
      <footer className="w-full max-w-6xl mt-32 relative z-10 px-4">
        <div className="glass-panel rounded-3xl p-10">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="mb-4">
                <Logo size="text-xl" />
              </div>
              <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed">
                Sederhanakan hidup Anda dengan manajemen tugas yang cerdas dan intuitif.
              </p>
            </div>

            {/* Produk */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Produk</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-slate-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Fitur</a></li>
                <li><a href="#" className="text-sm text-slate-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Harga</a></li>
                <li><a href="#" className="text-sm text-slate-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Integrasi</a></li>
                <li><a href="#" className="text-sm text-slate-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Changelog</a></li>
              </ul>
            </div>

            {/* Perusahaan */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Perusahaan</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-slate-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Tentang Kami</a></li>
                <li><a href="#" className="text-sm text-slate-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</a></li>
                <li><a href="#" className="text-sm text-slate-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Karir</a></li>
                <li><a href="#" className="text-sm text-slate-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Kontak</a></li>
              </ul>
            </div>

            {/* Dukungan */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Dukungan</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-slate-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Pusat Bantuan</a></li>
                <li><a href="#" className="text-sm text-slate-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Dokumentasi</a></li>
                <li><a href="#" className="text-sm text-slate-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Kebijakan Privasi</a></li>
                <li><a href="#" className="text-sm text-slate-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Syarat & Ketentuan</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-black/10 dark:border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500 dark:text-gray-500">
              © 2026 Planora By Aqilunnafi
            </p>
            <div className="flex items-center gap-4">
              {/* Social Icons as simple circles */}
              <a href="#" className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/30 transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/30 transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/30 transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
