
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { ICONS } from '../constants';

const Login: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(email, pass);
    if (!success) {
      setError('Credenciais inválidas. Padrão: admin@local / admin123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-yellow-500/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative z-10">
        <div className="p-10 space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 p-4 mb-2">
              <ICONS.Logo className="w-full h-full" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Eletrical</h1>
              <p className="text-emerald-500 font-bold text-sm tracking-[0.3em] uppercase mt-1">System Management</p>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Controle de Inventário e Ativos Elétricos</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">E-mail Corporativo</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 outline-none text-slate-900 dark:text-white font-medium"
                placeholder="nome@empresa.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Senha de Acesso</label>
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full px-5 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 outline-none text-slate-900 dark:text-white font-medium"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2 animate-shake">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all duration-300 uppercase tracking-widest text-sm"
            >
              Iniciar Sessão
            </button>
          </form>

          <div className="text-center pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
              <p className="text-[10px] text-yellow-700 dark:text-yellow-400 uppercase tracking-widest font-black">Modo Demonstração Ativo</p>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
};

export default Login;
