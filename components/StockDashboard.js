import { useState, useEffect } from "react";
import DashboardCard from "./DashboardCard";
import StockTable from "./StockTable";
import StockForm from "./StockForm";
import { useSession } from "next-auth/react";
import { ChartBarIcon, PlusIcon } from "@heroicons/react/outline";

export default function StockDashboard() {
  const { data: session } = useSession();
  const [stocks, setStocks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    totalValue: 0,
    outOfStock: 0,
  });

  const fetchStocks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/stock");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      setStocks(data);

      const totalItems = data.length;
      const lowStock = data.filter(
        (item) => item.stock_akhir < 10 && item.stock_akhir > 0
      ).length;
      const outOfStock = data.filter((item) => item.stock_akhir <= 0).length;
      const totalValue = data.reduce(
        (sum, item) => sum + item.stock_akhir * item.modal,
        0
      );

      setStats({ totalItems, lowStock, outOfStock, totalValue });
    } catch (error) {
      console.error("Error fetching stocks:", error);
      setError("Gagal memuat data stok: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const handleAddStock = () => {
    setEditingStock(null);
    setShowForm(true);
  };

  const handleEditStock = (stock) => {
    setEditingStock(stock);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      const url = editingStock
        ? `/api/stock/${editingStock._id}`
        : "/api/stock";
      const method = editingStock ? "PUT" : "POST";

      const dataToSend = {
        ...formData,
        kode_barang: formData.kode_barang,
        nama_menu: formData.nama_menu || formData.nama_barang,
        modal: Number(formData.modal),
        harga_jual: Number(formData.harga_jual),
        stock_awal: Number(formData.stock_awal || 0),
        stock_akhir: Number(formData.stock_akhir || formData.stock_awal || 0),
        total_pembelian: Number(formData.total_pembelian || 0),
        kategori: formData.kategori || "Makanan",
        status: formData.status || "aktif",
      };

      if (editingStock) {
        dataToSend._id = editingStock._id;
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (result.success) {
        await fetchStocks();
        setShowForm(false);
        setEditingStock(null);
        alert(result.message || "Data berhasil disimpan");
      } else {
        alert(result.message || "Error saving stock");
      }
    } catch (error) {
      console.error("Error saving stock:", error);
      alert("Error saving stock: " + error.message);
    }
  };

  const handleDeleteStock = async (id) => {
    const confirmDelete = window.confirm("Hapus data stok ini?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/stock/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menghapus");
      }

      setStocks(stocks.filter((item) => item._id !== id));
      alert("Berhasil dihapus.");
    } catch (error) {
      console.error("Error deleting stock:", error);
      alert("Gagal menghapus stok: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4">
          
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-300 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Error Loading Data</h3>
          <p className="text-red-600 mt-2">{error}</p>
          <button
            onClick={fetchStocks}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Dashboard Stok Menu
          </h2>
          <p className="text-gray-600">Ringkasan stok dan inventaris menu</p>
        </div>

        {session?.user?.role === "admin" && (
          <button
            onClick={handleAddStock}
            className="flex items-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition shadow-sm"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Tambah Menu
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Menu"
          value={stats.totalItems}
          icon={ChartBarIcon}
          color="blue"
        />
        <DashboardCard
          title="Stok Rendah"
          value={stats.lowStock}
          icon={ChartBarIcon}
          color="yellow"
        />
        <DashboardCard
          title="Stok Habis"
          value={stats.outOfStock}
          icon={ChartBarIcon}
          color="red"
        />
        <DashboardCard
          title="Total Nilai Stok"
          value={`Rp${stats.totalValue.toLocaleString()}`}
          icon={ChartBarIcon}
          color="green"
        />
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">
            Daftar Stok Menu
          </h3>
        </div>
        <StockTable
          stocks={stocks}
          loading={false}
          onEdit={handleEditStock}
          onDelete={handleDeleteStock}
          isAdmin={session?.user?.role === "admin"}
        />
      </div>

      {/* Stock Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-500/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {editingStock ? "Edit Menu" : "Tambah Menu Baru"}
              </h3>
              <StockForm
                stock={editingStock}
                onSubmit={handleFormSubmit}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
