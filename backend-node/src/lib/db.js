import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log("❌ Problem in mongo connection", error);
        process.exit(1); // Agar connect nahi hua toh server stop kar do
    }
};