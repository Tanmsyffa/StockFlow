// components/StockTable.js
import { useState } from 'react';
import { PencilIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/outline';

export default function StockTable({ stocks, loading, onEdit, onDelete, isAdmin }) {
  const [sortField, setSortField] = useState('nama_menu');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');

  // Ensure stocks is always an array
  const safeStocks = Array.isArray(stocks) ? stocks : [];

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedStocks = [...safeStocks].sort((a, b) => {
    // Handle null/undefined values
    const aValue = a[sortField] || '';
    const bValue = b[sortField] || '';
    
    // Convert to string for comparison if needed
    const aStr = typeof aValue === 'string' ? aValue.toLowerCase() : String(aValue);
    const bStr = typeof bValue === 'string' ? bValue.toLowerCase() : String(bValue);
    
    if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
    if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredStocks = sortedStocks.filter(stock => {
    if (!stock) return false;
    
    const kodeBarang = stock.kode_barang || '';
    const namaMenu = stock.nama_menu || '';
    const searchLower = searchTerm.toLowerCase();
    
    return kodeBarang.toLowerCase().includes(searchLower) ||
           namaMenu.toLowerCase().includes(searchLower);
  });

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUpIcon className="h-4 w-4 ml-1" /> : 
      <ChevronDownIcon className="h-4 w-4 ml-1" />;
  };

  // Helper function to safely format numbers
  const formatNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  // Helper function to calculate total laba
  const calculateTotalLaba = (stock) => {
    if (!stock) return 0;
    const modal = formatNumber(stock.modal);
    const hargaJual = formatNumber(stock.harga_jual);
    const stockAkhir = formatNumber(stock.stock_akhir);
    
    return (hargaJual - modal) * stockAkhir;
  };

  return (
    <div className="overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Cari kode atau nama barang..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {filteredStocks.length} dari {safeStocks.length} barang
        </div>
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
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('kode_barang')}
                >
                  <div className="flex items-center">
                    Kode
                    <SortIcon field="kode_barang" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('nama_menu')}
                >
                  <div className="flex items-center">
                    Nama Barang
                    <SortIcon field="nama_menu" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('modal')}
                >
                  <div className="flex items-center justify-end">
                    Modal
                    <SortIcon field="modal" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('harga_jual')}
                >
                  <div className="flex items-center justify-end">
                    Harga Jual
                    <SortIcon field="harga_jual" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('stock_akhir')}
                >
                  <div className="flex items-center justify-center">
                    Stok Akhir
                    <SortIcon field="stock_akhir" />
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Laba
                </th>
                {isAdmin && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStocks.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="px-6 py-8 text-center">
                    <div className="text-gray-500">
                      {safeStocks.length === 0 ? (
                        <div>
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.813 2.602 9.288 6.286M30 14a6 6 0 11-12 0 6 6 0 0112 0zm12 6a4 4 0 11-8 0 4 4 0 018 0zm-28 0a4 4 0 11-8 0 4 4 0 018 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada data barang</h3>
                          <p className="mt-1 text-sm text-gray-500">Mulai dengan menambahkan barang pertama Anda.</p>
                        </div>
                      ) : (
                        <div>
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M21 21l-8-8m0 0L5 21m8-8v16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada hasil pencarian</h3>
                          <p className="mt-1 text-sm text-gray-500">Coba ubah kata kunci pencarian Anda.</p>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStocks.map((stock) => {
                  const totalLaba = calculateTotalLaba(stock);
                  const stockAkhir = formatNumber(stock.stock_akhir);
                  
                  return (
                    <tr key={stock._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600">
                          {stock.kode_barang || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {stock.nama_menu || '-'}
                        </div>
                        {stock.kategori && (
                          <div className="text-xs text-gray-500">
                            {stock.kategori}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        Rp{formatNumber(stock.modal).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        Rp{formatNumber(stock.harga_jual).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          stockAkhir <= 0 
                            ? 'bg-red-100 text-red-800' 
                            : stockAkhir < 10 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {stockAkhir}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold">
                        <span className={totalLaba >= 0 ? 'text-green-600' : 'text-red-600'}>
                          Rp{Math.abs(totalLaba).toLocaleString()}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => onEdit(stock)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                              title="Edit barang"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => onDelete(stock._id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                              title="Hapus barang"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}