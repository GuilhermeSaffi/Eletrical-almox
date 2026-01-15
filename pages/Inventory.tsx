
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../store/AppContext';
import { ICONS } from '../constants';
import { InventoryItem } from '../types';

interface InventoryProps {
  setActiveTab: (tab: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ setActiveTab }) => {
  const { items, categories, addItem, deleteItem, updateItem, highlightedItemId, setHighlightedItemId, setPendingPurchaseItemId } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const highlightedRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (highlightedItemId) {
      setSearchTerm('');
      setFilterCategory('all');
      
      const timer = setTimeout(() => {
        if (highlightedRef.current) {
          highlightedRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);

      const clearTimer = setTimeout(() => {
        setHighlightedItemId(null);
      }, 5000);

      return () => {
        clearTimeout(timer);
        clearTimeout(clearTimer);
      };
    }
  }, [highlightedItemId, setHighlightedItemId]);

  const filteredItems = items.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         i.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || i.categoryId === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenModal = (item?: InventoryItem) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        name: item.name,
        sku: item.sku,
        categoryId: item.categoryId,
        quantity: item.quantity,
        minQuantity: item.minQuantity,
        price: item.price
      });
    } else {
      setSelectedItem(null);
      setFormData({
        name: '',
        sku: '',
        categoryId: categories[0]?.id || '',
        quantity: 0,
        minQuantity: 5,
        price: 0
      });
    }
    setShowModal(true);
  };

  const handleRefillRequest = (itemId: string) => {
    setPendingPurchaseItemId(itemId);
    setActiveTab('purchase_orders');
  };

  const handleExportPDF = async () => {
    const html2pdf = (window as any).html2pdf;
    if (!html2pdf) {
      alert("Biblioteca PDF não carregada. Por favor, recarregue a página.");
      return;
    }

    setIsGenerating(true);
    try {
      const totalInventoryValue = items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
      const lowStockCount = items.filter(i => i.quantity <= i.minQuantity).length;
      
      const element = document.createElement('div');
      
      let categoriesHtml = '';
      categories.forEach(cat => {
        const catItems = items.filter(i => i.categoryId === cat.id);
        if (catItems.length === 0) return;

        const catValue = catItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

        categoriesHtml += `
          <div style="margin-bottom: 40px; page-break-inside: avoid; background: #ffffff; border-radius: 20px; border: 1px solid #f1f5f9; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <div style="background: #f8fafc; padding: 20px 25px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h3 style="margin: 0; color: #0f172a; font-size: 18px; font-weight: 900; letter-spacing: -0.5px;">${cat.name}</h3>
                <p style="margin: 4px 0 0 0; font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">${catItems.length} Itens cadastrados</p>
              </div>
              <div style="text-align: right;">
                <p style="margin: 0; font-size: 10px; color: #94a3b8; font-weight: 800; text-transform: uppercase;">Subtotal em Ativos</p>
                <p style="margin: 0; font-size: 16px; font-weight: 900; color: #10b981;">R$ ${catValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead>
                <tr style="text-align: left; color: #64748b; background: #ffffff;">
                  <th style="padding: 15px 25px; border-bottom: 2px solid #f1f5f9; font-weight: 800; font-size: 10px; text-transform: uppercase;">Item / Descrição</th>
                  <th style="padding: 15px 25px; border-bottom: 2px solid #f1f5f9; font-weight: 800; font-size: 10px; text-transform: uppercase; text-align: center;">Estoque</th>
                  <th style="padding: 15px 25px; border-bottom: 2px solid #f1f5f9; font-weight: 800; font-size: 10px; text-transform: uppercase; text-align: right;">P. Unitário</th>
                  <th style="padding: 15px 25px; border-bottom: 2px solid #f1f5f9; font-weight: 800; font-size: 10px; text-transform: uppercase; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${catItems.map(item => `
                  <tr>
                    <td style="padding: 15px 25px; border-bottom: 1px solid #f1f5f9;">
                      <div style="font-weight: 700; color: #1e293b; font-size: 13px;">${item.name}</div>
                      <div style="font-size: 10px; color: #94a3b8; font-family: monospace; margin-top: 2px;">SKU: ${item.sku}</div>
                    </td>
                    <td style="padding: 15px 25px; border-bottom: 1px solid #f1f5f9; text-align: center;">
                      <div style="display: inline-block; padding: 4px 10px; border-radius: 8px; font-weight: 800; font-size: 12px; ${item.quantity <= item.minQuantity ? 'background: #fef2f2; color: #ef4444;' : 'background: #f0fdf4; color: #166534;'}">
                        ${item.quantity} ${item.quantity <= item.minQuantity ? '⚠️' : ''}
                      </div>
                    </td>
                    <td style="padding: 15px 25px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #64748b;">R$ ${item.price.toFixed(2)}</td>
                    <td style="padding: 15px 25px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 800; color: #1e293b;">R$ ${(item.quantity * item.price).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      });

      element.innerHTML = `
        <div style="padding: 50px; font-family: 'Inter', system-ui, sans-serif; background: #ffffff; color: #1e293b; min-height: 1000px; position: relative;">
          <!-- Cabeçalho Institucional -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 60px;">
            <div style="display: flex; align-items: center; gap: 15px;">
              <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); width: 50px; height: 50px; border-radius: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.2);">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
              </div>
              <div>
                <h1 style="margin: 0; font-size: 32px; font-weight: 900; color: #0f172a; letter-spacing: -1.5px; text-transform: uppercase;">Eletrical <span style="color: #10b981;">System</span></h1>
                <p style="margin: 2px 0 0 0; font-size: 13px; color: #64748b; font-weight: 500; letter-spacing: 0.5px;">Gestão de Ativos Elétricos e Industriais</p>
              </div>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; font-size: 14px; font-weight: 800; color: #10b981; text-transform: uppercase; letter-spacing: 2px;">Relatório de Inventário</h2>
              <div style="margin-top: 10px; display: inline-block; background: #f8fafc; border: 1px solid #f1f5f9; padding: 6px 15px; border-radius: 10px; font-size: 12px; color: #475569; font-weight: 700;">
                Gerado: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}
              </div>
            </div>
          </div>

          <!-- Sumário Executivo -->
          <div style="display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 20px; margin-bottom: 50px;">
            <div style="background: #0f172a; color: white; padding: 30px; border-radius: 24px; box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1);">
              <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; font-weight: 800; margin-bottom: 12px;">Valor Total Consolidado</p>
              <h2 style="margin: 0; font-size: 34px; font-weight: 900; letter-spacing: -1px;">R$ ${totalInventoryValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
            </div>
            <div style="background: #ffffff; border: 1px solid #f1f5f9; padding: 30px; border-radius: 24px;">
              <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 800; margin-bottom: 12px;">Total de SKUs</p>
              <h2 style="margin: 0; font-size: 34px; font-weight: 900; color: #1e293b;">${items.length}</h2>
            </div>
            <div style="background: #fff; border: 1px solid ${lowStockCount > 0 ? '#fee2e2' : '#f1f5f9'}; padding: 30px; border-radius: 24px;">
              <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 800; margin-bottom: 12px;">Alertas Críticos</p>
              <h2 style="margin: 0; font-size: 34px; font-weight: 900; color: ${lowStockCount > 0 ? '#ef4444' : '#10b981'};">${lowStockCount}</h2>
            </div>
          </div>

          <!-- Listagem por Categorias -->
          ${categoriesHtml}

          <!-- Rodapé -->
          <div style="margin-top: 60px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 30px;">
            <p style="font-size: 11px; color: #cbd5e1; font-weight: 500; line-height: 1.6;">Este documento é uma representação oficial do inventário da Eletrical System.<br/>Relatório digital para fins de conformidade e auditoria interna.</p>
          </div>
        </div>
      `;

      const opt = {
        margin: 0,
        filename: `Inventory_EletricalSystem_${new Date().getTime()}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { scale: 2.5, useCORS: true, letterRendering: true, backgroundColor: '#ffffff' },
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

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryId: categories[0]?.id || '',
    quantity: 0,
    minQuantity: 5,
    price: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItem) {
      await updateItem({ ...selectedItem, ...formData });
    } else {
      await addItem(formData);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Inventário</h1>
          <p className="text-slate-500 dark:text-slate-400">Total de {items.length} componentes cadastrados.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={handleExportPDF}
            disabled={isGenerating}
            className="flex-1 sm:flex-none px-6 py-3 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 font-bold disabled:opacity-50"
          >
            {isGenerating ? (
              <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
            ) : (
              <ICONS.Printer />
            )}
            Relatório PDF
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex-1 sm:flex-none px-6 py-3 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2 font-semibold"
          >
            <ICONS.Plus />
            Novo Item
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <input
            type="text"
            placeholder="Buscar por nome ou SKU..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-slate-900 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent outline-none flex-1 text-slate-900 dark:text-white cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <option value="all">Todas Categorias</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Item / SKU</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Categoria</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Quantidade</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Preço Unit.</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const isLow = item.quantity <= item.minQuantity;
                  const isHighlighted = highlightedItemId === item.id;
                  return (
                    <tr 
                      key={item.id} 
                      ref={isHighlighted ? highlightedRef : null}
                      className={`transition-all duration-700 ${
                        isHighlighted 
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 ring-2 ring-emerald-500 dark:ring-emerald-400' 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900 dark:text-white">{item.name}</p>
                        <p className="text-xs text-slate-400 font-mono tracking-tight">{item.sku}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400">
                          {categories.find(c => c.id === item.categoryId)?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isLow ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>
                            {item.quantity}
                          </span>
                          {isLow && (
                            <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-[10px] font-bold text-amber-600 rounded uppercase">Baixo</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">Min: {item.minQuantity}</p>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                        R$ {item.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-1">
                        <button 
                          onClick={() => handleRefillRequest(item.id)}
                          className={`p-2 rounded-lg transition-all ${isLow ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}
                          title="Solicitar Reposição"
                        >
                          <ICONS.PurchaseOrder />
                        </button>
                        <button 
                          onClick={() => handleOpenModal(item)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        </button>
                        <button 
                          onClick={async () => {
                            if (window.confirm(`Tem certeza que deseja deletar "${item.name}"?`)) {
                              try {
                                await deleteItem(item.id);
                                alert('Item deletado com sucesso!');
                              } catch (err) {
                                console.error('Erro:', err);
                                alert(`Erro ao deletar item: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
                              }
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          title="Deletar item"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    Nenhum item encontrado com os filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-white">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold">{selectedItem ? 'Editar Item' : 'Novo Item'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-light">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1 pl-1">Nome do Componente</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 pl-1">SKU / Código</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.sku}
                    onChange={e => setFormData({...formData, sku: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 pl-1">Categoria</label>
                  <select 
                    value={formData.categoryId}
                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 pl-1">Quantidade</label>
                  <input 
                    type="number" 
                    required 
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 pl-1">Estoque Mínimo</label>
                  <input 
                    type="number" 
                    required 
                    value={formData.minQuantity}
                    onChange={e => setFormData({...formData, minQuantity: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1 pl-1">Preço (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required 
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-colors">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
