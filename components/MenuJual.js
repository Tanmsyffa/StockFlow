import { useState, useEffect } from "react";
import { PlusIcon, TrashIcon, ChartBarIcon, CalendarIcon, DocumentIcon, DocumentTextIcon, CurrencyDollarIcon } from "@heroicons/react/outline";

export default function MenuJual() {
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("transactions");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stocks
        const stocksResponse = await fetch("/api/stock");
        const stocksData = await stocksResponse.json();
        setStocks(stocksData);

        // Fetch transactions
        const transactionsResponse = await fetch("/api/menu-jual");
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData);

        setLoading(false);
      } catch (err) {
        setError("Gagal memuat data penjualan");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddTransaction = () => {
    setShowForm(true);
  };

  const handleFormSubmit = (newTransaction) => {
    setTransactions([newTransaction, ...transactions]);
    setShowForm(false);
  };

  const handleDeleteTransaction = async (id) => {
    if (!confirm("Yakin ingin menghapus transaksi ini?")) return;
    try {
      const response = await fetch(`/api/menu-jual/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus transaksi");
      }

      setTransactions((prev) => prev.filter((tx) => tx._id !== id));
    } catch (err) {
      console.error("Gagal menghapus transaksi", err);
      alert(err.message);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm("Yakin ingin menghapus semua data penjualan?")) return;
    try {
      const response = await fetch(`/api/menu-jual/deleteAll`, { method: "DELETE" });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menghapus semua data");
      }

      setTransactions([]);
    } catch (err) {
      console.error("Gagal menghapus semua data", err);
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Barang Terjual</h2>
          <p className="text-gray-600">Daftar transaksi penjualan barang</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleAddTransaction}
            className="flex items-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition shadow-sm"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            <span className="whitespace-nowrap">Tambah Penjualan</span>
          </button>
          <button
            onClick={() => setShowReports(true)}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-sm"
          >
            <DocumentTextIcon className="h-5 w-5 mr-1" />
            <span className="whitespace-nowrap">Laporan Penjualan</span>
          </button>
          <button
            onClick={handleDeleteAll}
            className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition shadow-sm"
          >
            <TrashIcon className="h-5 w-5 mr-1" />
            <span className="whitespace-nowrap">Hapus Semua</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">
            Riwayat Penjualan
          </h3>
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
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kode
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Barang
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Tidak ada data penjualan
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => {
                    const stock = stocks.find(
                      (s) => s.kode_barang === transaction.kode_barang
                    );
                    const total = transaction.total_harga || 0;

                    return (
                      <tr key={transaction._id} className="hover:bg-gray-50">
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.tanggal).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-blue-600">
                            {transaction.kode_barang}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-500">
                          {transaction.nama_menu}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium">
                          {transaction.jumlah}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-semibold">
                          Rp{total.toLocaleString("id-ID")}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-center">
                          <button
                            onClick={() =>
                              handleDeleteTransaction(transaction._id)
                            }
                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                            title="Hapus"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
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
                Tambah Penjualan
              </h3>
              <MenuJualForm
                stocks={stocks}
                onSubmit={handleFormSubmit}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Sales Reports Modal */}
      {showReports && (
        <div className="fixed inset-0 bg-gray-500/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Laporan Penjualan
                </h3>
                <button
                  onClick={() => setShowReports(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <SalesReports transactions={transactions} stocks={stocks} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sales Reports Component
function SalesReports({ transactions, stocks }) {
  const [activeTab, setActiveTab] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substr(0, 7));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Helper function to group transactions
  const groupTransactionsByDate = (transactions, period) => {
    const grouped = {};
    
    transactions.forEach(transaction => {
      let key;
      const date = new Date(transaction.tanggal);
      
      switch(period) {
        case "daily":
          key = date.toISOString().split("T")[0];
          break;
        case "monthly":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case "yearly":
          key = date.getFullYear().toString();
          break;
        default:
          key = date.toISOString().split("T")[0];
      }
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(transaction);
    });
    
    return grouped;
  };

  // Calculate summary for a period
  const calculateSummary = (transactions) => {
    const totalRevenue = transactions.reduce((sum, tx) => sum + (tx.total_harga || 0), 0);
    const totalItems = transactions.reduce((sum, tx) => sum + (tx.jumlah || 0), 0);
    const uniqueProducts = [...new Set(transactions.map(tx => tx.kode_barang))].length;
    
    return { totalRevenue, totalItems, uniqueProducts };
  };

  // Get filtered transactions based on active tab
  const getFilteredTransactions = () => {
    switch(activeTab) {
      case "daily":
        return transactions.filter(tx => 
          new Date(tx.tanggal).toISOString().split("T")[0] === selectedDate
        );
      case "monthly":
        return transactions.filter(tx => {
          const txDate = new Date(tx.tanggal);
          const txMonth = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
          return txMonth === selectedMonth;
        });
      case "yearly":
        return transactions.filter(tx => 
          new Date(tx.tanggal).getFullYear().toString() === selectedYear
        );
      default:
        return transactions;
    }
  };

  const filteredTransactions = getFilteredTransactions();
  const summary = calculateSummary(filteredTransactions);

  // Group by product for detailed breakdown
  const productBreakdown = {};
  filteredTransactions.forEach(tx => {
    if (!productBreakdown[tx.kode_barang]) {
      productBreakdown[tx.kode_barang] = {
        nama_menu: tx.nama_menu,
        totalQty: 0,
        totalRevenue: 0,
        transactions: 0
      };
    }
    productBreakdown[tx.kode_barang].totalQty += tx.jumlah || 0;
    productBreakdown[tx.kode_barang].totalRevenue += tx.total_harga || 0;
    productBreakdown[tx.kode_barang].transactions += 1;
  });

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab("daily")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "daily"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Harian
        </button>
        <button
          onClick={() => setActiveTab("monthly")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "monthly"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Bulanan
        </button>
        <button
          onClick={() => setActiveTab("yearly")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "yearly"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Tahunan
        </button>
      </div>

      {/* Date/Period Selector */}
      <div className="flex justify-center">
        {activeTab === "daily" && (
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )}
        {activeTab === "monthly" && (
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )}
        {activeTab === "yearly" && (
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Array.from(new Set(transactions.map(tx => new Date(tx.tanggal).getFullYear())))
              .sort((a, b) => b - a)
              .map(year => (
                <option key={year} value={year}>{year}</option>
              ))
            }
          </select>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-blue-600">Total Pendapatan</h4>
              <p className="text-2xl font-bold text-blue-900">
                Rp{summary.totalRevenue.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-green-600">Total Item Terjual</h4>
              <p className="text-2xl font-bold text-green-900">
                {summary.totalItems}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-purple-600">Produk Terjual</h4>
              <p className="text-2xl font-bold text-purple-900">
                {summary.uniqueProducts}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Breakdown Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-medium text-gray-900">Detail Penjualan per Produk</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kode Barang
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Menu
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty Terjual
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Pendapatan
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.keys(productBreakdown).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Tidak ada data untuk periode yang dipilih
                  </td>
                </tr>
              ) : (
                Object.entries(productBreakdown)
                  .sort(([,a], [,b]) => b.totalRevenue - a.totalRevenue)
                  .map(([kode, data]) => (
                    <tr key={kode} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600">{kode}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {data.nama_menu}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {data.totalQty}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold">
                        Rp{data.totalRevenue.toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                        {data.transactions}x
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
}

// Menu Jual Form Component (unchanged)
function MenuJualForm({ stocks, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    kode_barang: "",
    nama_menu: "",
    qty_jual: 1,
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-fill menu name when stock code is selected
    if (name === "kode_barang") {
      const stock = stocks.find((s) => s.kode_barang === value);
      if (stock) {
        setFormData((prev) => ({
          ...prev,
          nama_menu: stock.nama_menu,
        }));
        setSelectedStock(stock);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.kode_barang || !formData.nama_menu) {
        throw new Error("Kode barang dan nama menu wajib diisi");
      }

      if (isNaN(formData.qty_jual) || formData.qty_jual <= 0) {
        throw new Error("Quantity harus angka lebih dari 0");
      }

      // Check stock availability
      if (selectedStock && selectedStock.stock_akhir < formData.qty_jual) {
        throw new Error(
          `Stok tidak mencukupi. Stok tersedia: ${selectedStock.stock_akhir}`
        );
      }

      // Send to API
      const response = await fetch("/api/menu-jual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menambah penjualan");
      }

      const newTransaction = await response.json();
      onSubmit(newTransaction);
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
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
          {stocks.map((stock) => (
            <option key={stock._id} value={stock.kode_barang}>
              {stock.kode_barang} - {stock.nama_menu}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quantity Terjual
        </label>
        <input
          type="number"
          name="qty_jual"
          value={formData.qty_jual}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          min="1"
        />
      </div>

      {selectedStock && (
        <div className="p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            Stok tersedia:{" "}
            <span className="font-medium">{selectedStock.stock_akhir}</span>
          </p>
          <p className="text-sm text-gray-600">
            Harga jual:{" "}
            <span className="font-medium">
              Rp{selectedStock.harga_jual.toLocaleString()}
            </span>
          </p>
          <p className="text-sm text-gray-600">
            Total:{" "}
            <span className="font-medium">
              Rp
              {(selectedStock.harga_jual * formData.qty_jual).toLocaleString()}
            </span>
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isSubmitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
}