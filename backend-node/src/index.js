import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './lib/db.js';
import authRoutes from './routes/auth.route.js';

dotenv.config();

const app = express();

// Explicit CORS for frontend
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());

app.use('/auth', authRoutes);


const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("SuRaksha MERN Backend is Live!");
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    connectDB();
});