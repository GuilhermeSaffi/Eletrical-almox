
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  User, InventoryItem, Category, UserRole, AppState, PurchaseOrder, OrderStatus,
  ProductMovement, MovementType
} from '../types';

interface AppContextType extends AppState {
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  toggleDarkMode: () => void;

  refreshAll: () => Promise<void>;

  addItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => Promise<void>;
  updateItem: (item: InventoryItem) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;

  addCategory: (cat: Omit<Category, 'id' | 'itemCount'>) => Promise<void>;

  addUser: (u: Omit<User, 'id'> & { password: string }) => Promise<void>;
  updateUserPassword: (userId: string, newPass: string) => Promise<void>;

  addPurchaseOrder: (order: Omit<PurchaseOrder, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  receiveOrder: (id: string) => Promise<void>;
  cancelOrder: (id: string) => Promise<void>;

  registerMovement: (movement: Omit<ProductMovement, 'id' | 'createdAt' | 'userName' | 'itemName'>) => Promise<void>;

  acknowledgeAlert: (id: string) => void;
  clearAllAlerts: () => void;
  setHighlightedItemId: (id: string | null) => void;
  setPendingPurchaseItemId: (id: string | null) => void;
}

type ApiError = { error?: string; ok?: boolean; message?: string };

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const body: any = isJson ? await res.json().catch(() => ({})) : await res.text().catch(() => '');

