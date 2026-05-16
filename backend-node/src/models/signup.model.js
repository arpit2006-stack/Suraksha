import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    dob: { type: String, required: true }, // Format: YYYY-MM-DD
    
    // Banking Details
    accountNo: { type: String, required: true },
    ifscCode: { type: String, required: true },
    branchName: { type: String, required: true },
    
    // Identity Details (Forbidden IDs - Only Schema names used)
    aadhaarNumber: { type: String, required: true }, // Verification ke liye
    panCardNo: { type: String, required: true },
    
    // Security Status
    isVerified: { type: Boolean, default: false },
    trustScore: { type: Number, default: 0 },
    
    // Forensics Result (Python Backend se aayega)
    forensicsReport: {
        status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' },
        anomalies: [String]
    }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);