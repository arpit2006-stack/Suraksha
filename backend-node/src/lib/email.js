import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Sabse pehle env load karo taaki credentials mil sakein
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,     
        pass: process.env.EMAIL_PASSWORD  
    }
});

export const sendOtpEmail = async (email, otp) => {
    try {
        // Just for debugging: terminal mein check karne ke liye ki credentials aa rahe hain ya nahi
        console.log("Using Sender Email:", process.env.EMAIL_USER); 
        
        const mailOptions = {
            from: `"SuRaksha Security" <${process.env.EMAIL_USER}>`, 
            to: email,
            subject: `${otp} is your SuRaksha Verification Code`, 
            text: `Welcome to SuRaksha.\n\nYour one-time password (OTP) for secure login is: ${otp}\n\nThis code is valid for 5 minutes only. Please do not share it with anyone.`,
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error("❌ Email sending failed:", error);
        return false;
    }
};