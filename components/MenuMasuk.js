// File: MenuMasuk.js

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/outline';

export default function MenuMasuk() {
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stocksRes = await fetch('/api/stock');
        const stocksData = await stocksRes.json();
        setStocks(stocksData);

        const transRes = await fetch('/api/menu-masuk');
        const transData = await transRes.json();
        setTransactions(transData);
      } catch (err) {
        setError('Gagal memuat data barang masuk');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setShowForm(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDeleteTransaction = async (id) => {
    setConfirmDelete(null);
    try {
      const res = await fetch(`/api/menu-masuk?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus data');
      setTransactions(transactions.filter(t => t._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      const url = '/api/menu-masuk';
      const method = editingTransaction ? 'PUT' : 'POST';
      const body = editingTransaction
        ? JSON.stringify({ id: editingTransaction._id, ...formData })
        : JSON.stringify(formData);

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (!res.ok) throw new Error('Gagal menyimpan data');
      const result = await res.json();
      const updated = result.data || result;

      setTransactions(prev =>
        editingTransaction
          ? prev.map(t => (t._id === updated._id ? updated : t))
          : [updated, ...prev]
      );

      setShowForm(false);
      setEditingTransaction(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Barang Masuk</h2>
          <p className="text-sm text-gray-600">Daftar transaksi barang masuk ke gudang</p>
        </div>
        <button
          onClick={handleAddTransaction}
          className="flex items-center justify-center text-sm bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition shadow-sm"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Tambah Barang Masuk
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Riwayat Barang Masuk</h3>
        </div>
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Tanggal', 'Kode Barang', 'Nama Barang', 'Qty Masuk', 'Aksi'].map((h, i) => (
                    <th key={i} className={`px-4 py-3 ${i < 3 ? 'text-left' : 'text-right'} font-medium text-gray-500 uppercase tracking-wider`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Tidak ada data</td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">{new Date(t.tanggal).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-blue-600 font-medium">{t.kode_barang}</td>
                      <td className="px-4 py-3 text-gray-700">{t.nama_menu}</td>
                      <td className="px-4 py-3 text-right">{t.qty_masuk}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEditTransaction(t)} className="text-indigo-600 hover:text-indigo-900">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button onClick={() => setConfirmDelete(t._id)} className="text-red-600 hover:text-red-900">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-500/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              {editingTransaction ? 'Edit Barang Masuk' : 'Tambah Barang Masuk'}
            </h3>
            <MenuMasukForm
              stocks={stocks}
              initialData={editingTransaction}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingTransaction(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Hapus Data?</h3>
            <p className="text-sm text-gray-600 mb-4">Apakah Anda yakin ingin menghapus transaksi ini?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100">
                Batal
              </button>
              <button onClick={() => handleDeleteTransaction(confirmDelete)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Form Component
function MenuMasukForm({ stocks, initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    tanggal: initialData?.tanggal ? new Date(initialData.tanggal).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    kode_barang: initialData?.kode_barang || '',
    nama_menu: initialData?.nama_menu || '',
    qty_masuk: initialData?.qty_masuk || 1,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'kode_barang') {
        const selected = stocks.find(s => s.kode_barang === value);
        if (selected) updated.nama_menu = selected.nama_menu;
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (!formData.kode_barang || !formData.nama_menu || formData.qty_masuk <= 0) {
        throw new Error('Data tidak valid');
      }
      await onSubmit(formData);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-100 border-l-4 border-red-600 p-3 text-red-700 text-sm">{error}</div>}
      <div>
        <label className="block text-sm font-medium">Tanggal</label>
        <input
          type="date"
          name="tanggal"
          value={formData.tanggal}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Kode Barang</label>
        <select
          name="kode_barang"
          value={formData.kode_barang}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-md"
          required
        >
          <option value="">Pilih Kode Barang</option>
          {stocks.map((stock) => (
            <option key={stock._id} value={stock.kode_barang}>
              {stock.kode_barang} - {stock.nama_menu}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Nama Menu</label>
        <input
          type="text"
          name="nama_menu"
          value={formData.nama_menu}
          readOnly
          className="w-full border px-3 py-2 rounded-md bg-gray-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Qty Masuk</label>
        <input
          type="number"
          name="qty_masuk"
          value={formData.qty_masuk}
          onChange={handleChange}
          min="1"
          required
          className="w-full border px-3 py-2 rounded-md"
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={submitting}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md text-sm ${submitting ? 'opacity-60' : 'hover:bg-blue-700'}`}
        >
          {submitting ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}
