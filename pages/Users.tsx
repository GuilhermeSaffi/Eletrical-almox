
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { ICONS } from '../constants';
import { UserRole, User } from '../types';

const Users: React.FC = () => {
  const { user: currentUser, users, addUser, updateUserPassword } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: UserRole.USER });
  const [newPassword, setNewPassword] = useState('');

  if (currentUser?.role !== UserRole.ADMIN) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center">
           <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
        </div>
        <h2 className="text-2xl font-bold">Acesso Negado</h2>
        <p className="text-slate-500 max-w-md">Esta seção é reservada apenas para administradores da plataforma Eletrical System.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    addUser({ ...formData, avatar: `https://picsum.photos/seed/${formData.name}/200` });
    setFormData({ name: '', email: '', password: '', role: UserRole.USER });
    setShowModal(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser && newPassword) {
      await updateUserPassword(editingUser.id, newPassword);
      setNewPassword('');
      setEditingUser(null);
      setShowPassModal(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Usuários</h1>
          <p className="text-slate-500 dark:text-slate-400">Controle quem tem acesso ao sistema.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2 font-semibold"
        >
          <ICONS.Plus />
          Novo Usuário
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 divide-y divide-slate-100 dark:divide-slate-800">
          {users.map((u) => (
            <div key={u.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <img src={u.avatar} className="w-12 h-12 rounded-full border-2 border-slate-100 dark:border-slate-800" alt={u.name} />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{u.name}</h4>
                  <p className="text-sm text-slate-500">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                  u.role === UserRole.ADMIN 
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' 
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                }`}>
                  {u.role}
                </span>
                
                <button 
                  onClick={() => {
                    setEditingUser(u);
                    setShowPassModal(true);
                  }}
                  className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                  title="Alterar Senha"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </button>

                <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Criar Usuário */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold">Criar Novo Usuário</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">E-mail Corporativo</label>
                <input 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Senha de Acesso</label>
                <input 
                  type="password" 
                  required 
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Papel (Role)</label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={UserRole.USER}>Usuário Padrão</option>
                  <option value={UserRole.ADMIN}>Administrador</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 font-bold rounded-xl">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700">Criar Usuário</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Alterar Senha */}
      {showPassModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold">Alterar Senha</h3>
              <button onClick={() => {setShowPassModal(false); setEditingUser(null);}} className="text-slate-400">&times;</button>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50">
               <div className="flex items-center gap-3 mb-4">
                  <img src={editingUser.avatar} className="w-10 h-10 rounded-full" alt="" />
                  <div>
                    <p className="font-bold text-sm">{editingUser.name}</p>
                    <p className="text-xs text-slate-500">{editingUser.email}</p>
                  </div>
               </div>
            </div>
            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1 pl-1">Nova Senha</label>
                <input 
                  type="password" 
                  required 
                  autoFocus
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => {setShowPassModal(false); setEditingUser(null);}} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 font-bold rounded-xl">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-700">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
