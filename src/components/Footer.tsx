import React from 'react';
import { usePos } from '../context/PosContext';

export const Footer: React.FC = () => {
  const { products, sales } = usePos();

  return (
    <footer className="h-10 bg-slate-800 text-slate-400 text-[10px] px-8 flex items-center justify-between uppercase tracking-widest shrink-0 select-none z-10">
      <div className="flex items-center gap-6">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
          Database Online ({products.length} SKU)
        </span>
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
          Sync Success ({sales.length} Penjualan)
        </span>
      </div>
      <div>KASIR-APP V2.1.0 • SYSTEM ACTIVE</div>
    </footer>
  );
};
