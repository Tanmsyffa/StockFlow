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
        // Fetch stocks
        const stocksResponse = await fetch('/api/stock');
        const stocksData = await stocksResponse.json();
        setStocks(stocksData);

        // Fetch transactions
        const transactionsResponse = await fetch('/api/menu-masuk');
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData);
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
      const response = await fetch(`/api/menu-masuk?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menghapus data');
      }
      setTransactions(transactions.filter(t => t._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      const url = editingTransaction 
        ? `/api/menu-masuk` 
        : `/api/menu-masuk`;
      
      const method = editingTransaction ? 'PUT' : 'POST';
      
      const body = editingTransaction 
        ? JSON.stringify({ id: editingTransaction._id, ...formData }) 
        : JSON.stringify(formData);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Gagal ${editingTransaction ? 'update' : 'tambah'} data`);
      }

      const result = await response.json();
      const updatedTransaction = result.data || result;

      if (editingTransaction) {
        setTransactions(transactions.map(t => 
          t._id === updatedTransaction._id ? updatedTransaction : t
        ));
      } else {
        setTransactions([updatedTransaction, ...transactions]);
      }

      setShowForm(false);
      setEditingTransaction(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Barang Masuk</h2>
          <p className="text-gray-600">Daftar transaksi barang masuk ke gudang</p>
        </div>
        <button
          onClick={handleAddTransaction}
          className="flex items-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition shadow-sm"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Tambah Barang Masuk
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Transactions Table */}
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
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kode Barang
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Barang
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qty Masuk
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Tidak ada data barang masuk
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.tanggal).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600">{transaction.kode_barang}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.nama_menu}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {transaction.qty_masuk}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditTransaction(transaction)}
                            className="text-indigo-600 hover:text-indigo-900 p-1"
                            title="Edit"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(transaction._id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Hapus"
                          >
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

      {/* Transaction Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-500/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {editingTransaction ? 'Edit Barang Masuk' : 'Tambah Barang Masuk'}
              </h3>
              <MenuMasukForm
                stocks={stocks}
                initialData={editingTransaction}
                onSubmit={handleFormSubmit}
                onCancel={handleCancel}
              />
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Konfirmasi Hapus</h3>
            <p className="text-gray-600 mb-4">Apakah Anda yakin ingin menghapus transaksi ini?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteTransaction(confirmDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Menu Masuk Form Component
function MenuMasukForm({ stocks, initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    tanggal: initialData?.tanggal ? new Date(initialData.tanggal).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    kode_barang: initialData?.kode_barang || '',
    nama_menu: initialData?.nama_menu || '',
    qty_masuk: initialData?.qty_masuk || 1,
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'kode_barang') {
      const selectedStock = stocks.find(stock => stock.kode_barang === value);
      if (selectedStock) {
        setFormData(prev => ({
          ...prev,
          nama_menu: selectedStock.nama_menu
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (!formData.kode_barang || !formData.nama_menu) {
        throw new Error('Kode barang dan nama menu wajib diisi');
      }
      if (isNaN(formData.qty_masuk) || formData.qty_masuk <= 0) {
        throw new Error('Quantity harus angka lebih dari 0');
      }

      await onSubmit(formData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-black mb-1">
          Tanggal
        </label>
        <input
          type="date"
          name="tanggal"
          value={formData.tanggal}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-black mb-1">
          Kode Barang
        </label>
        <select
          name="kode_barang"
          value={formData.kode_barang}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Pilih Kode Barang</option>
          {stocks.map(stock => (
            <option key={stock._id} value={stock.kode_barang}>
              {stock.kode_barang} - {stock.nama_menu}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-black mb-1">
          Nama Menu
        </label>
        <input
          type="text"
          name="nama_menu"
          value={formData.nama_menu}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          required
          readOnly
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-black mb-1">
          Quantity Masuk
        </label>
        <input
          type="number"
          name="qty_masuk"
          value={formData.qty_masuk}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          min="1"
        />
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}