// pages/api/menu-jual/deleteAll.js - Using Mongoose Model
import dbConnect from '../../../lib/dbConnect';
import { MenuJual } from '../../../lib/models';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader("Allow", ["DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Connect to database
    await dbConnect();

    const result = await MenuJual.deleteMany({});

    res.status(200).json({ 
      success: true, 
      deletedCount: result.deletedCount,
      message: `${result.deletedCount} data berhasil dihapus`
    });
    
  } catch (error) {
    console.error("Delete all error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Server error",
      details: error.message
    });
  }
}