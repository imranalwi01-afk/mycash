import React, { useState } from 'react';
import { X, AlertTriangle, Package, Check, ArrowRight, Bell, Plus } from 'lucide-react';
import { usePos } from '../context/PosContext';
import { formatRupiah, formatDate } from '../utils/formatters';

export const AlertsDrawer: React.FC = () => {
  const {
    alerts,
    products,
    isAlertDrawerOpen,
    setIsAlertDrawerOpen,
    dismissAlert,
    restockProduct,
    clearAllAlerts,
  } = usePos();

  const [restockAmounts, setRestockAmounts] = useState<{ [productId: string]: number }>({});

  if (!isAlertDrawerOpen) return null;

  // Active products that are low in stock
  const lowStockProducts = products.filter(p => p.stock < (p.minStock || 10));

  const handleRestock = (productId: string) => {
    const qty = restockAmounts[productId] || 15;
    restockProduct(productId, qty);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex justify-end animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-amber-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Notifikasi Stok Menipis</h3>
              <p className="text-xs text-amber-800 font-medium">
                {lowStockProducts.length} produk di bawah batas aman (&lt;10 unit)
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAlertDrawerOpen(false)}
            className="w-9 h-9 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs text-indigo-900 flex items-start gap-2.5">
            <Bell className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <span>
              <strong>Automasi Sistem:</strong> Notifikasi ini muncul secara otomatis saat kuantitas produk berkurang melewati ambang batas 10 unit setelah transaksi kasir.
            </span>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-slate-700 text-sm">Semua Stok Barang Aman</h4>
              <p className="text-xs text-slate-400 mt-1">Tidak ada produk yang memerlukan restock mendesak.</p>
            </div>
          ) : (
            lowStockProducts.map(product => {
              const currentStock = product.stock;
              const minThreshold = product.minStock || 10;
              const inputAmount = restockAmounts[product.id] || 15;

              return (
                <div
                  key={product.id}
                  className="bg-white p-4 rounded-2xl border border-amber-200/90 shadow-xs space-y-3 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400">SKU: {product.sku}</span>
                      <h4 className="font-bold text-slate-800 text-sm">{product.name}</h4>
                      <span className="text-xs text-slate-500">{formatRupiah(product.price)}</span>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          currentStock === 0
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        Sisa: {currentStock} / {minThreshold}
                      </span>
                    </div>
                  </div>

                  {/* Restock Bar Controls */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">Tambah:</span>
                    <input
                      type="number"
                      min="1"
                      value={inputAmount}
                      onChange={e =>
                        setRestockAmounts({
                          ...restockAmounts,
                          [product.id]: Math.max(1, parseInt(e.target.value) || 1),
                        })
                      }
                      className="w-16 text-center text-xs font-bold py-1.5 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 bg-slate-50"
                    />
                    <button
                      onClick={() => handleRestock(product.id)}
                      className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Restock (+{inputAmount})</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button
            onClick={() => {
              // Bulk restock all low stock products by +20
              lowStockProducts.forEach(p => restockProduct(p.id, 20));
            }}
            disabled={lowStockProducts.length === 0}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Restock Semua (+20 Unit)
          </button>
          <button
            onClick={() => setIsAlertDrawerOpen(false)}
            className="px-5 py-3 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
