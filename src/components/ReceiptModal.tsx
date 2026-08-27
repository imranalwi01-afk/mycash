import React from 'react';
import { X, Printer, Check, ShoppingBag, Store, Download } from 'lucide-react';
import { usePos } from '../context/PosContext';
import { formatRupiah, formatDate } from '../utils/formatters';

export const ReceiptModal: React.FC = () => {
  const { selectedSaleForReceipt, setSelectedSaleForReceipt } = usePos();

  if (!selectedSaleForReceipt) return null;

  const sale = selectedSaleForReceipt;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Receipt Header Actions */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Struk Transaksi Penjualan
          </span>
          <button
            onClick={() => setSelectedSaleForReceipt(null)}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Thermal Receipt Paper Container */}
        <div className="p-6 overflow-y-auto font-mono text-xs text-slate-800 bg-white" id="printable-receipt">
          {/* Store Logo & Title */}
          <div className="text-center pb-4 border-b border-dashed border-slate-300">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center mx-auto mb-2 font-sans font-black">
              <Store className="w-5 h-5" />
            </div>
            <h2 className="font-bold font-sans text-base text-slate-900">KASIR POINT OF SALE</h2>
            <p className="text-[11px] text-slate-500">Jl. Malioboro No. 42, Yogyakarta</p>
            <p className="text-[11px] text-slate-500">Telp: 0812-3456-7890</p>
          </div>

          {/* Transaction Metadata */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px] text-slate-600">
            <div className="flex justify-between">
              <span>No. Faktur:</span>
              <span className="font-bold text-slate-900">{sale.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Tanggal:</span>
              <span>{formatDate(sale.date)}</span>
            </div>
            <div className="flex justify-between">
              <span>Kasir:</span>
              <span>{sale.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span>Metode Bayar:</span>
              <span className="font-bold text-indigo-600">{sale.paymentMethod}</span>
            </div>
          </div>

          {/* Itemized List */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-2">
            {sale.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between font-medium text-slate-900">
                  <span className="truncate max-w-[170px]">{item.productName}</span>
                  <span>{formatRupiah(item.subtotal)}</span>
                </div>
                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>
                    {item.quantity} x {formatRupiah(item.unitPrice)}
                  </span>
                  <span>SKU: {item.sku}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Breakdown */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatRupiah(sale.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Pajak (11% PPN):</span>
              <span>{formatRupiah(sale.taxAmount)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Diskon:</span>
                <span>- {formatRupiah(sale.discount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 font-bold text-sm text-slate-900 border-t border-slate-200">
              <span>TOTAL:</span>
              <span className="text-base text-indigo-600">{formatRupiah(sale.totalAmount)}</span>
            </div>

            {sale.paymentMethod === 'Tunai' && sale.cashReceived !== undefined && (
              <>
                <div className="flex justify-between pt-1 text-[11px]">
                  <span>Tunai Diterima:</span>
                  <span>{formatRupiah(sale.cashReceived)}</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-emerald-600">
                  <span>Kembalian:</span>
                  <span>{formatRupiah(sale.changeAmount || 0)}</span>
                </div>
              </>
            )}
          </div>

          {/* Footer Note */}
          <div className="text-center pt-4 text-[10px] text-slate-400 space-y-1 font-sans">
            <p className="font-semibold text-slate-700">Terima Kasih Atas Kunjungan Anda!</p>
            <p>Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan kecuali ada perjanjian.</p>
            <p className="text-[9px] text-slate-300 pt-2 font-mono">--- STRUK ASLI DIGITAL ---</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-200 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Struk</span>
          </button>
          <button
            onClick={() => setSelectedSaleForReceipt(null)}
            className="px-4 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-100 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
