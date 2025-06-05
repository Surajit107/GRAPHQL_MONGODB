import mongoose, { Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../interfaces/user.interface';

export interface UserDocument extends Document, Omit<User, '_id'> {
    _id: mongoose.Types.ObjectId;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

interface UserModel extends Model<UserDocument> {
    findByCredentials(email: string, password: string): Promise<UserDocument>;
}

const userSchema = new mongoose.Schema<UserDocument>({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    isTwoFactorEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorSecret: {
        type: String,
        select: false
    }
}, {
    timestamps: true
});

// Pre-save middleware
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS || '12'));
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as Error);
    }
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Static methods
userSchema.statics.findByCredentials = async function(email: string, password: string): Promise<UserDocument> {
    const user = await this.findOne({ email }).select('+password');
    if (!user) throw new Error('Invalid login credentials');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error('Invalid login credentials');

    return user;
};

export const UserModel: Model<UserDocument> = mongoose.model<UserDocument>('User', userSchema); 