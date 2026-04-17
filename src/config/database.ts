import mongoose from 'mongoose';

// Hàm kết nối MongoDB
// mongoose.connect() trả về Promise nên dùng async/await
const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined in .env file');
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Thoát app nếu không kết nối được DB
  }
};

export default connectDB;
