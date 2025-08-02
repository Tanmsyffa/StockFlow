import { connectToDatabase } from '../../../lib/dbConnect';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, newPassword } = req.body;

  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    
    const user = await usersCollection.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    );
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}