  if (!res.ok) {
    const msg =
      (body && (body.error || body.message)) ||
      (typeof body === 'string' && body) ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }
  // Some endpoints return {ok:false,...} with 200; handle defensively.
  if (body && typeof body === 'object' && body.ok === false) {
    throw new Error(body.error || 'Erro na API');
  }
  return body as T;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem('eletrical_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [movements, setMovements] = useState<ProductMovement[]>([]);

  const [acknowledgedAlertIds, setAcknowledgedAlertIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('eletrical_ack_alerts');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);
  const [pendingPurchaseItemId, setPendingPurchaseItemId] = useState<string | null>(null);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem('eletrical_theme');
      return raw ? raw === 'dark' : true;
    } catch {
      return true;
    }
  });

  // Persist theme + alerts
  useEffect(() => {
    localStorage.setItem('eletrical_theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('eletrical_ack_alerts', JSON.stringify(acknowledgedAlertIds));
  }, [acknowledgedAlertIds]);

  const refreshAll = async () => {
    if (!user) return;
    const [it, cat, us, po, mv] = await Promise.all([
      apiRequest<any[]>('/api/items'),
      apiRequest<any[]>('/api/categories'),
      apiRequest<any[]>('/api/users'),
      apiRequest<any[]>('/api/purchase-orders'),
      apiRequest<any[]>('/api/movements'),
    ]);

    // Normalize shapes to frontend types
    setItems(it.map((r:any) => ({
      id: String(r.id),
      name: String(r.name),
      sku: String(r.sku),
      categoryId: String(r.categoryId),
      quantity: Number(r.quantity),
      minQuantity: Number(r.minQuantity),
      price: typeof r.price === 'string' ? Number(r.price) : Number(r.price),
      lastUpdated: r.lastUpdated ? String(r.lastUpdated) : new Date().toISOString(),
    })));

    setCategories(cat.map((r:any) => ({
      id: String(r.id),
      name: String(r.name),
      description: r.description ? String(r.description) : '',
      itemCount: 0,
    })));

    setUsers(us.map((r:any) => ({
      id: String(r.id),
      name: String(r.name),
      email: String(r.email),
      role: (r.role as UserRole) || UserRole.USER,
    })));

    setPurchaseOrders(po.map((r:any) => ({
      id: String(r.id),
      supplier: String(r.supplier),
      items: Array.isArray(r.items) ? r.items.map((l:any) => ({
        itemId: String(l.itemId),
        name: String(l.name ?? ''),
        quantity: Number(l.quantity),
        unitPrice: Number(l.unitPrice),
      })) : [],
      totalValue: Number(r.totalValue),
      status: (r.status as OrderStatus) || OrderStatus.PENDING,
      createdAt: String(r.createdAt),
      receivedAt: r.receivedAt ? String(r.receivedAt) : undefined,
    })));

    setMovements(mv.map((r:any) => ({
      id: String(r.id),
      itemId: String(r.itemId),
      itemName: String(r.itemName ?? ''),
      type: (r.type as MovementType) || MovementType.ENTRY,
      quantity: Number(r.quantity),
      reason: String(r.reason ?? ''),
      createdAt: String(r.createdAt),
      userName: String(r.userName ?? ''),
    })));

    // compute itemCount per category
    setCategories(prev => prev.map(c => ({ ...c, itemCount: it.filter((i:any)=>String(i.categoryId)===c.id).length })));
  };

  // If user is already saved, load data on mount
  useEffect(() => {
    if (user) {
      refreshAll().catch(() => {
        // If backend is down, keep UI but empty state.
      });
    }
  }, [user?.id]);

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await apiRequest<any>('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: pass }),
      });
      if (res?.ok && res?.user) {
        const u: User = {
          id: String(res.user.id),
          name: String(res.user.name),
          email: String(res.user.email),
          role: (res.user.role as UserRole) || UserRole.USER,
        };
        setUser(u);
        localStorage.setItem('eletrical_user', JSON.stringify(u));
        await refreshAll();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('eletrical_user');
    setItems([]);
    setCategories([]);
    setUsers([]);
    setPurchaseOrders([]);
    setMovements([]);
  };

  const toggleDarkMode = () => setIsDarkMode(v => !v);

  const addCategory = async (cat: Omit<Category, 'id' | 'itemCount'>) => {
    if (!user) return;
    const created = await apiRequest<any>('/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name: cat.name, description: cat.description }),
    });
    setCategories(prev => [...prev, {
      id: String(created.id),
      name: String(created.name),
      description: created.description ? String(created.description) : '',
      itemCount: 0
    }].sort((a,b)=>a.name.localeCompare(b.name)));
  };

  const addItem = async (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    if (!user) return;
    const created = await apiRequest<any>('/api/items', {
      method: 'POST',
      body: JSON.stringify({
        name: item.name,
        sku: item.sku,
        categoryId: item.categoryId,
        quantity: Number(item.quantity),
        minQuantity: Number(item.minQuantity),
        price: Number(item.price),
      }),
    });
    const mapped: InventoryItem = {
      id: String(created.id),
      name: String(created.name),
      sku: String(created.sku),
      categoryId: String(created.categoryId),
      quantity: Number(created.quantity),
      minQuantity: Number(created.minQuantity),
      price: Number(created.price),
      lastUpdated: created.lastUpdated ? String(created.lastUpdated) : new Date().toISOString(),
    };
    setItems(prev => [...prev, mapped].sort((a,b)=>a.name.localeCompare(b.name)));
    // update category counts
    setCategories(prev => prev.map(c => c.id===mapped.categoryId ? {...c, itemCount: (c.itemCount||0)+1} : c));
  };

  const updateItem = async (item: InventoryItem) => {
    if (!user) return;
    const updated = await apiRequest<any>(`/api/items/${encodeURIComponent(item.id)}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: item.name,
        sku: item.sku,
        categoryId: item.categoryId,
        quantity: Number(item.quantity),
        minQuantity: Number(item.minQuantity),
        price: Number(item.price),
      }),
    });
    const mapped: InventoryItem = {
      id: String(updated.id),
      name: String(updated.name),
      sku: String(updated.sku),
      categoryId: String(updated.categoryId),
      quantity: Number(updated.quantity),
      minQuantity: Number(updated.minQuantity),
      price: Number(updated.price),
      lastUpdated: updated.lastUpdated ? String(updated.lastUpdated) : new Date().toISOString(),
    };
    setItems(prev => prev.map(i => i.id===mapped.id ? mapped : i));
  };

  const deleteItem = async (id: string) => {
    if (!user) return;
    try {
      await apiRequest<any>(`/api/items/${encodeURIComponent(id)}`, { method: 'DELETE' });
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error('Erro ao deletar item:', err);
      throw err; // Propaga o erro para o componente tratar
    }
  };

  const addUser = async (u: Omit<User, 'id'> & { password: string }) => {
    if (!user) return;
    const created = await apiRequest<any>('/api/users', {
      method: 'POST',
      body: JSON.stringify({
        name: u.name,
        email: u.email,
        role: u.role,
        password: u.password,
      }),
    });
    setUsers(prev => [...prev, {
      id: String(created.id),
      name: String(created.name),
      email: String(created.email),
      role: (created.role as UserRole) || UserRole.USER,
    }].sort((a,b)=>a.name.localeCompare(b.name)));
  };

  const updateUserPassword = async (userId: string, newPass: string) => {
    if (!user) return;
    await apiRequest<any>(`/api/users/${encodeURIComponent(userId)}/password`, {
      method: 'PUT',
      body: JSON.stringify({ password: newPass }),
    });
  };

  const addPurchaseOrder = async (order: Omit<PurchaseOrder, 'id' | 'createdAt' | 'status'>) => {
    if (!user) return;
    const created = await apiRequest<any>('/api/purchase-orders', {
      method: 'POST',
      body: JSON.stringify({
        supplier: order.supplier,
        lines: order.items.map(l => ({ itemId: l.itemId, quantity: Number(l.quantity) })),
      }),
    });
    // Refresh because receiving/cancelling affects inventory/movements
    await refreshAll();
    // highlight created?
    setPendingPurchaseItemId(null);
  };

  const receiveOrder = async (id: string) => {
    if (!user) return;
    await apiRequest<any>(`/api/purchase-orders/${encodeURIComponent(id)}/receive`, { method: 'POST' });
    await refreshAll();
  };

  const cancelOrder = async (id: string) => {
    if (!user) return;
    await apiRequest<any>(`/api/purchase-orders/${encodeURIComponent(id)}/cancel`, { method: 'POST' });
    await refreshAll();
  };

  const registerMovement = async (mv: Omit<ProductMovement, 'id' | 'createdAt' | 'userName' | 'itemName'>) => {
    if (!user) return;
    await apiRequest<any>('/api/movements', {
      method: 'POST',
      body: JSON.stringify({
        itemId: mv.itemId,
        type: mv.type,
        quantity: Number(mv.quantity),
        reason: mv.reason,
      }),
    });
    await refreshAll();
  };

  const acknowledgeAlert = (id: string) => {
    setAcknowledgedAlertIds(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  const clearAllAlerts = () => setAcknowledgedAlertIds([]);

  const value: AppContextType = {
    user, items, categories, users, purchaseOrders, movements,
    acknowledgedAlertIds, highlightedItemId, pendingPurchaseItemId, isDarkMode,
    login, logout, toggleDarkMode, refreshAll,
    addItem, updateItem, deleteItem,
    addCategory,
    addUser, updateUserPassword,
    addPurchaseOrder, receiveOrder, cancelOrder,
    registerMovement,
    acknowledgeAlert, clearAllAlerts,
    setHighlightedItemId, setPendingPurchaseItemId,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
