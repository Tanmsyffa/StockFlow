import dbConnect from "../../lib/dbConnect";
import { Stock, MenuJual } from "../../lib/models";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    const menuJual = await MenuJual.find({}).sort({ tanggal: -1 });
    return res.status(200).json(menuJual);
  }

  if (req.method === "POST") {
    try {
      const { kode_barang, nama_menu, qty_jual } = req.body;

      if (!kode_barang || !nama_menu || qty_jual === undefined || qty_jual === null) {
        return res.status(400).json({ message: "Data tidak lengkap" });
      }

      const qtyNum = parseInt(qty_jual);
      if (isNaN(qtyNum) || qtyNum <= 0) {
        return res.status(400).json({ message: "Jumlah jual tidak valid" });
      }

      const stock = await Stock.findOne({ kode_barang });

      if (!stock) {
        return res.status(404).json({ message: "Kode barang tidak ditemukan" });
      }

      if (stock.stock_akhir < qtyNum) {
        return res.status(400).json({ message: "Stok tidak mencukupi" });
      }

      const hargaJual = Number(stock.harga_jual || 0);
      const modal = Number(stock.modal || 0);
      const keuntunganSatuan = hargaJual - modal;
      const totalHarga = hargaJual * qtyNum;
      const totalKeuntungan = keuntunganSatuan * qtyNum;

      const newMenuJual = new MenuJual({
        kode_barang,
        nama_menu,
        jumlah: qtyNum,
        harga_satuan: hargaJual,
        total_harga: totalHarga,
        keuntungan: totalKeuntungan,
        tanggal: new Date(),
      });

      await newMenuJual.save();

      const oldMenuTerjual = stock.menu_terjual || 0;
      const newMenuTerjual = oldMenuTerjual + qtyNum;
      
      stock.menu_terjual = newMenuTerjual;
      
      stock.stock_akhir = stock.stock_akhir - qtyNum;
      
      stock.total_pendapatan = hargaJual * newMenuTerjual;
      stock.total_laba = keuntunganSatuan * newMenuTerjual;

      await stock.save();

      return res.status(201).json(newMenuJual);
    } catch (error) {
      console.error("POST /api/menu-jual error:", error);
      return res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  }

  return res.status(405).json({ message: "Method tidak diizinkan" });
}