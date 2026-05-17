import { User } from '../models/signup.model.js';
import { sendOtpEmail } from '../lib/email.js';
import jwt from 'jsonwebtoken'; 


// 1. SIGNUP CONTROLLER
export const signup = async (req, res) => {
    try {
        const { fullName, email, dob, accountNo, ifscCode, branchName, aadhaarNumber, panCardNo } = req.body;

        // User check
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already registered!" });

        // Capture Client IP
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

        const newUser = await User.create({
            fullName, email, dob, accountNo, ifscCode, branchName, aadhaarNumber, panCardNo,
            registrationIp: clientIp, // IP saved during signup
            isVerified: false // Testing ke liye defaults
        });

        res.status(201).json({
            success: true,
            message: "Signup successful! IP Registered.",
            userIp: clientIp,
            userId: newUser._id
        });
    } catch (error) {
        res.status(500).json({ message: "Signup error", error: error.message });
    }
};

// 2. LOGIN CONTROLLER (With Adaptive IP Check)
export const login = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User nahi mila bhai!" });

        // Adaptive IP Check (Jo tumne pehle banaya tha)
        const currentIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        user.lastLoginIp = currentIp;

        if (user.registrationIp !== currentIp) {
            return res.status(200).json({
                success: true,
                needsChallenge: true,
                message: "⚠️ Alert: Different network detected! Verification required."
            });
        }

        // IP Match -> Generate 6 Digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save OTP and 5 mins Expiry in DB
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); 
        await user.save();

        // Send Email
        const emailSent = await sendOtpEmail(user.email, otp);
        if (!emailSent) return res.status(500).json({ message: "Email bhejne mein dikkat hui!" });

        res.status(200).json({
            success: true,
            needsChallenge: false,
            message: "✅ OTP sent successfully to your inbox!"
        });

    } catch (error) {
        res.status(500).json({ message: "Login error", error: error.message });
    }
};

// 2. VERIFY OTP CONTROLLER
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User nahi mila!" });

        if (!user.otp || user.otp !== otp) {
            return res.status(400).json({ message: "Galat OTP hai bhai!" });
        }

        if (new Date() > user.otpExpires) {
            return res.status(400).json({ message: "OTP expire ho gaya!" });
        }

        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        // 2. GENERATE JWT TOKEN (Payload mein userId daal rahe hain)
        const token = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' } // Token 1 hour ke liye valid rahega
        );

        // 3. Response mein token bhej do
        res.status(200).json({
            success: true,
            message: "🎉 Authentication Successful! SuRaksha Dashboard open.",
            token, // Ye token frontend save karega
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Verification error", error: error.message });
    }
};