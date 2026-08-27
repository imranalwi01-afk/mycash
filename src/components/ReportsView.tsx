import React, { useState } from 'react';
import { TrendingUp, DollarSign, ShoppingCart, Award, ArrowUpRight, BarChart2, PieChart, Calendar, ChevronRight } from 'lucide-react';
import { usePos } from '../context/PosContext';
import { formatRupiah, formatSimpleDate } from '../utils/formatters';

export const ReportsView: React.FC = () => {
  const { sales, products, categories } = usePos();
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | 'all'>('7days');
  const [hoveredDataPoint, setHoveredDataPoint] = useState<{ label: string; value: number } | null>(null);

  // Filter sales based on timeRange
  const now = Date.now();
  const filteredSales = sales.filter(s => {
    const saleTime = new Date(s.date).getTime();
    if (timeRange === '7days') {
      return saleTime >= now - 7 * 24 * 3600 * 1000;
    } else if (timeRange === '30days') {
      return saleTime >= now - 30 * 24 * 3600 * 1000;
    }
    return true;
  });

  // KPI Calculations
  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalTransactions = filteredSales.length;
  const averageOrderValue = totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;
  const totalItemsSold = filteredSales.reduce(
    (sum, s) => sum + s.items.reduce((acc, i) => acc + i.quantity, 0),
    0
  );

  // Automation: Payment Method Breakdown
  const paymentBreakdown = {
    QRIS: { count: 0, total: 0 },
    Tunai: { count: 0, total: 0 },
    Debit: { count: 0, total: 0 },
    Transfer: { count: 0, total: 0 },
  };

  filteredSales.forEach(s => {
    if (paymentBreakdown[s.paymentMethod]) {
      paymentBreakdown[s.paymentMethod].count += 1;
      paymentBreakdown[s.paymentMethod].total += s.totalAmount;
    }
  });

  // Best Selling Products Aggregation
  const productSalesMap: { [prodId: string]: { name: string; sku: string; qty: number; revenue: number; category: string } } = {};

  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productSalesMap[item.productId]) {
        const originalProd = products.find(p => p.id === item.productId);
        productSalesMap[item.productId] = {
          name: item.productName,
          sku: item.sku,
          qty: 0,
          revenue: 0,
          category: originalProd?.categoryName || 'Katalog',
        };
      }
      productSalesMap[item.productId].qty += item.quantity;
      productSalesMap[item.productId].revenue += item.subtotal;
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Category Breakdown Aggregation
  const categorySalesMap: { [catId: string]: { name: string; revenue: number; qty: number } } = {};
  categories.forEach(c => {
    categorySalesMap[c.id] = { name: c.name, revenue: 0, qty: 0 };
  });

  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (prod && categorySalesMap[prod.categoryId]) {
        categorySalesMap[prod.categoryId].revenue += item.subtotal;
        categorySalesMap[prod.categoryId].qty += item.quantity;
      }
    });
  });

  const categoryBreakdownList = Object.values(categorySalesMap).filter(c => c.revenue > 0);

  // Daily Chart Trend Generation (Last 7 days or buckets)
  const chartDays = 7;
  const trendData: { label: string; revenue: number; count: number }[] = [];

  for (let i = chartDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayLabel = new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric' }).format(d);

    const daySales = sales.filter(s => s.date.slice(0, 10) === dateStr);
    const dayRevenue = daySales.reduce((sum, s) => sum + s.totalAmount, 0);

    trendData.push({
      label: dayLabel,
      revenue: dayRevenue,
      count: daySales.length,
    });
  }

  // Chart SVG calculations
  const maxRevenue = Math.max(...trendData.map(d => d.revenue), 100000);
  const chartHeight = 160;
  const chartWidth = 540;

  const points = trendData.map((d, index) => {
    const x = (index / (trendData.length - 1)) * (chartWidth - 40) + 20;
    const y = chartHeight - (d.revenue / maxRevenue) * (chartHeight - 40) - 20;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
  const areaD = points.length > 0 ? `${pathD} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z` : '';

  return (
    <div className="flex-1 flex flex-col p-6 gap-5 overflow-y-auto bg-slate-50 min-h-0">
      {/* Top Filter and Heading */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Ringkasan Kinerja Penjualan</h2>
          <p className="text-xs text-slate-400">Analisis keuangan dan performa transaksi kasir</p>
        </div>

        {/* Time Period Filter */}
        <div className="flex bg-white border border-slate-200/80 p-1 rounded-2xl shadow-xs gap-1 text-xs font-bold">
          <button
            onClick={() => setTimeRange('7days')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              timeRange === '7days'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            7 Hari Terakhir
          </button>
          <button
            onClick={() => setTimeRange('30days')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              timeRange === '30days'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bulan Ini (30 Hari)
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              timeRange === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua Waktu
          </button>
        </div>
      </div>

      {/* 4 Top Financial KPIs */}
      <div className="grid grid-cols-4 gap-4 shrink-0">
        <div className="bg-white p-5 rounded-3xl border border-indigo-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-110"></div>
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block mb-1">
            Total Pendapatan
          </span>
          <h3 className="text-2xl font-black text-slate-900">{formatRupiah(totalRevenue)}</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Terverifikasi Lunas
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-slate-100 rounded-full -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-110"></div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Jumlah Transaksi
          </span>
          <h3 className="text-2xl font-black text-slate-900">{totalTransactions}</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-2">
            Rata-rata {Math.round(totalTransactions / 7)} transaksi / hari
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-110"></div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
            Rata-rata Nilai (AOV)
          </span>
          <h3 className="text-2xl font-black text-slate-900">{formatRupiah(averageOrderValue)}</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-2">Per struk penjualan</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-110"></div>
          <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block mb-1">
            Produk Terjual
          </span>
          <h3 className="text-2xl font-black text-slate-900">{totalItemsSold}</h3>
          <p className="text-[11px] text-purple-600 font-medium mt-2">Unit barang keluar</p>
        </div>
      </div>

      {/* Middle Row: Trend Chart & Payment Methods */}
      <div className="grid grid-cols-3 gap-5">
        {/* Trend Chart (2 columns) */}
        <div className="col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Tren Penjualan Harian</h3>
              <p className="text-xs text-slate-400">Pendapatan 7 hari terakhir (Rp)</p>
            </div>
            {hoveredDataPoint && (
              <div className="bg-indigo-600 text-white px-3 py-1 rounded-xl text-xs font-bold shadow-md shadow-indigo-200 animate-in fade-in">
                {hoveredDataPoint.label}: {formatRupiah(hoveredDataPoint.value)}
              </div>
            )}
          </div>

          {/* SVG Line & Area Chart */}
          <div className="w-full relative">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-48 overflow-visible"
            >
              <defs>
                <linearGradient id="indigoGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="40" x2={chartWidth} y2="40" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="90" x2={chartWidth} y2="90" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="140" x2={chartWidth} y2="140" stroke="#f1f5f9" strokeDasharray="4 4" />

              {/* Filled Area */}
              {areaD && <path d={areaD} fill="url(#indigoGradient)" />}

              {/* Smooth Path Line */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Points */}
              {points.map((p, idx) => (
                <g
                  key={idx}
                  className="cursor-pointer group"
                  onMouseEnter={() => setHoveredDataPoint({ label: p.label, value: p.revenue })}
                  onMouseLeave={() => setHoveredDataPoint(null)}
                >
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="5"
                    className="fill-white stroke-indigo-600 stroke-3 group-hover:r-7 transition-all"
                  />
                  <text
                    x={p.x}
                    y={chartHeight + 15}
                    textAnchor="middle"
                    className="text-[10px] font-sans fill-slate-400 font-semibold"
                  >
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Payment Methods Automation Breakdown (1 column) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Metode Pembayaran</h3>
            <p className="text-xs text-slate-400 mb-4">Pengelompokan transaksi otomatis</p>

            <div className="space-y-3.5">
              {/* QRIS */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-indigo-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></span>
                    QRIS Instant
                  </span>
                  <span className="text-slate-800">{formatRupiah(paymentBreakdown.QRIS.total)}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        totalRevenue > 0
                          ? (paymentBreakdown.QRIS.total / totalRevenue) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-[10px] text-slate-400 block text-right">
                  {paymentBreakdown.QRIS.count} transaksi
                </span>
              </div>

              {/* Tunai */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-emerald-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                    Uang Tunai
                  </span>
                  <span className="text-slate-800">{formatRupiah(paymentBreakdown.Tunai.total)}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        totalRevenue > 0
                          ? (paymentBreakdown.Tunai.total / totalRevenue) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-[10px] text-slate-400 block text-right">
                  {paymentBreakdown.Tunai.count} transaksi
                </span>
              </div>

              {/* Debit */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-blue-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                    Kartu Debit/EDC
                  </span>
                  <span className="text-slate-800">{formatRupiah(paymentBreakdown.Debit.total)}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        totalRevenue > 0
                          ? (paymentBreakdown.Debit.total / totalRevenue) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-[10px] text-slate-400 block text-right">
                  {paymentBreakdown.Debit.count} transaksi
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Automasi pengelompokan aktif secara real-time
          </div>
        </div>
      </div>

      {/* Bottom Row: Top 5 Best Selling Products & Category Revenue */}
      <div className="grid grid-cols-2 gap-5 pb-6">
        {/* Top 5 Products */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">5 Produk Terlaris</h3>
              <p className="text-xs text-slate-400">Berdasarkan kuantitas yang terjual</p>
            </div>
            <Award className="w-5 h-5 text-amber-500" />
          </div>

          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Belum ada data penjualan.</p>
            ) : (
              topProducts.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        idx === 0
                          ? 'bg-amber-400 text-amber-950 shadow-xs'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-800'
                          : idx === 2
                          ? 'bg-amber-700/30 text-amber-900'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">{p.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {p.category} • SKU: {p.sku}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-indigo-600 text-xs block">
                      {p.qty} terjual
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {formatRupiah(p.revenue)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Category Contribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Pendapatan per Kategori</h3>
              <p className="text-xs text-slate-400">Kontribusi penjualan tiap kelompok barang</p>
            </div>
            <PieChart className="w-5 h-5 text-indigo-600" />
          </div>

          <div className="space-y-3.5">
            {categoryBreakdownList.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Belum ada data kategori.</p>
            ) : (
              categoryBreakdownList.map((cat, idx) => {
                const percent = totalRevenue > 0 ? Math.round((cat.revenue / totalRevenue) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-800">{cat.name}</span>
                      <span className="text-slate-600 font-medium">
                        {formatRupiah(cat.revenue)}{' '}
                        <strong className="text-indigo-600 font-bold ml-1">({percent}%)</strong>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
