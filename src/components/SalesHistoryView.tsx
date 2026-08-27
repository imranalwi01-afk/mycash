import React, { useState } from 'react';
import { Receipt, Search, Filter, Calendar, Eye, Download, ArrowUpRight, DollarSign, CheckCircle2 } from 'lucide-react';
import { usePos } from '../context/PosContext';
import { Sale, PaymentMethod } from '../types';
import { formatRupiah, formatDate } from '../utils/formatters';

export const SalesHistoryView: React.FC = () => {
  const { sales, setSelectedSaleForReceipt, searchQuery } = usePos();
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [activeSaleDetail, setActiveSaleDetail] = useState<Sale | null>(null);

  // Filter sales
  const filteredSales = sales.filter(sale => {
    const matchesMethod = selectedMethod === 'all' || sale.paymentMethod === selectedMethod;
    
    // Search query matches invoice, cashier, or item names
    const matchesSearch =
      searchQuery === '' ||
      sale.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.cashierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.items.some(i => i.productName.toLowerCase().includes(searchQuery.toLowerCase()));

    // Date filter
    let matchesDate = true;
    const saleTime = new Date(sale.date).getTime();
    const now = Date.now();
    if (dateFilter === 'today') {
      const todayStart = new Date().setHours(0, 0, 0, 0);
      matchesDate = saleTime >= todayStart;
    } else if (dateFilter === 'week') {
      matchesDate = saleTime >= now - 7 * 24 * 3600 * 1000;
    } else if (dateFilter === 'month') {
      matchesDate = saleTime >= now - 30 * 24 * 3600 * 1000;
    }

    return matchesMethod && matchesSearch && matchesDate;
  });

  // Calculate totals
  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalItemsSold = filteredSales.reduce(
    (sum, s) => sum + s.items.reduce((isum, item) => isum + item.quantity, 0),
    0
  );

  const qrisTotal = filteredSales
    .filter(s => s.paymentMethod === 'QRIS')
    .reduce((sum, s) => sum + s.totalAmount, 0);
  const tunaiTotal = filteredSales
    .filter(s => s.paymentMethod === 'Tunai')
    .reduce((sum, s) => sum + s.totalAmount, 0);
  const debitTotal = filteredSales
    .filter(s => s.paymentMethod === 'Debit')
    .reduce((sum, s) => sum + s.totalAmount, 0);

  const handleExportCSV = () => {
    const headers = 'No Invoice,Tanggal,Kasir,Metode Pembayaran,Subtotal,Pajak,Diskon,Total,Status\n';
    const rows = filteredSales
      .map(
        s =>
          `"${s.invoiceNumber}","${s.date}","${s.cashierName}","${s.paymentMethod}",${s.subtotal},${s.taxAmount},${s.discount},${s.totalAmount},"${s.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Penjualan_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col p-6 gap-5 overflow-hidden bg-slate-50 min-h-0">
      {/* KPI Header Cards */}
      <div className="grid grid-cols-4 gap-4 shrink-0">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">Total Transaksi</span>
          <div className="flex items-baseline justify-between mt-1">
            <h3 className="text-2xl font-black text-slate-800">{filteredSales.length}</h3>
            <span className="text-xs font-medium text-slate-500">{totalItemsSold} item terjual</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-indigo-200 bg-indigo-50/20 shadow-xs">
          <span className="text-xs font-semibold text-indigo-600">Total Pendapatan</span>
          <div className="flex items-baseline justify-between mt-1">
            <h3 className="text-2xl font-black text-indigo-700">{formatRupiah(totalRevenue)}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">QRIS vs Tunai</span>
          <div className="mt-1 flex items-center gap-2 text-xs">
            <span className="font-bold text-indigo-600">{formatRupiah(qrisTotal)}</span>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-emerald-600">{formatRupiah(tunaiTotal)}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Rata-rata / Struk</span>
            <h3 className="text-xl font-black text-slate-800 mt-1">
              {formatRupiah(filteredSales.length ? Math.round(totalRevenue / filteredSales.length) : 0)}
            </h3>
          </div>
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4 shrink-0 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          {/* Payment Method Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500">Metode:</span>
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs font-semibold">
              {['all', 'QRIS', 'Tunai', 'Debit'].map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedMethod(m)}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    selectedMethod === m
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {m === 'all' ? 'Semua' : m}
                </button>
              ))}
            </div>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-xs font-bold text-slate-500">Periode:</span>
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value as any)}
              className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:border-indigo-600"
            >
              <option value="all">Semua Waktu</option>
              <option value="today">Hari Ini</option>
              <option value="week">7 Hari Terakhir</option>
              <option value="month">30 Hari Terakhir</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-slate-400">
          Menampilkan <strong>{filteredSales.length}</strong> transaksi selesai
        </span>
      </div>

      {/* Sales Transactions Table */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto min-h-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="py-3.5 px-6">No. Invoice & Tanggal</th>
                <th className="py-3.5 px-4">Kasir</th>
                <th className="py-3.5 px-4">Item Transaksi</th>
                <th className="py-3.5 px-4">Metode Bayar</th>
                <th className="py-3.5 px-4">Total Tagihan</th>
                <th className="py-3.5 px-6 text-right">Struk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold">Belum ada transaksi penjualan yang tercatat.</p>
                  </td>
                </tr>
              ) : (
                filteredSales.map(sale => (
                  <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm font-mono">
                          {sale.invoiceNumber}
                        </span>
                        <span className="text-[11px] text-slate-400">{formatDate(sale.date)}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-700 font-medium">{sale.cashierName}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="max-w-[200px] truncate text-slate-600">
                        {sale.items.map(i => `${i.productName} (${i.quantity})`).join(', ')}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {sale.items.reduce((s, i) => s + i.quantity, 0)} total pcs
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          sale.paymentMethod === 'QRIS'
                            ? 'bg-indigo-100 text-indigo-700'
                            : sale.paymentMethod === 'Tunai'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                      {formatRupiah(sale.totalAmount)}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => setSelectedSaleForReceipt(sale)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold rounded-xl text-xs transition-all inline-flex items-center gap-1 cursor-pointer"
                        title="Buka dan Cetak Struk"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Struk</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
