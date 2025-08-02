import { useState, useEffect } from 'react';

export default function StockForm({ stock, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    kode_barang: '',
    nama_menu: '',
    modal: '',
    harga_jual: '',
    stock_awal: '',
    kategori: ''
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (stock) {
      setFormData({
        kode_barang: stock.kode_barang || '',
        nama_menu: stock.nama_menu || '',
        modal: stock.modal || '',
        harga_jual: stock.harga_jual || '',
        stock_awal: stock.stock_awal || '',
        kategori: stock.kategori || ''
      });
    }
  }, [stock]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!formData.kode_barang || !formData.nama_menu) {
        throw new Error('Kode barang dan nama menu wajib diisi');
      }

      if (isNaN(formData.modal)) {
        throw new Error('Modal harus berupa angka');
      }

      if (isNaN(formData.harga_jual)) {
        throw new Error('Harga jual harus berupa angka');
      }

      if (isNaN(formData.stock_awal)) {
        throw new Error('Stok awal harus berupa angka');
      }

      onSubmit({
        ...formData,
        modal: parseFloat(formData.modal),
        harga_jual: parseFloat(formData.harga_jual),
        stock_awal: parseInt(formData.stock_awal),
        stock_akhir: parseInt(formData.stock_awal),
        total_pembelian: parseFloat(formData.modal) * parseInt(formData.stock_awal),
        total_pendapatan: 0,
        total_laba: 0
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl shadow-lg p-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-medium text-gray-800">
          {stock ? 'Edit Barang' : 'Tambah Barang Baru'}
        </h3>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Kode Barang</label>
          <input
            type="text"
            name="kode_barang"
            value={formData.kode_barang}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
            readOnly={!!stock}
            placeholder="BRG-001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nama Menu</label>
          <input
            type="text"
            name="nama_menu"
            value={formData.nama_menu}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
            placeholder="Nama produk/menu"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Modal (Rp)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              Rp
            </div>
            <input
              type="number"
              name="modal"
              value={formData.modal}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required
              step="0.01"
              min="0"
              placeholder="10.000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Harga Jual (Rp)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              Rp
            </div>
            <input
              type="number"
              name="harga_jual"
              value={formData.harga_jual}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required
              step="0.01"
              min="0"
              placeholder="15.000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Stok Awal</label>
          <input
            type="number"
            name="stock_awal"
            value={formData.stock_awal}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
            min="0"
            placeholder="50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
          <select
            name="kategori"
            value={formData.kategori}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0iYmkgYmktY2hldnJvbi1kb3duIiB2aWV3Qm94PSIwIDAgMTYgMTYiPgogIDxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgZD0iTTEuNjQ2IDQuNjQ2YS41LjUgMCAwIDEgLjcwOCAwTDggMTAuMjkzbDUuNjQ2LTUuNjQ3YS41LjUgMCAwIDEgLjcwOC43MDhsLTYgNmEuNS41IDAgMCAxLS43MDggMGwtNi02YS41LjUgMCAwIDEgMC0uNzA4eiIvPgo8L3N2Zz4=')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:16px_12px]"
          >
            <option value="">-- Pilih Kategori --</option>
            <option value="Makanan">Makanan</option>
            <option value="Minuman">Minuman</option>
            <option value="Snack">Snack</option>
            <option value="Bahan Baku">Bahan Baku</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Menyimpan...
            </span>
          ) : stock ? 'Perbarui Barang' : 'Tambah Barang'}
        </button>
      </div>
    </form>
  );
}