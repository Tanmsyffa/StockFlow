// pages/api/users.js
import dbConnect from "../../lib/dbConnect";
import { User } from "../../lib/models";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  await dbConnect();
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ message: "Anda harus login terlebih dahulu." });
  }

  if (session.user.role !== 'admin') {
    return res.status(403).json({ message: "Akses ditolak. Hanya admin yang diizinkan." });
  }

  if (req.method === "GET") {
    try {
      const users = await User.find({}).select('-password').sort({ createdAt: -1 });
      return res.status(200).json(users);
    } catch (error) {
      console.error("GET /api/users error:", error);
      return res.status(500).json({ message: "Gagal mengambil data pengguna" });
    }
  }

  if (req.method === "POST") {
    try {
      const { name, email, role, password } = req.body;

      if (!name || !email || !role || !password) {
        return res.status(400).json({ message: "Semua field wajib diisi" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Format email tidak valid" });
      }

      if (!['admin', 'user'].includes(role)) {
        return res.status(400).json({ message: "Role tidak valid" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password minimal 6 karakter" });
      }

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: "Email sudah terdaftar" });
      }

      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = new User({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role,
        password: hashedPassword,
      });

      await newUser.save();

      const userResponse = {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      };

      return res.status(201).json(userResponse);
    } catch (error) {
      console.error("POST /api/users error:", error);
      
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ message: messages.join(', ') });
      }
      
      if (error.code === 11000) {
        return res.status(400).json({ message: "Email sudah terdaftar" });
      }

      return res.status(500).json({ message: "Gagal membuat pengguna baru" });
    }
  }

  if (req.method === "PUT") {
    try {
      const { id, name, email, role, password } = req.body;

      if (!id) {
        return res.status(400).json({ message: "ID pengguna wajib diisi" });
      }

      if (!name || !email || !role) {
        return res.status(400).json({ message: "Nama, email, dan role wajib diisi" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Format email tidak valid" });
      }
      if (!['admin', 'user'].includes(role)) {
        return res.status(400).json({ message: "Role tidak valid" });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "Pengguna tidak ditemukan" });
      }

      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: id }
      });
      if (existingUser) {
        return res.status(400).json({ message: "Email sudah digunakan pengguna lain" });
      }

      user.name = name.trim();
      user.email = email.toLowerCase().trim();
      user.role = role;

      if (password && password.trim() !== '') {
        if (password.length < 6) {
          return res.status(400).json({ message: "Password minimal 6 karakter" });
        }
        const saltRounds = 12;
        user.password = await bcrypt.hash(password, saltRounds);
      }

      await user.save();
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
      console.error("PUT /api/users error:", error);

      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ message: messages.join(', ') });
      }

      if (error.code === 11000) {
        return res.status(400).json({ message: "Email sudah terdaftar" });
      }

      return res.status(500).json({ message: "Gagal mengupdate pengguna" });
    }
  }

  return res.status(405).json({ message: "Method tidak diizinkan" });
}