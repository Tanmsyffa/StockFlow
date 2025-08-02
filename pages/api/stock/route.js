import { Stock } from '@/lib/models';
import dbConnect from '@/lib/dbConnect';

export async function GET(request) {
  await dbConnect();
  
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (id) {
      // Get single stock
      const stock = await Stock.findById(id);
      if (!stock) {
        return new Response(JSON.stringify({ message: 'Barang tidak ditemukan' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify(stock), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get all stocks
    const stocks = await Stock.find({});
    return new Response(JSON.stringify(stocks), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Server error', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request) {
  await dbConnect();
  
  try {
    const body = await request.json();
    const newStock = new Stock(body);
    await newStock.save();
    
    return new Response(JSON.stringify(newStock), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Gagal menambah barang', error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PUT(request) {
  await dbConnect();
  
  try {
    const { id, ...updateData } = await request.json();
    const updatedStock = await Stock.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updatedStock) {
      return new Response(JSON.stringify({ message: 'Barang tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify(updatedStock), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Gagal memperbarui barang', error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE(request) {
  await dbConnect();
  
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return new Response(JSON.stringify({ message: 'ID barang diperlukan' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const deletedStock = await Stock.findByIdAndDelete(id);
    
    if (!deletedStock) {
      return new Response(JSON.stringify({ message: 'Barang tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ message: 'Barang berhasil dihapus' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Gagal menghapus barang', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}