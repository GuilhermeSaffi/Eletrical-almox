
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { ICONS } from '../constants';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { user, logout, isDarkMode, toggleDarkMode, items, acknowledgedAlertIds, acknowledgeAlert, clearAllAlerts, setHighlightedItemId } = useApp();
  // Alterado para false para iniciar o menu recolhido por padrão
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return <>{children}</>;

  const lowStockItems = items.filter(item => item.quantity <= item.minQuantity);
  const activeAlerts = lowStockItems.filter(item => !acknowledgedAlertIds.includes(item.id));

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <ICONS.Dashboard />, roles: [UserRole.ADMIN, UserRole.USER] },
    { id: 'inventory', label: 'Inventário', icon: <ICONS.Inventory />, roles: [UserRole.ADMIN, UserRole.USER] },
    { id: 'movements', label: 'Movimentações', icon: <ICONS.Movement />, roles: [UserRole.ADMIN, UserRole.USER] },
    { id: 'categories', label: 'Categorias', icon: <ICONS.Categories />, roles: [UserRole.ADMIN, UserRole.USER] },
    { id: 'purchase_orders', label: 'Ordens de Compra', icon: <ICONS.PurchaseOrder />, roles: [UserRole.ADMIN, UserRole.USER] },
    { id: 'users', label: 'Usuários', icon: <ICONS.Users />, roles: [UserRole.ADMIN] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user.role));

  const handleNotificationClick = (itemId: string) => {
    setHighlightedItemId(itemId);
    setActiveTab('inventory');
    setIsNotificationsOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <aside className={`no-print bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 flex items-center gap-3">
          <div className="p-1 rounded-lg">
            <ICONS.Logo className="w-10 h-10" />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col">
              <span className="font-black text-lg leading-tight tracking-tight text-slate-800 dark:text-white uppercase">Eletrical</span>
              <span className="font-bold text-xs leading-none tracking-widest text-emerald-500 uppercase">System</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {filteredMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {item.icon}
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
           <button 
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-4 p-3 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
          >
            {isDarkMode ? <ICONS.Sun /> : <ICONS.Moon />}
            {isSidebarOpen && <span className="font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-4 p-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-2"
          >
            <ICONS.Logout />
            {isSidebarOpen && <span className="font-medium">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 relative no-print">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all relative"
              >
                <ICONS.Bell />
                {activeAlerts.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900">
                    {activeAlerts.length}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h4 className="font-bold text-slate-900 dark:text-white">Alertas de Estoque</h4>
                    {activeAlerts.length > 0 && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          clearAllAlerts();
                        }}
                        className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Limpar Tudo
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {activeAlerts.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Sem alertas ativos no momento.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {activeAlerts.map(item => (
                          <div 
                            key={item.id}
                            className="w-full p-4 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group relative"
                          >
                            <div className="mt-0.5 text-amber-500">
                              <ICONS.Alert />
                            </div>
                            <div className="flex-1 min-w-0" onClick={() => handleNotificationClick(item.id)}>
                              <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors cursor-pointer flex items-center gap-2">
                                {item.name}
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-100 transition-opacity"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-slate-500">Qtd: <span className="font-bold text-red-500">{item.quantity}</span></p>
                                <span className="text-slate-300">|</span>
                                <p className="text-xs text-slate-500">Mín: {item.minQuantity}</p>
                              </div>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                acknowledgeAlert(item.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
                              title="Remover este alerta"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">{user.role}</p>
              </div>
              <img 
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} 
                alt="User" 
                className="w-10 h-10 rounded-full border-2 border-slate-100 dark:border-slate-800"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 print:p-0">
          {children}
        </div>
      </main>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { 
            background: white !important; 
            color: black !important; 
            margin: 0 !important;
            padding: 0 !important;
          }
          #root { display: block !important; }
          main { 
            display: block !important; 
            overflow: visible !important; 
            width: 100% !important;
          }
          .flex-1 { overflow: visible !important; }
          @page {
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
