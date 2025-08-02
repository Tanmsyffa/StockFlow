import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema({
  kode_barang: { type: String, required: true, unique: true },
  nama_menu: { type: String, required: true },
  modal: { type: Number, required: true },
  harga_jual: { type: Number, required: true },
  stock_awal: { type: Number, required: true },
  menu_masuk: { type: Number, default: 0 },
  menu_terjual: { type: Number, default: 0 },
  stock_akhir: { type: Number, default: 0 },
  total_pembelian: { type: Number, default: 0 },
  total_pendapatan: { type: Number, default: 0 },
  total_laba: { type: Number, default: 0 },
  kategori: { type: String, default: '', required: true},
}, {
  timestamps: true
});

// Cek apakah model sudah ada, jika tidak buat baru
const Stock = mongoose.models.Stock || mongoose.model('Stock', stockSchema);

export default Stock;