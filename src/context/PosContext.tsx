import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category, Sale, CartItem, PaymentMethod, StockAlert, ActiveTab } from '../types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_SALES } from '../data/initialData';
import { generateInvoiceNumber } from '../utils/formatters';

interface PosContextType {
  products: Product[];
  categories: Category[];
  sales: Sale[];
  cart: CartItem[];
  alerts: StockAlert[];
  activeTab: ActiveTab;
  activeCategory: string;
  searchQuery: string;
  cashierName: string;
  lowStockCount: number;
  isAlertDrawerOpen: boolean;
  selectedSaleForReceipt: Sale | null;
  
  // Actions
  setActiveTab: (tab: ActiveTab) => void;
  setActiveCategory: (catId: string) => void;
  setSearchQuery: (q: string) => void;
  setCashierName: (name: string) => void;
  setIsAlertDrawerOpen: (open: boolean) => void;
  setSelectedSaleForReceipt: (sale: Sale | null) => void;
  
  // Cart Actions
  addToCart: (product: Product, quantity?: number) => boolean;
  updateCartQty: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  
  // Checkout Action (Automation for stock update, payment categorization, alert generation)
  processCheckout: (paymentMethod: PaymentMethod, cashReceived?: number, discount?: number, note?: string) => { success: boolean; sale?: Sale; error?: string };
  
  // Inventory Actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  restockProduct: (id: string, additionalStock: number) => void;
  
  // Category Actions
  addCategory: (category: Omit<Category, 'id'>) => void;
  
  // Alert Actions
  dismissAlert: (alertId: string) => void;
  clearAllAlerts: () => void;
  
  // Reset Data
  resetToSampleData: () => void;
}

const PosContext = createContext<PosContextType | undefined>(undefined);

