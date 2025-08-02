// pages/api/menu-jual/[id].js - Fixed version using Mongoose Model
import dbConnect from '../../../lib/dbConnect';
import { MenuJual } from '../../../lib/models';

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  // Connect to database
  await dbConnect();

  switch (method) {
    case "DELETE":
      try {
        const result = await MenuJual.findByIdAndDelete(id);

        if (!result) {
          return res.status(404).json({ 
            success: false, 
            error: "Data not found" 
          });
        }

        res.status(200).json({ 
          success: true, 
          deletedCount: 1,
          data: result 
        });
      } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ 
          success: false, 
          error: "Server error",
          details: error.message 
        });
      }
      break;

    default:
      res.setHeader("Allow", ["DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}