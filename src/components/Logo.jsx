import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.jpg';

export default function Logo({ size = 'text-2xl' }) {
  const user = localStorage.getItem('user');
  const target = user ? '/dashboard' : '/';

  return (
    <Link to={target} className={`${size} font-bold text-slate-900 dark:text-white flex items-center tracking-tight gap-3`}>
      <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-black/5 dark:border-white/10">
        <img src={logo} alt="Planify Logo" className="w-full h-full object-cover" />
      </div>
      <span className="text-3xl text-slate-900 dark:text-white">Planora</span>
    </Link>
  );
}
