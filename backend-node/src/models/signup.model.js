import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    dob: { type: String, required: true },
    
    // Banking Details
    accountNo: { type: String, required: true },
    ifscCode: { type: String, required: true },
    branchName: { type: String, required: true },
    
    // Identity Details (Masked on Frontend later)
    aadhaarNumber: { 
        type: String, 
        required: true,
        match: [/^\d{12}$/, 'Please provide a valid 12-digit Aadhaar Number.']
    },
    panCardNo: { 
        type: String, 
        required: true,
        match: [/^[A-Z]{5}\d{4}[A-Z]{1}$/, 'Please provide a valid PAN format (e.g. ABCDE1234F).']
    },
    
    // Security & IP Tracking
    registrationIp: { type: String, required: true },
    lastLoginIp: { type: String },
    isVerified: { type: Boolean, default: false }, // Python engine pass karne par true hoga
    trustScore: { type: Number, default: 0 },

    otp: { type: String },
    otpExpires: { type: Date }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);