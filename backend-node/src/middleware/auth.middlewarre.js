import jwt from 'jsonwebtoken';
import { User } from '../models/signup.model.js';
import dotenv from 'dotenv';

dotenv.config();

export const protectRoute = async (req, res, next) => {
    try {
        let token;

        // Check karo ki token Authorization header mein hai ya nahi
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1]; // 'Bearer <token>' se token alag kiya
        }

        if (!token) {
            return res.status(401).json({ message: "Access Denied: Token nahi mila bhai!" });
        }

        // Token ko verify karo
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Token ke andar se userId nikaal kar user ko dhoodo
        req.user = await User.findById(decoded.userId).select('-otp -otpExpires'); // Sensitive data exclude kiya

        if (!req.user) {
            return res.status(404).json({ message: "User nahi mila!" });
        }

        next(); // Agar sab sahi hai toh agle function par jao
    } catch (error) {
        return res.status(401).json({ message: "Invalid ya Expired Token!", error: error.message });
    }
};