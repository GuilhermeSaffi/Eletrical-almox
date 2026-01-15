
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { ICONS, COLORS } from '../constants';
import { MovementType } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts';

const Movements: React.FC = () => {
  const { movements, items, registerMovement } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [formData, setFormData] = useState({
    itemId: items[0]?.id || '',
    type: MovementType.EXIT,
    quantity: 1,
    reason: ''
  });

  // Dados para o Gráfico
  const totalEntries = movements
    .filter(m => m.type === MovementType.ENTRY)
    .reduce((acc, curr) => acc + curr.quantity, 0);
  
  const totalExits = movements
    .filter(m => m.type === MovementType.EXIT)
    .reduce((acc, curr) => acc + curr.quantity, 0);

  const chartData = [
    { name: 'Entradas', volume: totalEntries, color: '#10b981' },
    { name: 'Saídas', volume: totalExits, color: '#ef4444' }
  ];

  const filteredMovements = movements.filter(m => 
    m.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await registerMovement(formData);
    setFormData({ ...formData, quantity: 1, reason: '' });
    setShowModal(false);
  };

  const handleDownloadPDF = async () => {
    const html2pdf = (window as any).html2pdf;
    if (!html2pdf) {
      alert("Biblioteca PDF não carregada.");
      return;
    }

    setIsGenerating(true);
    try {
      const element = document.createElement('div');
      
      element.innerHTML = `
        <div style="padding: 40px; font-family: 'Inter', sans-serif; color: #0f172a; background: #ffffff; width: 800px; min-height: 1100px; position: relative; border: 1px solid #f1f5f9;">
          <!-- Barra Lateral de Accent -->
          <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 8px; background: linear-gradient(to bottom, #2563eb, #8b5cf6);"></div>
          
          <!-- Cabeçalho Ultra Moderno -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 50px; padding-left: 20px;">
            <div>
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <div style="background: #2563eb; color: white; width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 22px; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);">E</div>
                <h1 style="margin: 0; font-weight: 900; font-size: 32px; letter-spacing: -1.5px; color: #0f172a;">Eletrical System</h1>
              </div>
              <p style="margin: 0; font-size: 14px; color: #64748b; font-weight: 500; letter-spacing: 0.5px;">Analytics & Resource Control Report</p>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; font-size: 14px; font-weight: 800; color: #2563eb; text-transform: uppercase; letter-spacing: 2px;">Auditoria de Fluxo</h2>
              <div style="margin-top: 12px; display: inline-block; background: #f1f5f9; padding: 6px 14px; border-radius: 10px; font-size: 12px; color: #475569; font-weight: 700;">
                Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          </div>

          <!-- Cards de Resumo Estilizados -->
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; margin-bottom: 50px; padding-left: 20px;">
            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 24px; border-radius: 24px; border: 1px solid rgba(22, 163, 74, 0.1); position: relative; overflow: hidden;">
              <p style="margin: 0; font-size: 11px; color: #166534; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">Total Entradas</p>
              <p style="margin: 0; font-size: 34px; font-weight: 900; color: #15803d; letter-spacing: -1px;">+ ${totalEntries}</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); padding: 24px; border-radius: 24px; border: 1px solid rgba(153, 27, 27, 0.1); position: relative; overflow: hidden;">
              <p style="margin: 0; font-size: 11px; color: #991b1b; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">Total Saídas</p>
              <p style="margin: 0; font-size: 34px; font-weight: 900; color: #b91c1c; letter-spacing: -1px;">- ${totalExits}</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 24px; border-radius: 24px; border: 1px solid #e2e8f0; position: relative; overflow: hidden;">
              <p style="margin: 0; font-size: 11px; color: #475569; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">Balanço Líquido</p>
              <p style="margin: 0; font-size: 34px; font-weight: 900; color: #1e293b; letter-spacing: -1px;">${totalEntries - totalExits}</p>
            </div>
          </div>

          <!-- Tabela de Movimentações -->
          <div style="padding-left: 20px;">
            <table style="width: 100%; border-collapse: separate; border-spacing: 0 8px;">
              <thead>
                <tr style="text-align: left;">
                  <th style="padding: 12px 20px; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px;">Produto / Ativo</th>
                  <th style="padding: 12px 20px; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; text-align: center;">Variação</th>
                  <th style="padding: 12px 20px; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px;">Responsável</th>
                  <th style="padding: 12px 20px; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; text-align: right;">Data</th>
                </tr>
              </thead>
              <tbody>
                ${movements.map((m, idx) => `
                  <tr style="background: ${idx % 2 === 0 ? '#fcfdfe' : '#ffffff'};">
                    <td style="padding: 18px 20px; border-radius: 16px 0 0 16px; border-bottom: 1px solid #f1f5f9;">
                      <div style="font-size: 14px; font-weight: 800; color: #1e293b;">${m.itemName}</div>
                      <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Obs: ${m.reason}</div>
                    </td>
                    <td style="padding: 18px 20px; text-align: center; border-bottom: 1px solid #f1f5f9;">
                      <div style="display: inline-flex; align-items: center; justify-content: center; background: ${m.type === MovementType.ENTRY ? '#dcfce7' : '#fee2e2'}; color: ${m.type === MovementType.ENTRY ? '#15803d' : '#b91c1c'}; width: 44px; height: 44px; border-radius: 12px; font-size: 14px; font-weight: 900;">
                        ${m.type === MovementType.ENTRY ? '+' : '-'}${m.quantity}
                      </div>
                    </td>
                    <td style="padding: 18px 20px; border-bottom: 1px solid #f1f5f9;">
                      <div style="font-size: 13px; color: #475569; font-weight: 700;">${m.userName}</div>
                    </td>
                    <td style="padding: 18px 20px; text-align: right; border-radius: 0 16px 16px 0; border-bottom: 1px solid #f1f5f9;">
                      <div style="font-size: 13px; font-weight: 700; color: #1e293b;">${new Date(m.createdAt).toLocaleDateString('pt-BR')}</div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Rodapé -->
          <div style="margin-top: auto; padding: 40px 20px 0 20px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: flex-end; position: absolute; bottom: 40px; left: 40px; right: 40px;">
            <p style="margin: 0; font-size: 10px; color: #cbd5e1; font-weight: 500;">Eletrical System Management Suite - Relatório de Auditoria v3.2</p>
          </div>
        </div>
      `;

      const opt = {
        margin: 0,
        filename: `Audit_Movements_EletricalSystem_${new Date().getTime()}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().from(element).set(opt).save();
    } catch (err) {
      console.error(err);
      alert("Houve um erro técnico ao formatar o relatório PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Movimentações</h1>
          <p className="text-slate-500 dark:text-slate-400">Análise de fluxo e histórico de entradas/saídas.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="flex-1 sm:flex-none px-6 py-3 bg-white dark:bg-slate-900 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 font-bold disabled:opacity-50"
          >
            {isGenerating ? (
              <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            )}
            Relatório Auditável
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 font-semibold"
          >
            <ICONS.Plus />
            Registrar Ajuste
          </button>
        </div>
      </div>

      {/* Seção Analítica: Gráfico */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Fluxo de Volume</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Entradas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Saídas</span>
            </div>
          </div>
        </div>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} stroke="#94a3b8" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', color: '#fff' }}
              />
              <Bar dataKey="volume" radius={[12, 12, 0, 0]} barSize={80}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex gap-4 items-center">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <input
            type="text"
            placeholder="Buscar por produto ou motivo..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Produto</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Tipo</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Qtd</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Motivo</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Responsável / Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMovements.length > 0 ? (
                filteredMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{m.itemName}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        m.type === MovementType.ENTRY 
                          ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {m.type === MovementType.ENTRY ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-700 dark:text-slate-300">
                      {m.type === MovementType.ENTRY ? '+' : '-'}{m.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {m.reason}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{m.userName}</p>
                      <p className="text-xs text-slate-400">{new Date(m.createdAt).toLocaleString('pt-BR')}</p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    Nenhuma movimentação registrada recentemente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-white">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold">Registrar Movimentação</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-light">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 pl-1">Produto</label>
                <select 
                  value={formData.itemId}
                  onChange={e => setFormData({...formData, itemId: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {items.map(i => <option key={i.id} value={i.id}>{i.name} (Saldo: {i.quantity})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 pl-1">Tipo</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as MovementType})}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value={MovementType.ENTRY}>Entrada (+)</option>
                    <option value={MovementType.EXIT}>Saída (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 pl-1">Quantidade</label>
                  <input 
                    type="number" 
                    min="1"
                    required 
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 pl-1">Motivo / Observação</label>
                <input 
                  type="text" 
                  required 
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ex: Saída para projeto X"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors">Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Movements;
