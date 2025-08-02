import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

const StockSchema = new mongoose.Schema(
  {
    kode_barang: {
      type: String,
      required: true,
    },
    nama_menu: {
      type: String,
      required: true,
      trim: true,
    },
    modal: {
      type: Number,
      required: true,
      min: 0,
    },
    harga_jual: {
      type: Number,
      required: true,
      min: 0,
    },
    stock_awal: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    stock_akhir: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    menu_masuk: {
      type: Number,
      default: 0,
      min: 0,
    },
    menu_terjual: {
      type: Number,
      default: 0,
      min: 0,
    },
    total_pembelian: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    total_pendapatan: {
      type: Number,
      default: 0,
      min: 0,
    },
    total_laba: {
      type: Number,
      default: 0,
    },
    kategori: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["aktif", "nonaktif"],
      default: "aktif",
    },
  },
  {
    timestamps: true,
  }
);

const MenuMasukSchema = new mongoose.Schema(
  {
    kode_barang: {
      type: String,
      required: true,
    },
    nama_menu: {
      type: String,
      required: true,
      trim: true,
    },
    qty_masuk: {
      type: Number,
      required: true,
      min: 1,
    },
    tanggal: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const MenuJualSchema = new mongoose.Schema(
  {
    kode_barang: {
      type: String,
      required: true,
    },
    nama_menu: {
      type: String,
      required: true,
      trim: true,
    },
    jumlah: {
      type: Number,
      required: true,
      min: 1,
    },
    harga_satuan: {
      type: Number,
      required: true,
      min: 0,
    },
    total_harga: {
      type: Number,
      required: true,
      min: 0,
    },
    keuntungan: {
      type: Number,
      required: true,
    },
    tanggal: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

StockSchema.methods.updateStock = function (jumlah, operasi = "kurang") {
  if (operasi === "kurang") {
    this.stock_akhir = Math.max(0, this.stock_akhir - jumlah);
  } else if (operasi === "tambah") {
    this.stock_akhir += jumlah;
  }
  return this.save();
};

UserSchema.index({ email: 1 }, { unique: true });
StockSchema.index({ kode_barang: 1 });
StockSchema.index({ nama_menu: "text" });
MenuMasukSchema.index({ kode_barang: 1, tanggal: -1 });
MenuJualSchema.index({ kode_barang: 1, tanggal: -1 });

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
export const Stock =
  mongoose.models.Stock || mongoose.model("Stock", StockSchema);
export const MenuMasuk =
  mongoose.models.MenuMasuk || mongoose.model("MenuMasuk", MenuMasukSchema);
export const MenuJual =
  mongoose.models.MenuJual || mongoose.model("MenuJual", MenuJualSchema);
