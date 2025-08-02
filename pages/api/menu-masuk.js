import dbConnect from "../../lib/dbConnect";
import { Stock, MenuMasuk } from "../../lib/models";

export default async function handler(req, res) {
  await dbConnect();

  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const menuMasuk = await MenuMasuk.find({}).sort({ tanggal: -1 });
        return res.status(200).json(menuMasuk);
      } catch (error) {
        return res
          .status(500)
          .json({ message: "Gagal memuat data", error: error.message });
      }

    case "POST":
      try {
        const { kode_barang, nama_menu, qty_masuk, tanggal } = req.body;
        const qtyNum = parseInt(qty_masuk);

        if (!kode_barang || !nama_menu || !qty_masuk) {
          return res.status(400).json({ message: "Field wajib tidak lengkap" });
        }

        if (isNaN(qtyNum) || qtyNum <= 0) {
          return res
            .status(400)
            .json({ message: "Quantity harus angka lebih dari 0" });
        }

        const stock = await Stock.findOne({ kode_barang }).exec();
        if (!stock) {
          return res
            .status(404)
            .json({ message: "Kode barang tidak ditemukan" });
        }

        if (typeof stock.updateStock !== "function") {
          throw new Error("Method updateStock tidak tersedia");
        }

        const newMenuMasuk = new MenuMasuk({
          tanggal: tanggal ? new Date(tanggal) : new Date(),
          kode_barang,
          nama_menu,
          qty_masuk: qtyNum,
        });

        await newMenuMasuk.save();
        await stock.updateStock(qtyNum, "tambah");

        return res.status(201).json(newMenuMasuk);
      } catch (error) {
        console.error("Error lengkap di POST /api/menu-masuk:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
        return res.status(500).json({
          message: "Gagal menyimpan data",
          error: error.message,
        });
      }

    case "PUT":
      try {
        const { id, qty_masuk } = req.body;
        const data = await MenuMasuk.findByIdAndUpdate(
          id,
          { qty_masuk: parseInt(qty_masuk) },
          { new: true }
        );
        if (!data) {
          return res.status(404).json({ message: "Data tidak ditemukan" });
        }
        return res.status(200).json({ message: "Berhasil diupdate", data });
      } catch (error) {
        return res.status(500).json({
          message: "Terjadi kesalahan saat update",
          error: error.message,
        });
      }

    case "DELETE":
      try {
        const { id } = req.query;

        // Cari dulu transaksi yang mau dihapus
        const transaction = await MenuMasuk.findById(id);
        if (!transaction) {
          return res.status(404).json({ message: "Data tidak ditemukan" });
        }

        // Hapus dari MenuMasuk
        await MenuMasuk.findByIdAndDelete(id);

        // Kurangi stock_akhir di Stock
        const stock = await Stock.findOne({
          kode_barang: transaction.kode_barang,
        });
        if (stock) {
          stock.stock_akhir = Math.max(
            0,
            stock.stock_akhir - transaction.qty_masuk
          );
          await stock.save();
        }

        return res
          .status(200)
          .json({ message: "Data berhasil dihapus dan stok diperbarui" });
      } catch (error) {
        return res.status(500).json({
          message: "Gagal menghapus data",
          error: error.message,
        });
      }

    default:
      return res.status(405).json({ message: "Method tidak diizinkan" });
  }
}
