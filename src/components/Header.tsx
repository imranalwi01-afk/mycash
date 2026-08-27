import React, { useState } from 'react';
import { Search, AlertTriangle, UserCheck, RefreshCw } from 'lucide-react';
import { usePos } from '../context/PosContext';

export const Header: React.FC = () => {
  const {
    activeTab,
    cashierName,
    setCashierName,
    searchQuery,
    setSearchQuery,
    lowStockCount,
    setIsAlertDrawerOpen,
    resetToSampleData,
  } = usePos();

  const [isEditingCashier, setIsEditingCashier] = useState(false);
  const [tempCashier, setTempCashier] = useState(cashierName);

  const getPageDetails = () => {
    switch (activeTab) {
      case 'pos':
        return {
          title: 'Point of Sale',
          searchPlaceholder: 'Cari nama produk atau SKU (CRF-001)...',
        };
      case 'inventory':
        return {
          title: 'Manajemen Inventaris & Stok',
          searchPlaceholder: 'Cari produk di stok...',
        };
      case 'history':
        return {
          title: 'Riwayat Transaksi Penjualan',
          searchPlaceholder: 'Cari no. invoice, kasir, atau item...',
        };
      case 'reports':
        return {
          title: 'Dashboard Laporan Keuangan',
          searchPlaceholder: 'Filter data laporan...',
        };
      default:
        return {
          title: 'Point of Sale',
          searchPlaceholder: 'Cari produk...',
        };
    }
  };

  const { title, searchPlaceholder } = getPageDetails();

  // Current formatted date
  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  const handleSaveCashier = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempCashier.trim()) {
      setCashierName(tempCashier.trim());
      setIsEditingCashier(false);
    }
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 z-10">
      {/* Title and Subtitle */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h1>
        <div className="flex items-center gap-2 mt-0.5">
          {isEditingCashier ? (
            <form onSubmit={handleSaveCashier} className="flex items-center gap-1.5">
              <input
                type="text"
                value={tempCashier}
                onChange={e => setTempCashier(e.target.value)}
                className="text-xs px-2 py-0.5 border border-indigo-400 rounded-md outline-none text-slate-700 w-28"
                autoFocus
              />
              <button
                type="submit"
                className="text-[11px] bg-indigo-600 text-white px-2 py-0.5 rounded font-medium"
              >
                Simpan
              </button>
            </form>
          ) : (
            <button
              onClick={() => {
                setTempCashier(cashierName);
                setIsEditingCashier(true);
              }}
              className="text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-1 group transition-colors"
              title="Klik untuk ubah nama kasir"
            >
              <span>Kasir: <strong className="text-slate-700 group-hover:text-indigo-600 font-semibold">{cashierName}</strong></span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-400">{todayFormatted}</span>
              <UserCheck className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-indigo-500 transition-opacity" />
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 focus:border-indigo-400 rounded-xl text-sm w-72 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full w-4 h-4 flex items-center justify-center"
            >
              ×
            </button>
          )}
        </div>

        {/* Low Stock Warning Pill Button */}
        {lowStockCount > 0 ? (
          <button
            onClick={() => setIsAlertDrawerOpen(true)}
            className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-800 px-3.5 py-2 rounded-xl text-xs font-semibold border border-amber-200 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Klik untuk lihat dan restock produk yang menipis"
          >
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            <span>Stok Menipis ({lowStockCount})</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3.5 py-2 rounded-xl text-xs font-semibold border border-emerald-100">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>Semua Stok Aman</span>
          </div>
        )}

        {/* Quick Reset / Sample Data */}
        <button
          onClick={() => {
            if (confirm('Kembalikan data produk dan transaksi ke data awal default?')) {
              resetToSampleData();
            }
          }}
          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors"
          title="Reset ke Data Sampel Default"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
