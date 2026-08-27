import React, { useState } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle, Package, Check, Search, Filter, RefreshCw, Layers } from 'lucide-react';
import { usePos } from '../context/PosContext';
import { Product, Category } from '../types';
import { formatRupiah } from '../utils/formatters';

export const InventoryView: React.FC = () => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    restockProduct,
    addCategory,
    searchQuery,
  } = usePos();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out' | 'safe'>('all');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [quickRestockItem, setQuickRestockItem] = useState<{ id: string; name: string; current: number } | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(10);

  // Form states for Product
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    price: 0,
    stock: 20,
    minStock: 10,
    categoryId: categories[0]?.id || 'cat-1',
    description: '',
    colorBg: 'bg-indigo-50',
    colorAccent: 'bg-indigo-100 text-indigo-700',
  });

  // Category form
  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStock = true;
    if (stockFilter === 'low') {
      matchesStock = product.stock > 0 && product.stock < (product.minStock || 10);
    } else if (stockFilter === 'out') {
      matchesStock = product.stock <= 0;
    } else if (stockFilter === 'safe') {
      matchesStock = product.stock >= (product.minStock || 10);
    }

    return matchesCategory && matchesSearch && matchesStock;
  });

  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock < (p.minStock || 10));
  const outOfStockProducts = products.filter(p => p.stock <= 0);

  const handleOpenAddModal = () => {
    setFormData({
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      price: 20000,
      stock: 25,
      minStock: 10,
      categoryId: categories[0]?.id || 'cat-1',
      description: '',
      colorBg: 'bg-indigo-50',
      colorAccent: 'bg-indigo-100 text-indigo-700',
    });
    setEditingProduct(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setFormData({
      sku: product.sku,
      name: product.name,
      price: product.price,
      stock: product.stock,
      minStock: product.minStock || 10,
      categoryId: product.categoryId,
      description: product.description || '',
      colorBg: product.colorBg || 'bg-indigo-50',
      colorAccent: product.colorAccent || 'bg-indigo-100 text-indigo-700',
    });
    setEditingProduct(product);
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim()) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        sku: formData.sku.trim(),
        name: formData.name.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        minStock: Number(formData.minStock),
        categoryId: formData.categoryId,
        description: formData.description,
        colorBg: formData.colorBg,
        colorAccent: formData.colorAccent,
      });
    } else {
      addProduct({
        sku: formData.sku.trim(),
        name: formData.name.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        minStock: Number(formData.minStock),
        categoryId: formData.categoryId,
        description: formData.description,
        colorBg: formData.colorBg,
        colorAccent: formData.colorAccent,
      });
    }
    setIsAddModalOpen(false);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    addCategory({
      name: categoryName.trim(),
      description: categoryDesc.trim() || 'Kategori produk',
      color: 'indigo',
    });

    setCategoryName('');
    setCategoryDesc('');
    setIsCategoryModalOpen(false);
  };

  const handleQuickRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickRestockItem && restockAmount > 0) {
      restockProduct(quickRestockItem.id, restockAmount);
      setQuickRestockItem(null);
      setRestockAmount(10);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 gap-5 overflow-hidden bg-slate-50 min-h-0">
      {/* Top Banner / Summary Cards */}
      <div className="grid grid-cols-4 gap-4 shrink-0">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Total Produk Terdaftar</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{products.length}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Total Kategori</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{categories.length}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-700">Stok Menipis (&lt;10)</span>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{lowStockProducts.length}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/30 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-700">Stok Habis (0)</span>
            <h3 className="text-2xl font-black text-rose-600 mt-1">{outOfStockProducts.length}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Action Bar: Filters & Add Buttons */}
      <div className="flex items-center justify-between gap-4 shrink-0 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3 overflow-x-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-600"
          >
            <option value="all">Semua Kategori</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Stock Level Filter */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs font-semibold">
            <button
              onClick={() => setStockFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                stockFilter === 'all'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Semua ({products.length})
            </button>
            <button
              onClick={() => setStockFilter('low')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                stockFilter === 'low'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              Menipis ({lowStockProducts.length})
            </button>
            <button
              onClick={() => setStockFilter('out')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                stockFilter === 'out'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              Habis ({outOfStockProducts.length})
            </button>
            <button
              onClick={() => setStockFilter('safe')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                stockFilter === 'safe'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              Aman
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-4 py-2 border border-slate-200 hover:border-indigo-500 text-slate-700 hover:text-indigo-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-white"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>+ Kategori Baru</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-200 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto min-h-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="py-3.5 px-6">Produk & SKU</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Harga Jual</th>
                <th className="py-3.5 px-4">Stok Saat Ini</th>
                <th className="py-3.5 px-4">Status Stok</th>
                <th className="py-3.5 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold">Tidak ada produk yang cocok dengan kriteria filter.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  const isOut = product.stock <= 0;
                  const isLow = product.stock > 0 && product.stock < (product.minStock || 10);

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg ${
                              product.colorBg || 'bg-indigo-50'
                            } flex items-center justify-center font-bold text-indigo-700 text-xs shrink-0`}
                          >
                            <Package className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 text-sm block">
                              {product.name}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              SKU: {product.sku}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-medium text-[11px]">
                          {product.categoryName || 'Umum'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 text-sm">
                        {formatRupiah(product.price)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-sm">
                        <span
                          className={
                            isOut
                              ? 'text-rose-600'
                              : isLow
                              ? 'text-amber-600'
                              : 'text-slate-800'
                          }
                        >
                          {product.stock} unit
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                            Habis (0)
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                            Menipis (&lt;{product.minStock || 10})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            Aman
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Restock Button */}
                          <button
                            onClick={() =>
                              setQuickRestockItem({
                                id: product.id,
                                name: product.name,
                                current: product.stock,
                              })
                            }
                            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-[11px] transition-colors cursor-pointer"
                            title="Restock stok barang"
                          >
                            + Restock
                          </button>
                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit produk"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {/* Delete Button */}
                          <button
                            onClick={() => {
                              if (confirm(`Yakin ingin menghapus produk "${product.name}"?`)) {
                                deleteProduct(product.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus produk"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-1">
              {editingProduct ? 'Edit Informasi Produk' : 'Tambah Produk Baru'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Isi data detail barang untuk disimpan ke database katalog.
            </p>

            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kode SKU</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={formData.categoryId}
                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-600 bg-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Produk</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Iced Caramel Latte"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Harga Jual (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah Stok</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Batas Minimum (&lt;)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.minStock}
                    onChange={e =>
                      setFormData({ ...formData, minStock: parseInt(e.target.value) || 10 })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi Singkat
                </label>
                <textarea
                  rows={2}
                  placeholder="Keterangan bahan baku atau penyajian..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 shadow-md shadow-indigo-200 cursor-pointer"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Restock Modal */}
      {quickRestockItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Restock Barang</h3>
            <p className="text-xs text-slate-500 mb-3">
              Tambahkan kuantitas stok untuk <strong>{quickRestockItem.name}</strong>.
            </p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4 flex justify-between items-center text-xs">
              <span className="text-slate-500">Stok Saat Ini:</span>
              <span className="font-bold text-slate-800">{quickRestockItem.current} unit</span>
            </div>

            <form onSubmit={handleQuickRestockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Jumlah Tambahan Stok
                </label>
                <div className="flex gap-2 mb-2">
                  {[5, 10, 20, 50].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setRestockAmount(amt)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        restockAmount === amt
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  required
                  value={restockAmount}
                  onChange={e => setRestockAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-center text-lg font-bold px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setQuickRestockItem(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 shadow-md shadow-indigo-200 cursor-pointer"
                >
                  Konfirmasi (+{restockAmount})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Tambah Kategori Baru</h3>
            <p className="text-xs text-slate-400 mb-4">
              Buat kategori untuk mengelompokkan produk di POS & laporan.
            </p>

            <form onSubmit={handleAddCategorySubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kategori</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Paket Hemat"
                  value={categoryName}
                  onChange={e => setCategoryName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-600"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi</label>
                <input
                  type="text"
                  placeholder="Keterangan singkat..."
                  value={categoryDesc}
                  onChange={e => setCategoryDesc(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 shadow-md shadow-indigo-200 cursor-pointer"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
