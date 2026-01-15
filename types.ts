
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED'
}

export enum MovementType {
  ENTRY = 'ENTRY',
  EXIT = 'EXIT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Campo opcional para trânsito, mas essencial no estado
  role: UserRole;
  avatar?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  itemCount: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  quantity: number;
  minQuantity: number;
  price: number;
  lastUpdated: string;
}

export interface ProductMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: MovementType;
  quantity: number;
  reason: string;
  createdAt: string;
  userName: string;
}

export interface PurchaseOrderItem {
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface PurchaseOrder {
  id: string;
  supplier: string;
  items: PurchaseOrderItem[];
  totalValue: number;
  status: OrderStatus;
  createdAt: string;
  receivedAt?: string;
}

export interface AppState {
  user: User | null;
  items: InventoryItem[];
  categories: Category[];
  users: User[];
  purchaseOrders: PurchaseOrder[];
  movements: ProductMovement[];
  acknowledgedAlertIds: string[];
  highlightedItemId: string | null;
  pendingPurchaseItemId: string | null;
  isDarkMode: boolean;
}
