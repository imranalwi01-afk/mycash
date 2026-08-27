import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, QrCode, CreditCard, Banknote, AlertCircle, ArrowRight } from 'lucide-react';
import { usePos } from '../context/PosContext';
import { PaymentMethod } from '../types';
import { formatRupiah } from '../utils/formatters';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMethod: PaymentMethod;
  discount: number;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  initialMethod,
  discount,
}) => {
  const { cart, processCheckout } = usePos();
  const [method, setMethod] = useState<PaymentMethod>(initialMethod);
  const [cashAmount, setCashAmount] = useState<string>('');
  const [cardRef, setCardRef] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const taxAmount = Math.round(subtotal * 0.11);
  const totalAmount = Math.max(0, subtotal + taxAmount - discount);

  useEffect(() => {
    setMethod(initialMethod);
    setCashAmount(totalAmount.toString());
    setErrorMessage('');
  }, [initialMethod, totalAmount, isOpen]);

  if (!isOpen) return null;

  const parsedCash = parseInt(cashAmount.replace(/\D/g, ''), 10) || 0;
  const changeAmount = method === 'Tunai' ? Math.max(0, parsedCash - totalAmount) : 0;
  const isCashSufficient = method !== 'Tunai' || parsedCash >= totalAmount;

  // Quick preset buttons for Cash
  const quickCashPresets = [
    { label: 'Uang Pas', value: totalAmount },
    { label: 'Rp 50.000', value: 50000 },
    { label: 'Rp 100.000', value: 100000 },
    { label: 'Rp 200.000', value: 200000 },
    { label: 'Rp 500.000', value: 500000 },
  ].filter(p => p.value >= totalAmount || p.label === 'Uang Pas');

  const handleCompletePayment = () => {
    if (method === 'Tunai' && parsedCash < totalAmount) {
      setErrorMessage('Nominal uang tunai kurang dari total tagihan.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    // Simulate snappy processing
    setTimeout(() => {
      const result = processCheckout(
        method,
        method === 'Tunai' ? parsedCash : totalAmount,
        discount,
        cardRef ? `Ref: ${cardRef}` : undefined
      );

      setIsProcessing(false);
      if (result.success) {
        onClose();
      } else {
        setErrorMessage(result.error || 'Gagal memproses transaksi.');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Pembayaran Kasir</h3>
            <p className="text-xs text-slate-400 mt-0.5">Pilih metode dan selesaikan transaksi</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Total Summary Card */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex justify-between items-center">
            <div>
              <span className="text-xs text-indigo-700 font-bold uppercase tracking-wider">
                Total Pembayaran
              </span>
              <p className="text-xs text-slate-500">
                {cart.reduce((s, i) => s + i.quantity, 0)} item • Pajak PPN 11%
              </p>
            </div>
            <div className="text-2xl font-black text-indigo-700">{formatRupiah(totalAmount)}</div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setMethod('QRIS')}
                className={`py-3 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer border ${
                  method === 'QRIS'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span>QRIS Instant</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('Tunai')}
                className={`py-3 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer border ${
                  method === 'Tunai'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span>Uang Tunai</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('Debit')}
                className={`py-3 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer border ${
                  method === 'Debit'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>Kartu Debit/EDC</span>
              </button>
            </div>
          </div>

          {/* Error notice if any */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Specific Method UI */}
          {method === 'Tunai' && (
            <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jumlah Uang Diterima (Rp)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={cashAmount}
                    onChange={e => setCashAmount(e.target.value)}
                    className="w-full text-lg font-bold px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800"
                    placeholder="Contoh: 100000"
                    autoFocus
                  />
                </div>
              </div>

              {/* Quick Cash Presets */}
              <div className="flex flex-wrap gap-2">
                {quickCashPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCashAmount(preset.value.toString())}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 rounded-lg text-xs font-bold text-slate-600 transition-all cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Kembalian Calculation */}
              <div className="pt-2 border-t border-slate-200/80 flex justify-between items-center">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Kembalian</span>
                  <span className="text-[11px] text-slate-400">
                    {parsedCash < totalAmount ? 'Kurang nominal' : 'Uang kembalian konsumen'}
                  </span>
                </div>
                <div
                  className={`text-xl font-black ${
                    parsedCash < totalAmount ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {parsedCash < totalAmount
                    ? `- ${formatRupiah(totalAmount - parsedCash)}`
                    : formatRupiah(changeAmount)}
                </div>
              </div>
            </div>
          )}

          {method === 'QRIS' && (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col items-center text-center space-y-3">
              <div className="w-44 h-44 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                {/* Simulated QR Pattern */}
                <div className="w-full h-full border-4 border-indigo-900 rounded-xl p-2 flex flex-col justify-between items-center bg-slate-950">
                  <div className="w-full flex justify-between">
                    <div className="w-8 h-8 bg-white rounded-xs p-1">
                      <div className="w-full h-full bg-slate-950"></div>
                    </div>
                    <div className="w-8 h-8 bg-white rounded-xs p-1">
                      <div className="w-full h-full bg-slate-950"></div>
                    </div>
                  </div>
                  <div className="text-white text-[9px] font-mono tracking-widest uppercase">
                    QRIS • {formatRupiah(totalAmount)}
                  </div>
                  <div className="w-full flex justify-between">
                    <div className="w-8 h-8 bg-white rounded-xs p-1">
                      <div className="w-full h-full bg-slate-950"></div>
                    </div>
                    <div className="w-4 h-4 bg-indigo-500 rounded-full animate-ping"></div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">Tampilkan QR kepada Pelanggan</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Mendukung GoPay, OVO, Dana, ShopeePay, BCA, Mandiri, & Bank Lainnya
                </p>
              </div>
            </div>
          )}

          {method === 'Debit' && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor Kartu / Approval Code (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: BCA - 948271"
                  value={cardRef}
                  onChange={e => setCardRef(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Gesek atau tap kartu di mesin EDC kasir, lalu klik konfirmasi di bawah setelah struk EDC keluar.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer CTA */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 text-sm cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleCompletePayment}
            disabled={!isCashSufficient || isProcessing}
            className={`flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all cursor-pointer ${
              isCashSufficient && !isProcessing
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-[0.99]'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
            }`}
          >
            {isProcessing ? (
              <span>Memproses Transaksi...</span>
            ) : (
              <>
                <span>Konfirmasi Pembayaran</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
