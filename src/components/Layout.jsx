import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, LogOut, Calendar, ListTodo } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';
import NotificationManager from './NotificationManager';
import LogoutModal from './LogoutModal';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [location]);

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('user');
    setIsLogoutModalOpen(false);
    navigate('/auth');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Tugas', path: '/tasks', icon: ListTodo },
    { name: 'Jadwal', path: '/schedules', icon: Calendar },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen text-slate-900 dark:text-white font-sans transition-colors duration-300">
      <NotificationManager />
      
      {/* Mobile Top Header */}
      <header className="md:hidden glass-panel sticky top-0 z-30 px-6 py-4 flex items-center justify-between border-b border-black/10 dark:border-white/10">
        <Logo />
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="w-64 glass-panel m-4 rounded-3xl flex-col hidden md:flex z-10 sticky top-4 h-[calc(100vh-2rem)] overflow-y-auto custom-scrollbar">
        <div className="p-8">
          <Logo />
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/20 dark:border-blue-500/30 shadow-[0_0_15px_rgba(0,123,255,0.1)] dark:shadow-[0_0_15px_rgba(0,123,255,0.2)]' 
                    : 'text-slate-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-6 border-t border-black/10 dark:border-white/10 mt-auto space-y-4">
          {user && (
            <div className="px-4 py-2">
              <p className="text-xs font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-wider mb-1">Akun</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
            </div>
          )}
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-sm font-medium text-slate-600 dark:text-gray-400">Theme</span>
            <ThemeToggle />
          </div>
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 dark:text-gray-400 hover:bg-red-500/10 dark:hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400 hover:border hover:border-red-500/20 dark:hover:border-red-500/30 transition-all duration-300 group"
          >
            <LogOut size={20} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 pb-24 md:pb-8 overflow-y-auto z-10">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden glass-panel fixed bottom-0 left-0 right-0 z-40 px-6 py-3 flex justify-around border-t border-black/10 dark:border-white/10 safe-area-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? 'text-blue-600 dark:text-blue-400 scale-110' 
                  : 'text-slate-500 dark:text-gray-400'
              }`}
            >
              <Icon size={24} className={isActive ? 'drop-shadow-[0_0_8px_rgba(37,99,235,0.4)]' : ''} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Confirmation Modal */}
      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={handleConfirmLogout} 
      />
    </div>
  );
}
