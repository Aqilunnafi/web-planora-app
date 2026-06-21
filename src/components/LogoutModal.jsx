import React from 'react';
import { LogOut, X } from 'lucide-react';

export default function LogoutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-sm p-6 sm:p-8 rounded-[2.5rem] shadow-2xl relative animate-scale-in border border-white/20">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center mt-2">
          <div className="w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-600 dark:text-red-400 mb-6 relative">
            <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full"></div>
            <LogOut size={32} className="relative z-10" />
          </div>
          
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Keluar Akun?</h3>
          <p className="text-slate-600 dark:text-gray-400 text-sm mb-8 leading-relaxed">
            Apakah Anda yakin ingin keluar dari Planify? Anda harus masuk kembali untuk mengakses tugas dan jadwal Anda.
          </p>

          <div className="flex w-full gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 px-4 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-all border border-transparent"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3.5 px-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/25 transform hover:-translate-y-0.5"
            >
              Ya, Keluar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
