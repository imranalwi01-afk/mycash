import React from 'react';
import { ShoppingCart, Package, Receipt, BarChart3, Store } from 'lucide-react';
import { usePos } from '../context/PosContext';
import { ActiveTab } from '../types';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, lowStockCount, cart, cashierName } = usePos();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'pos',
      label: 'Point of Sale',
      icon: <ShoppingCart className="w-5 h-5" />,
      badge: cart.length > 0 ? cart.reduce((sum, item) => sum + item.quantity, 0) : undefined,
    },
    {
      id: 'inventory',
      label: 'Inventaris & Stok',
      icon: <Package className="w-5 h-5" />,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
    },
    {
      id: 'history',
      label: 'Riwayat Transaksi',
      icon: <Receipt className="w-5 h-5" />,
    },
    {
      id: 'reports',
      label: 'Laporan Keuangan',
      icon: <BarChart3 className="w-5 h-5" />,
    },
  ];

  // Initials for avatar
  const initials = cashierName
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'JD';

  return (
    <nav className="w-20 bg-indigo-700 flex flex-col items-center py-6 shrink-0 select-none z-20">
      {/* Brand Icon */}
      <div 
        onClick={() => setActiveTab('pos')}
        className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-2xl flex items-center justify-center mb-8 cursor-pointer transition-all shadow-md shadow-indigo-900/20 group"
        title="POS Kasir Pintar"
      >
        <Store className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col gap-6 w-full items-center">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-white text-indigo-700 shadow-lg shadow-indigo-900/30 scale-105'
                  : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
              }`}
              title={item.label}
            >
              {item.icon}
              {/* Badge indicator */}
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full flex items-center justify-center ${
                    item.id === 'inventory'
                      ? 'bg-amber-400 text-amber-950 ring-2 ring-indigo-700'
                      : 'bg-rose-500 text-white ring-2 ring-indigo-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Profile Avatar at bottom */}
      <div className="mt-auto flex flex-col items-center gap-2">
        <div
          className="w-10 h-10 bg-white/15 hover:bg-white/25 rounded-full flex items-center justify-center text-white border border-white/20 cursor-pointer transition-all shadow-inner"
          title={`Kasir Aktif: ${cashierName}`}
        >
          <span className="text-xs font-bold tracking-wider">{initials}</span>
        </div>
      </div>
    </nav>
  );
};
