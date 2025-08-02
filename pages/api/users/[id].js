// pages/api/users/[id].js
import dbConnect from "../../../lib/dbConnect";
import { User } from "../../../lib/models";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  await dbConnect();

  // Get session untuk authorization
  const session = await getServerSession(req, res, authOptions);
  
  // Hanya admin yang bisa manage users
  if (!session || session.user.role !== 'admin') {
    return res.status(403).json({ message: "Akses ditolak. Hanya admin yang diizinkan." });
  }

  const { id } = req.query;

  if (req.method === "DELETE") {
    try {
      if (!id) {
        return res.status(400).json({ message: "ID pengguna wajib diisi" });
      }

      // Cari user yang akan dihapus
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "Pengguna tidak ditemukan" });
      }

      // Tidak bisa menghapus diri sendiri
      if (user._id.toString() === session.user.id) {
        return res.status(400).json({ message: "Tidak dapat menghapus akun sendiri" });
      }

      // Hapus user
      await User.findByIdAndDelete(id);

      return res.status(200).json({ message: "Pengguna berhasil dihapus" });
    } catch (error) {
      console.error("DELETE /api/users/[id] error:", error);
      return res.status(500).json({ message: "Gagal menghapus pengguna" });
    }
  }

  if (req.method === "PUT") {
    try {
      const { name, email, role, password } = req.body;

      if (!id) {
        return res.status(400).json({ message: "ID pengguna wajib diisi" });
      }

      // Validasi input
      if (!name || !email || !role) {
        return res.status(400).json({ message: "Nama, email, dan role wajib diisi" });
      }

      // Validasi email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Format email tidak valid" });
      }

      // Validasi role
      if (!['admin', 'user'].includes(role)) {
        return res.status(400).json({ message: "Role tidak valid" });
      }

      // Cari user yang akan diupdate
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "Pengguna tidak ditemukan" });
      }

      // Cek apakah email sudah digunakan user lain
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: id }
      });
      if (existingUser) {
        return res.status(400).json({ message: "Email sudah digunakan pengguna lain" });
      }

      // Update data user
      user.name = name.trim();
      user.email = email.toLowerCase().trim();
      user.role = role;

      // Update password jika diberikan
      if (password && password.trim() !== '') {
        if (password.length < 6) {
          return res.status(400).json({ message: "Password minimal 6 karakter" });
        }
        const bcrypt = require('bcryptjs');
        const saltRounds = 12;
        user.password = await bcrypt.hash(password, saltRounds);
      }

      await user.save();

      // Return user tanpa password
      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return res.status(200).json(userResponse);
    } catch (error) {
      console.error("PUT /api/users/[id] error:", error);
      
      // Handle mongoose validation errors
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ message: messages.join(', ') });
      }
      
      // Handle duplicate key error
      if (error.code === 11000) {
        return res.status(400).json({ message: "Email sudah terdaftar" });
      }

      return res.status(500).json({ message: "Gagal mengupdate pengguna" });
    }
  }

  return res.status(405).json({ message: "Method tidak diizinkan" });
}