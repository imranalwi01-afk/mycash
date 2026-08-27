export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  iconName?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  minStock?: number; // default 10
  categoryId: string;
  categoryName?: string;
  colorBg?: string;
  colorAccent?: string;
  imageUrl?: string;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export type PaymentMethod = 'Tunai' | 'QRIS' | 'Debit' | 'Transfer';

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  date: string; // ISO string
  cashierName: string;
  items: SaleItem[];
  subtotal: number;
  taxRate: number; // e.g. 0.11 (11%)
  taxAmount: number;
  discount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  changeAmount?: number;
  note?: string;
  status: 'COMPLETED' | 'REFUNDED';
}

export interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  minStock: number;
  timestamp: string;
  isRead: boolean;
}

export type ActiveTab = 'pos' | 'inventory' | 'history' | 'reports';
