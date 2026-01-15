
import React, { useRef, useState } from 'react';
import { useApp } from '../store/AppContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, Legend 
} from 'recharts';
import { COLORS } from '../constants';

const Dashboard: React.FC = () => {
  const { items, categories } = useApp();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Dados baseados no estado real
  const categoryStats = categories.map(cat => ({
    name: cat.name,
    count: items.filter(item => item.categoryId === cat.id).length,
    value: items.filter(item => item.categoryId === cat.id).reduce((acc, curr) => acc + (curr.price * curr.quantity), 0)
  }));

  const totalStockValue = items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const lowStockItemsCount = items.filter(i => i.quantity <= i.minQuantity).length;
  const healthyItemsCount = items.length - lowStockItemsCount;
  const totalItemsCount = items.reduce((acc, curr) => acc + curr.quantity, 0);

  const handleExportImage = async () => {
    if (!dashboardRef.current) return;
    
    // html2canvas está incluso no bundle do html2pdf.js carregado no index.html
    const html2canvas = (window as any).html2canvas;
    if (!html2canvas) {
      alert("Ferramenta de captura não encontrada. Recarregue a página.");
      return;
    }

    setIsExporting(true);
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        backgroundColor: document.documentElement.classList.contains('dark') ? '#020617' : '#f8fafc',
        scale: 2, // Alta qualidade
        useCORS: true,
        logging: false,
        ignoreElements: (element: HTMLElement) => element.classList.contains('no-export')
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `EletricalSystem_Dashboard_${new Date().getTime()}.png`;
      link.click();
    } catch (error) {
      console.error("Erro ao exportar imagem:", error);
      alert("Falha ao gerar captura do dashboard.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div ref={dashboardRef} className="space-y-8 animate-in fade-in duration-700 pb-12 p-4">
      {/* Header com Saudação */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
            ELETRICAL <span className="text-emerald-500">SYSTEM</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">Monitoramento avançado de rede e ativos.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportImage}
            disabled={isExporting}
            className="no-export flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold text-sm disabled:opacity-50"
          >
            {isExporting ? (
              <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
            )}
            {isExporting ? 'Capturando...' : 'Exportar Snapshot'}
          </button>
          <div className="no-export hidden lg:flex items-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
             <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">Rede Estável</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="relative group overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-emerald-500/5 transition-all duration-300">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mb-2">Valor Total Ativos</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">R$ {totalStockValue.toLocaleString('pt-BR')}</p>
          <div className="mt-4 flex items-center gap-2">
             <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-md">AUDITADO</span>
          </div>
        </div>

        <div className="relative group overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-yellow-500/5 transition-all duration-300">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl"></div>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mb-2">Volume em Unidades</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{totalItemsCount.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-2">Distribuição em <span className="font-bold text-yellow-600 dark:text-yellow-500">{items.length}</span> SKUs</p>
        </div>

        <div className="relative group overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-red-500/5 transition-all duration-300">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/10 rounded-full blur-2xl"></div>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mb-2">Alertas de Reposição</p>
          <p className="text-3xl font-black text-red-500">{lowStockItemsCount}</p>
          <div className="mt-4 flex items-center gap-2">
             <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${lowStockItemsCount > 0 ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'}`}>
                {lowStockItemsCount > 0 ? 'INTERVENÇÃO IMEDIATA' : 'FLUXO NOMINAL'}
             </span>
          </div>
        </div>

        <div className="relative group overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-500/5 transition-all duration-300">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mb-2">Categorias de Rede</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{categories.length}</p>
          <p className="text-xs text-slate-400 mt-2">Estratificação Eficiente</p>
        </div>
      </div>

      {/* Grid de Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico 1: Volume por Categoria */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Capacidade por Setor</h3>
            <span className="text-[10px] font-black px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full tracking-widest uppercase">QTD ITENS</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.1} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(34, 197, 94, 0.05)'}}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)' 
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" radius={[10, 10, 0, 0]} barSize={40}>
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Valor Financeiro por Categoria */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Aporte de Capital/Setor</h3>
            <span className="text-[10px] font-black px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full tracking-widest uppercase">VALOR EM R$</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
