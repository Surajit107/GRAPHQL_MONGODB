"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const userSchema = new mongoose_1.default.Schema({
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
// Add indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
// Pre-save middleware
userSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    try {
        const salt = await bcrypt_1.default.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS || '12'));
        this.password = await bcrypt_1.default.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
// Instance methods
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt_1.default.compare(candidatePassword, this.password);
};
// Static methods
userSchema.statics.findByCredentials = async function (email, password) {
    const user = await this.findOne({ email }).select('+password');
    if (!user)
        throw new Error('Invalid login credentials');
    const isMatch = await user.comparePassword(password);
    if (!isMatch)
        throw new Error('Invalid login credentials');
    return user;
};
exports.UserModel = mongoose_1.default.model('User', userSchema);
