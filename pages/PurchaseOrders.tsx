
import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { ICONS } from '../constants';
import { PurchaseOrder, OrderStatus, PurchaseOrderItem } from '../types';

const PurchaseOrders: React.FC = () => {
  const { purchaseOrders, items, addPurchaseOrder, receiveOrder, cancelOrder, pendingPurchaseItemId, setPendingPurchaseItemId } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [formData, setFormData] = useState({
    supplier: '',
    selectedItems: [] as PurchaseOrderItem[]
  });

  const [currentItem, setCurrentItem] = useState({
    itemId: items[0]?.id || '',
    quantity: 1,
    unitPrice: 0
  });

  useEffect(() => {
    if (pendingPurchaseItemId) {
      const invItem = items.find(i => i.id === pendingPurchaseItemId);
      if (invItem) {
        setFormData({ supplier: '', selectedItems: [{
          itemId: invItem.id,
          name: invItem.name,
          quantity: Math.max(1, invItem.minQuantity - invItem.quantity + 10),
          unitPrice: invItem.price
        }]});
        setShowModal(true);
        setPendingPurchaseItemId(null);
      }
    }
  }, [pendingPurchaseItemId, items, setPendingPurchaseItemId]);

  const handleAddItem = () => {
    const invItem = items.find(i => i.id === currentItem.itemId);
    if (invItem) {
      setFormData(prev => ({
        ...prev,
        selectedItems: [...prev.selectedItems, {
          itemId: invItem.id,
          name: invItem.name,
          quantity: currentItem.quantity,
          unitPrice: currentItem.unitPrice
        }]
      }));
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.selectedItems.length === 0) return alert("Adicione ao menos um item.");
    
    const total = formData.selectedItems.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0);
    await addPurchaseOrder({
      supplier: formData.supplier,
      items: formData.selectedItems,
      totalValue: total
    });
    setFormData({ supplier: '', selectedItems: [] });
    setShowModal(false);
  };

  const handleDownloadPDF = async (order: PurchaseOrder) => {
    const html2pdf = (window as any).html2pdf;
    if (!html2pdf) {
      alert("Erro: Biblioteca de PDF não carregada. Por favor, recarregue a página.");
      return;
    }

    setIsGenerating(true);
    try {
      const element = document.createElement('div');
      
      element.innerHTML = `
        <div style="padding: 60px; font-family: 'Inter', system-ui, sans-serif; color: #1e293b; background: white; width: 800px; position: relative; overflow: hidden; min-height: 1000px;">
          <!-- Detalhe de Topo -->
          <div style="position: absolute; top: 0; left: 0; width: 100%; height: 8px; background: linear-gradient(90deg, #10b981, #eab308);"></div>
          
          <!-- Cabeçalho -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 70px;">
            <div style="display: flex; align-items: center; gap: 15px;">
              <div style="background: #10b981; color: white; width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 24px; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.2);">E</div>
              <div>
                <h2 style="margin: 0; font-weight: 900; font-size: 28px; letter-spacing: -1.5px; color: #0f172a; text-transform: uppercase;">Eletrical <span style="color: #10b981;">System</span></h2>
                <p style="margin: 0; font-size: 13px; color: #64748b; font-weight: 500;">Logística e Suprimentos Industriais</p>
              </div>
            </div>
            <div style="text-align: right;">
              <h1 style="margin: 0; font-size: 36px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: -0.05em; line-height: 0.9;">PURCHASE</h1>
              <div style="display: inline-block; background: #f0fdf4; color: #166534; padding: 6px 16px; border-radius: 99px; margin-top: 12px; font-weight: 800; font-size: 14px; border: 1px solid #dcfce7; letter-spacing: 1px;">
                ID: ${order.id}
              </div>
            </div>
          </div>

          <!-- Informações de Faturamento/Entrega -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 60px;">
            <div style="background: #f8fafc; padding: 30px; border-radius: 24px; border: 1px solid #f1f5f9; position: relative; overflow: hidden;">
              <div style="position: absolute; top: 0; left: 0; bottom: 0; width: 4px; background: #10b981;"></div>
              <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #94a3b8; font-weight: 800; margin-bottom: 15px;">Fornecedor Credenciado</p>
              <h3 style="margin: 0; font-size: 20px; font-weight: 900; color: #0f172a;">${order.supplier}</h3>
            </div>
            <div style="padding: 10px 30px;">
              <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #94a3b8; font-weight: 800; margin-bottom: 15px;">Detalhes do Documento</p>
              <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 5px;">
                  <span style="font-size: 13px; color: #64748b; font-weight: 600;">Data de Emissão:</span>
                  <span style="font-size: 13px; color: #1e293b; font-weight: 800;">${new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 5px;">
                  <span style="font-size: 13px; color: #64748b; font-weight: 600;">Prazo Sugerido:</span>
                  <span style="font-size: 13px; color: #1e293b; font-weight: 800;">07 Dias Úteis</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Tabela de Itens -->
          <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 60px;">
            <thead>
              <tr style="text-align: left;">
                <th style="padding: 20px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; font-weight: 800; border-bottom: 2px solid #0f172a;">Item / Descrição</th>
                <th style="padding: 20px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; font-weight: 800; text-align: center; border-bottom: 2px solid #0f172a;">Qtd</th>
                <th style="padding: 20px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; font-weight: 800; text-align: right; border-bottom: 2px solid #0f172a;">Preço Unit.</th>
                <th style="padding: 20px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; font-weight: 800; text-align: right; border-bottom: 2px solid #0f172a;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map((item, idx) => `
                <tr>
                  <td style="padding: 25px 0; border-bottom: 1px solid #f1f5f9;">
                    <p style="margin: 0; font-weight: 800; font-size: 15px; color: #0f172a;">${item.name}</p>
                    <p style="margin: 4px 0 0 0; font-size: 11px; color: #94a3b8; font-family: monospace; font-weight: 600;">SKU: ${item.itemId}</p>
                  </td>
                  <td style="padding: 25px 0; border-bottom: 1px solid #f1f5f9; text-align: center; font-size: 14px; font-weight: 800; color: #1e293b;">${item.quantity} un</td>
                  <td style="padding: 25px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-size: 14px; color: #64748b; font-weight: 600;">R$ ${item.unitPrice.toFixed(2)}</td>
                  <td style="padding: 25px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 900; color: #0f172a; font-size: 16px;">R$ ${(item.quantity * item.unitPrice).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Totais -->
          <div style="display: flex; justify-content: flex-end; margin-bottom: 80px;">
            <div style="background: #0f172a; color: white; padding: 40px; border-radius: 32px; min-width: 350px; text-align: right; box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.2);">
              <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.25em; color: #94a3b8; font-weight: 800; margin-bottom: 15px;">Total Líquido da Ordem</p>
              <p style="margin: 0; font-size: 44px; font-weight: 900; letter-spacing: -2px;">R$ ${order.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <div style="margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px;">
                <p style="margin: 0; font-size: 10px; color: #10b981; font-weight: 800; text-transform: uppercase;">✅ Validado pela Suite Eletrical System</p>
              </div>
            </div>
          </div>

          <!-- Rodapé -->
          <div style="margin-top: auto; padding-top: 40px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
              <p style="margin: 0; font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; margin-bottom: 10px;">Autenticação Digital</p>
              <div style="font-family: monospace; font-size: 10px; color: #cbd5e1; background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #f1f5f9;">
                TOKEN: ${Math.random().toString(16).substring(2, 22).toUpperCase()}
              </div>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; font-size: 11px; color: #cbd5e1; font-weight: 600;">Eletrical System Management Suite v3.2</p>
            </div>
          </div>
        </div>
      `;

      const opt = {
        margin: 0,
        filename: `PO_EletricalSystem_${order.id}.pdf`,
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

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.RECEIVED:
        return <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500 text-white">Recebido</span>;
      case OrderStatus.CANCELLED:
        return <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-500 text-white">Cancelado</span>;
      default:
        return <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500 text-white">Pendente</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Ordens de Compra</h1>
          <p className="text-slate-500 dark:text-slate-400">Gerencie seus pedidos com fornecedores.</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ supplier: '', selectedItems: [] });
            setShowModal(true);
          }}
          className="px-6 py-3 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-2 font-semibold"
        >
          <ICONS.Plus />
          Criar Ordem
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {purchaseOrders.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
             <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
               <ICONS.PurchaseOrder />
             </div>
             <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nenhuma ordem encontrada</h3>
          </div>
        ) : (
          purchaseOrders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-emerald-500/50 transition-all">
               <div className="flex items-center gap-6 w-full md:w-auto">
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                   order.status === OrderStatus.RECEIVED ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 
                   order.status === OrderStatus.CANCELLED ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 
                   'bg-amber-100 text-amber-600 dark:bg-amber-900/30'
                 }`}>
                   <ICONS.PurchaseOrder />
                 </div>
                 <div>
                   <div className="flex items-center gap-3">
                     <h3 className="text-lg font-bold text-slate-900 dark:text-white">{order.id}</h3>
                     {getStatusBadge(order.status)}
                   </div>
                   <p className="text-sm text-slate-500">Fornecedor: <span className="font-semibold text-slate-700 dark:text-slate-300">{order.supplier}</span></p>
                   <p className="text-xs text-slate-400 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                 </div>
               </div>

               <div className="flex flex-col items-center md:items-end w-full md:w-auto">
                  <p className="text-2xl font-black text-slate-900 dark:text-white">R$ {order.totalValue.toLocaleString('pt-BR')}</p>
               </div>

               <div className="flex gap-2 w-full md:w-auto flex-wrap justify-center">
                  <button 
                    onClick={() => handleDownloadPDF(order)}
                    disabled={isGenerating}
                    className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 font-bold text-sm min-w-[160px] disabled:opacity-50"
                  >
                    {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <ICONS.Printer />}
                    Baixar PDF
                  </button>
                  
                  {order.status === OrderStatus.PENDING && (
                    <>
                      <button 
                        onClick={() => cancelOrder(order.id)}
                        className="px-4 py-2.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 transition-colors flex items-center justify-center gap-2 font-bold text-sm"
                      >
                        <ICONS.Trash />
                      </button>
                      <button 
                        onClick={() => receiveOrder(order.id)}
                        className="px-6 py-2.5 bg-amber-600 text-white rounded-xl shadow-lg shadow-amber-500/20 hover:bg-amber-700 transition-all flex items-center justify-center gap-2 font-bold text-sm"
                      >
                        <ICONS.Check /> Receber
                      </button>
                    </>
                  )}
               </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold">Nova Ordem de Compra</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleCreateOrder} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Fornecedor</label>
                <input 
                  type="text" 
                  required 
                  value={formData.supplier}
                  onChange={e => setFormData({...formData, supplier: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Nome da empresa / fornecedor"
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl space-y-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Itens Selecionados</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <select 
                    value={currentItem.itemId}
                    onChange={e => setCurrentItem({...currentItem, itemId: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none"
                  >
                    {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Qtd" value={currentItem.quantity} onChange={e => setCurrentItem({...currentItem, quantity: parseInt(e.target.value) || 1})} className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
                    <input type="number" step="0.01" placeholder="R$" value={currentItem.unitPrice} onChange={e => setCurrentItem({...currentItem, unitPrice: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
                  </div>
                  <button type="button" onClick={handleAddItem} className="bg-emerald-600 text-white rounded-lg px-4 py-2 text-sm font-bold hover:bg-emerald-700 transition-all">Adicionar</button>
                </div>

                <div className="mt-4 space-y-2">
                  {formData.selectedItems.map((item, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center text-sm">
                      <span className="font-semibold">{item.name}</span>
                      <div className="flex items-center gap-3">
                         <span className="text-slate-500">{item.quantity}x R$ {item.unitPrice.toFixed(2)}</span>
                         <button type="button" onClick={() => setFormData({...formData, selectedItems: formData.selectedItems.filter((_, i) => i !== idx)})} className="text-red-500 hover:text-red-700">&times;</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <div className="text-left">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Total do Pedido</p>
                  <p className="text-2xl font-black text-emerald-600">R$ {formData.selectedItems.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0).toLocaleString('pt-BR')}</p>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-slate-100 dark:bg-slate-800 font-bold rounded-xl">Cancelar</button>
                  <button type="submit" className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-700">Criar Ordem</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;
