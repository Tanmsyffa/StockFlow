import dbConnect from '../../../lib/dbConnect';
import { Stock } from '../../../lib/models';

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  await dbConnect();

  try {
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid stock ID format' 
      });
    }

    const stock = await Stock.findById(id);
    if (!stock) {
      return res.status(404).json({ 
        success: false, 
        message: 'Stock not found' 
      });
    }

    switch (method) {
      case 'GET':
        res.status(200).json({
          success: true,
          data: stock
        });
        break;
        
      case 'PUT':
        const updatedStock = await Stock.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        
        res.status(200).json({
          success: true,
          message: 'Stock berhasil diupdate',
          data: updatedStock
        });
        break;
        
      case 'DELETE':
        await stock.deleteOne();
        
        res.status(200).json({ 
          success: true,
          message: 'Stock berhasil dihapus'
        });
        break;
        
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).json({
          success: false,
          message: `Method ${method} Not Allowed`
        });
    }
  } catch (error) {
    console.error('Handler error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error: ' + validationErrors.join(', ')
      });
    }
    
    // Handle mongoose cast errors (invalid ObjectId, etc.)
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid data format'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error'
    });
  }
}