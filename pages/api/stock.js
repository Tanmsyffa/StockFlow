import dbConnect from "../../lib/dbConnect";
import Stock from "../../lib/models/Stock";

export default async function handler(req, res) {
  await dbConnect();

  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const stocks = await Stock.find({});
        return res.status(200).json(stocks);
      } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
      }

    case "POST":
      try {
        const newStock = await Stock.create(req.body);
        return res.status(201).json({ success: true, data: newStock });
      } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

    case "PUT":
      try {
        const { _id, ...updateData } = req.body;
        const updatedStock = await Stock.findByIdAndUpdate(_id, updateData, {
          new: true,
        });
        if (!updatedStock)
          return res
            .status(404)
            .json({ success: false, message: "Stock not found" });
        return res.status(200).json({ success: true, data: updatedStock });
      } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

    case "DELETE":
      try {
        const { _id } = req.body;
        const deletedStock = await Stock.findByIdAndDelete(_id);
        if (!deletedStock)
          return res
            .status(404)
            .json({ success: false, message: "Stock not found" });
        return res
          .status(200)
          .json({ success: true, message: "Stock deleted" });
      } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

    default:
      return res
        .status(405)
        .json({ success: false, message: "Method not allowed" });
  }
}
