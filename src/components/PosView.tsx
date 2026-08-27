import React, { useState } from 'react';
import { Plus, Minus, Trash2, ArrowRight, ShoppingBag, Coffee, Sparkles, Tag, AlertCircle } from 'lucide-react';
import { usePos } from '../context/PosContext';
import { Product, PaymentMethod } from '../types';
import { formatRupiah } from '../utils/formatters';

interface PosViewProps {
  onOpenPaymentModal: (method: PaymentMethod, discount: number) => void;
}

export const PosView: React.FC<PosViewProps> = ({ onOpenPaymentModal }) => {
  const {
    products,
    categories,
    cart,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    activeCategory,
    setActiveCategory,
    searchQuery,
    sales,
    addProduct,
  } = usePos();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('QRIS');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [showDiscountInput, setShowDiscountInput] = useState<boolean>(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);

  // Manual item state
  const [manualName, setManualName] = useState('');
  const [manualPrice, setManualPrice] = useState('');
  const [manualCategory, setManualCategory] = useState(categories[0]?.id || 'cat-1');
  const [manualStock, setManualStock] = useState('20');

  // Filter products by category and search query
  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === 'all' || product.categoryId === activeCategory;
    const matchesSearch =
      searchQuery === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate order totals
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const taxRate = 0.11; // 11%
  const taxAmount = Math.round(subtotal * taxRate);
  const totalBill = Math.max(0, subtotal + taxAmount - discountAmount);

  // Sequence number for current order badge
  const nextOrderNumber = String(sales.length + 412).padStart(4, '0');

  const handleManualAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualPrice) return;

    const price = parseInt(manualPrice.replace(/\D/g, ''), 10) || 0;
    const stock = parseInt(manualStock, 10) || 10;
    const sku = `CUSTOM-${Math.floor(100 + Math.random() * 900)}`;

    const newProd = {
      sku,
      name: manualName.trim(),
      price,
      stock,
      minStock: 10,
      categoryId: manualCategory,
      colorBg: 'bg-indigo-50',
      colorAccent: 'bg-indigo-100 text-indigo-700',
      description: 'Produk custom ditambahkan kasir',
    };

    addProduct(newProd);
    // Find newly added and add to cart
    setTimeout(() => {
      const added = products.find(p => p.sku === sku);
      if (added) addToCart(added);
    }, 100);

    setManualName('');
    setManualPrice('');
    setIsManualModalOpen(false);
  };

  return (
    <div className="flex-1 flex p-6 gap-6 overflow-hidden bg-slate-50 min-h-0">
      {/* Left: Product Catalog & Category Filter */}
      <section className="flex-[1.5] flex flex-col gap-5 overflow-hidden min-w-0">
        {/* Category Filter Pills */}
        <div className="flex gap-2.5 overflow-x-auto pb-1 shrink-0 scrollbar-none items-center">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-2 ring-indigo-600/30'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Semua Produk
          </button>
          {categories.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-2 ring-indigo-600/30'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto pr-1.5 min-h-0">
          {filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200 p-8 text-center">
              <ShoppingBag className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="font-bold text-slate-700 text-base">Tidak ada produk ditemukan</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-sm">
                Coba cari dengan kata kunci lain atau pilih kategori yang berbeda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-6">
              {filteredProducts.map(product => {
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock > 0 && product.stock < (product.minStock || 10);
                const inCart = cart.find(ci => ci.product.id === product.id);

                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      if (!isOutOfStock) {
                        addToCart(product);
                      }
                    }}
                    className={`bg-white p-4 rounded-2xl border transition-all select-none flex flex-col justify-between relative group ${
                      isOutOfStock
                        ? 'opacity-60 cursor-not-allowed border-slate-200 bg-slate-50'
                        : 'cursor-pointer hover:border-indigo-300 hover:shadow-md border-slate-100 shadow-xs active:scale-[0.98]'
                    }`}
                  >
                    {/* Active cart quantity badge */}
                    {inCart && (
                      <span className="absolute top-2.5 right-2.5 bg-indigo-600 text-white font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center shadow-md z-10">
                        {inCart.quantity}
                      </span>
                    )}

                    {/* Product visual container */}
                    <div
                      className={`aspect-4/3 rounded-xl ${
                        product.colorBg || 'bg-indigo-50'
                      } mb-3 flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform`}
                    >
                      <div className="w-12 h-12 bg-white/90 rounded-full border-4 border-white flex items-center justify-center shadow-xs">
                        <Coffee className="w-6 h-6 text-indigo-600" />
                      </div>
                      {/* Out of stock overlay */}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
                          <span className="text-white text-xs font-bold uppercase tracking-wider bg-rose-600 px-2 py-0.5 rounded">
                            Habis
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-[11px] text-slate-400 font-mono font-medium mb-1">
                        SKU: {product.sku}
                      </p>
                      <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1 text-sm">
                        {product.name}
                      </h3>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100">
                      <span className="text-indigo-600 font-bold text-sm">
                        {formatRupiah(product.price)}
                      </span>
                      {isOutOfStock ? (
                        <span className="text-[10px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded font-bold">
                          Habis
                        </span>
                      ) : isLowStock ? (
                        <span className="text-[10px] bg-rose-100 px-2 py-0.5 rounded text-rose-600 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></span>
                          Sisa: {product.stock}
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-medium">
                          Sisa: {product.stock}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Tambah Manual Card */}
              <div
                onClick={() => setIsManualModalOpen(true)}
                className="bg-white p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/20 transition-all flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 cursor-pointer min-h-[170px] group select-none"
              >
                <div className="w-11 h-11 rounded-full border-2 border-dashed border-slate-300 group-hover:border-indigo-500 group-hover:bg-white flex items-center justify-center mb-2 text-lg font-bold group-hover:scale-110 transition-all">
                  <Plus className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold tracking-wide text-slate-600 group-hover:text-indigo-600">
                  Tambah Manual
                </p>
                <span className="text-[10px] text-slate-400 mt-0.5">Input item langsung</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Right: Order Cart & Bill Processing (matching design aesthetic) */}
      <section className="flex-1 max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 flex flex-col overflow-hidden min-h-0">
        {/* Cart Header */}
        <div className="p-5 border-b border-slate-100 shrink-0 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="font-bold text-slate-800 text-base">Pesanan Saat Ini</h2>
            <p className="text-xs text-slate-400">
              {cart.reduce((s, i) => s + i.quantity, 0)} item dalam keranjang
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">
              #{nextOrderNumber}
            </span>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                title="Kosongkan keranjang"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 p-5 space-y-3.5 overflow-y-auto min-h-0">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-400 mb-3">
                <ShoppingBag className="w-8 h-8 opacity-60" />
              </div>
              <p className="text-slate-700 font-semibold text-sm">Keranjang masih kosong</p>
              <p className="text-slate-400 text-xs mt-1 max-w-[200px]">
                Pilih produk dari katalog di sebelah kiri untuk memulai pesanan.
              </p>
            </div>
          ) : (
            cart.map(item => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group"
              >
                <div
                  className={`w-11 h-11 ${
                    item.product.colorBg || 'bg-indigo-50'
                  } rounded-lg shrink-0 flex items-center justify-center text-xs font-bold text-slate-700`}
                >
                  <Coffee className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">
                    {formatRupiah(item.product.price)} x {item.quantity}
                  </p>
                </div>
                {/* Quantity Controls */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                    className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-white rounded hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-slate-800 w-5 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                    className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-white rounded hover:text-indigo-600 transition-colors disabled:opacity-30 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                {/* Item subtotal */}
                <div className="text-sm font-bold text-slate-800 text-right min-w-[70px]">
                  {formatRupiah(item.subtotal)}
                </div>
              </div>
            ))
          )}

          {/* Pricing Breakdown */}
          {cart.length > 0 && (
            <div className="mt-4 pt-4 border-t border-dashed border-slate-200 space-y-2">
              <div className="flex justify-between text-slate-500 text-sm">
                <span>Subtotal</span>
                <span className="font-medium text-slate-700">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-sm">
                <span>Pajak PPN (11%)</span>
                <span className="font-medium text-slate-700">{formatRupiah(taxAmount)}</span>
              </div>

              {/* Discount Row */}
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 text-sm font-medium">
                  <span>Diskon Promo</span>
                  <span>- {formatRupiah(discountAmount)}</span>
                </div>
              )}

              {/* Toggle Discount Input */}
              <div className="py-1">
                {showDiscountInput ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      placeholder="Nominal diskon (Rp)"
                      value={discountAmount || ''}
                      onChange={e => setDiscountAmount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={() => setShowDiscountInput(false)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-2"
                    >
                      Tutup
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDiscountInput(true)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Tag className="w-3 h-3" />
                    + Tambah Diskon / Promo
                  </button>
                )}
              </div>

              {/* Grand Total */}
              <div className="flex justify-between items-end pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-800 font-bold block text-sm">Total Tagihan</span>
                  <span className="text-[11px] text-slate-400">Termasuk pajak & diskon</span>
                </div>
                <span className="text-2xl font-black text-indigo-600 tracking-tight">
                  {formatRupiah(totalBill)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Payment Methods & Action Button */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 space-y-3.5 shrink-0">
          {/* Payment Method Selector Pills */}
          <div className="grid grid-cols-3 gap-2">
            {(['Tunai', 'QRIS', 'Debit'] as PaymentMethod[]).map(method => {
              const isSelected = selectedPaymentMethod === method;
              return (
                <button
                  key={method}
                  onClick={() => setSelectedPaymentMethod(method)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-indigo-400'
                  }`}
                >
                  {method === 'QRIS' && <Sparkles className="w-3.5 h-3.5" />}
                  {method}
                </button>
              );
            })}
          </div>

          {/* Checkout CTA */}
          <button
            onClick={() => {
              if (cart.length > 0) {
                onOpenPaymentModal(selectedPaymentMethod, discountAmount);
              }
            }}
            disabled={cart.length === 0}
            className={`w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              cart.length > 0
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-[0.99]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Proses Pembayaran ({selectedPaymentMethod})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Manual Item Quick Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Tambah Produk Manual</h3>
            <p className="text-xs text-slate-500 mb-4">
              Masukkan detail produk cepat untuk langsung dimasukkan ke kasir.
            </p>

            <form onSubmit={handleManualAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Produk
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Roti Bakar Coklat"
                  value={manualName}
                  onChange={e => setManualName(e.target.value)}
                  className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Harga (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="25000"
                    value={manualPrice}
                    onChange={e => setManualPrice(e.target.value)}
                    className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Stok Awal
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={manualStock}
                    onChange={e => setManualStock(e.target.value)}
                    className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                <select
                  value={manualCategory}
                  onChange={e => setManualCategory(e.target.value)}
                  className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 text-sm cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 text-sm cursor-pointer"
                >
                  Simpan & Tambah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
