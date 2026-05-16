import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './lib/db.js';
import authRoutes from './routes/auth.route.js';

// .env load karo
dotenv.config();

const app = express();

// Use the auth routes


// Middlewares
app.use(cors());
app.use(express.json()); // JSON data handle karne ke liye

app.use('/auth', authRoutes);

const PORT = process.env.PORT || 5000;

// Base Route (Testing ke liye)
app.get("/", (req, res) => {
    res.send("SuRaksha MERN Backend is Live!");
});

// Server Start Logic
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    connectDB(); // Database connect kar rahe hain
});