export const PosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or fallback to initial data
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('pos_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('pos_categories');
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    try {
      const saved = localStorage.getItem('pos_sales');
      return saved ? JSON.parse(saved) : INITIAL_SALES;
    } catch {
      return INITIAL_SALES;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('pos_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [alerts, setAlerts] = useState<StockAlert[]>(() => {
    try {
      const saved = localStorage.getItem('pos_alerts');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Auto-generate initial alerts for products below minStock (10)
    return INITIAL_PRODUCTS.filter(p => p.stock < (p.minStock || 10)).map(p => ({
      id: `alert-${p.id}-${Date.now()}`,
      productId: p.id,
      productName: p.name,
      sku: p.sku,
      currentStock: p.stock,
      minStock: p.minStock || 10,
      timestamp: new Date().toISOString(),
      isRead: false,
    }));
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('pos');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cashierName, setCashierName] = useState<string>('John Doe');
  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = useState<boolean>(false);
  const [selectedSaleForReceipt, setSelectedSaleForReceipt] = useState<Sale | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pos_products', JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('pos_categories', JSON.stringify(categories));
    } catch (e) {
      console.error(e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem('pos_sales', JSON.stringify(sales));
    } catch (e) {
      console.error(e);
    }
  }, [sales]);

  useEffect(() => {
    try {
      localStorage.setItem('pos_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('pos_alerts', JSON.stringify(alerts));
    } catch (e) {
      console.error(e);
    }
  }, [alerts]);

  // Count items with stock below minStock (default 10)
  const lowStockCount = products.filter(p => p.stock < (p.minStock || 10)).length;

  // Cart Functions
  const addToCart = (product: Product, quantity: number = 1): boolean => {
    if (product.stock <= 0) {
      return false;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stock) {
          return prev; // cannot exceed stock
        }
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: newQty, subtotal: newQty * product.price }
            : item
        );
      } else {
        const qtyToAdd = Math.min(quantity, product.stock);
        return [...prev, { product, quantity: qtyToAdd, subtotal: qtyToAdd * product.price }];
      }
    });
    return true;
  };

  const updateCartQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const validatedQty = Math.min(quantity, product.stock);
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity: validatedQty, subtotal: validatedQty * item.product.price }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // CHECKOUT AUTOMATION:
  // 1. Stock quantity decreases automatically
  // 2. Low stock alert generated if stock drops < 10
  // 3. Automated transaction categorization by payment method
  const processCheckout = (
    paymentMethod: PaymentMethod,
    cashReceived: number = 0,
    discount: number = 0,
    note: string = ''
  ): { success: boolean; sale?: Sale; error?: string } => {
    if (cart.length === 0) {
      return { success: false, error: 'Keranjang belanja kosong' };
    }

    // Verify stock availability
    for (const item of cart) {
      const prod = products.find(p => p.id === item.product.id);
      if (!prod || prod.stock < item.quantity) {
        return {
          success: false,
          error: `Stok produk "${item.product.name}" tidak mencukupi (Tersedia: ${prod ? prod.stock : 0})`,
        };
      }
    }

    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const taxRate = 0.11; // 11% PPN
    const taxAmount = Math.round(subtotal * taxRate);
    const totalAmount = Math.max(0, subtotal + taxAmount - discount);

    if (paymentMethod === 'Tunai' && cashReceived < totalAmount) {
      return {
        success: false,
        error: 'Nominal tunai yang diterima kurang dari total tagihan',
      };
    }

    const changeAmount = paymentMethod === 'Tunai' ? Math.max(0, cashReceived - totalAmount) : 0;
    const saleId = `sale-${Date.now()}`;
    const invoiceNumber = generateInvoiceNumber(sales.length);

    const saleItems = cart.map(item => ({
      id: `item-${Date.now()}-${item.product.id}`,
      saleId,
      productId: item.product.id,
      productName: item.product.name,
      sku: item.product.sku,
      quantity: item.quantity,
      unitPrice: item.product.price,
      subtotal: item.subtotal,
    }));

    const newSale: Sale = {
      id: saleId,
      invoiceNumber,
      date: new Date().toISOString(),
      cashierName,
      items: saleItems,
      subtotal,
      taxRate,
      taxAmount,
      discount,
      totalAmount,
      paymentMethod,
      cashReceived: paymentMethod === 'Tunai' ? cashReceived : undefined,
      changeAmount: paymentMethod === 'Tunai' ? changeAmount : undefined,
      note,
      status: 'COMPLETED',
    };

    // 1. AUTOMATION: Reduce product stock
    const updatedProducts = products.map(product => {
      const cartItem = cart.find(ci => ci.product.id === product.id);
      if (cartItem) {
        const newStock = Math.max(0, product.stock - cartItem.quantity);
        return { ...product, stock: newStock };
      }
      return product;
    });

    // 2. AUTOMATION: Check for low stock alerts (< 10 units)
    const newAlerts: StockAlert[] = [];
    updatedProducts.forEach(product => {
      const minThreshold = product.minStock || 10;
      if (product.stock < minThreshold) {
        // check if alert already exists recently
        const cartItem = cart.find(ci => ci.product.id === product.id);
        if (cartItem) {
          newAlerts.push({
            id: `alert-${product.id}-${Date.now()}`,
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            currentStock: product.stock,
            minStock: minThreshold,
            timestamp: new Date().toISOString(),
            isRead: false,
          });
        }
      }
    });

    setProducts(updatedProducts);
    setSales(prev => [newSale, ...prev]);
    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev]);
    }
    clearCart();
    setSelectedSaleForReceipt(newSale);

    return { success: true, sale: newSale };
  };

  // Inventory Management
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const category = categories.find(c => c.id === productData.categoryId);
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      categoryName: category ? category.name : 'Umum',
      minStock: productData.minStock || 10,
    };
    setProducts(prev => [newProduct, ...prev]);

    // Check if initial stock is already low
    if (newProduct.stock < newProduct.minStock) {
      setAlerts(prev => [
        {
          id: `alert-${newProduct.id}-${Date.now()}`,
          productId: newProduct.id,
          productName: newProduct.name,
          sku: newProduct.sku,
          currentStock: newProduct.stock,
          minStock: newProduct.minStock,
          timestamp: new Date().toISOString(),
          isRead: false,
        },
        ...prev,
      ]);
    }
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === id) {
          const updated = { ...p, ...productData };
          if (productData.categoryId) {
            const category = categories.find(c => c.id === productData.categoryId);
            if (category) updated.categoryName = category.name;
          }
          return updated;
        }
        return p;
      })
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setCart(prev => prev.filter(item => item.product.id !== id));
  };

  const restockProduct = (id: string, additionalStock: number) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === id) {
          const newStock = p.stock + additionalStock;
          return { ...p, stock: newStock };
        }
        return p;
      })
    );
    // Dismiss low stock alerts for this product if restocked above threshold
    setAlerts(prev => prev.filter(a => a.productId !== id));
  };

  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...categoryData,
      id: `cat-${Date.now()}`,
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  const resetToSampleData = () => {
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setSales(INITIAL_SALES);
    setCart([]);
    setAlerts(
      INITIAL_PRODUCTS.filter(p => p.stock < (p.minStock || 10)).map(p => ({
        id: `alert-${p.id}-${Date.now()}`,
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        currentStock: p.stock,
        minStock: p.minStock || 10,
        timestamp: new Date().toISOString(),
        isRead: false,
      }))
    );
    localStorage.removeItem('pos_products');
    localStorage.removeItem('pos_categories');
    localStorage.removeItem('pos_sales');
    localStorage.removeItem('pos_cart');
    localStorage.removeItem('pos_alerts');
  };

  return (
    <PosContext.Provider
      value={{
        products,
        categories,
        sales,
        cart,
        alerts,
        activeTab,
        activeCategory,
        searchQuery,
        cashierName,
        lowStockCount,
        isAlertDrawerOpen,
        selectedSaleForReceipt,
        setActiveTab,
        setActiveCategory,
        setSearchQuery,
        setCashierName,
        setIsAlertDrawerOpen,
        setSelectedSaleForReceipt,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        processCheckout,
        addProduct,
        updateProduct,
        deleteProduct,
        restockProduct,
        addCategory,
        dismissAlert,
        clearAllAlerts,
        resetToSampleData,
      }}
    >
      {children}
    </PosContext.Provider>
  );
};

export const usePos = () => {
  const context = useContext(PosContext);
  if (!context) {
    throw new Error('usePos must be used within a PosProvider');
  }
  return context;
};
