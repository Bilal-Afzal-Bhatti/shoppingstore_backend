import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, "Name is required"],
        trim: true 
    },
    email: { 
        type: String, 
        required: [true, "Email is required"],
        unique: true, // Prevents duplicate registration
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    password: { 
        type: String, 
        required: [true, "Password is required"],
        minlength: 8 
    },
    role: { 
        type: String, 
        default: 'admin',
        enum: ['admin', 'superadmin'] 
    }
}, { timestamps: true });

// Auto-hash password before saving to Database
adminSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

export default mongoose.model('Admin', adminSchema);