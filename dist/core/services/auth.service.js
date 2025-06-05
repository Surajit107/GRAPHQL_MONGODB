"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const otplib_1 = require("otplib");
const User_model_1 = require("../models/User.model");
const errors_1 = require("../../utils/errors");
const logger_1 = require("../../infrastructure/logging/logger");
const env_1 = require("../../config/env");
class AuthService {
    constructor() {
        this.SALT_ROUNDS = 10;
        this.JWT_EXPIRES_IN = '24h';
        if (!env_1.env.jwtSecret) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }
        this.JWT_SECRET = env_1.env.jwtSecret;
    }
    transformUser(user) {
        const { _id, password, ...userData } = user.toObject();
        return {
            ...userData,
            id: _id.toString()
        };
    }
    async register(userData) {
        try {
            const existingUser = await User_model_1.UserModel.findOne({
                $or: [
                    { email: userData.email },
                    { username: userData.username }
                ]
            });
            if (existingUser) {
                throw new errors_1.BaseError('User already exists', 400);
            }
            const hashedPassword = await bcryptjs_1.default.hash(userData.password, this.SALT_ROUNDS);
            const user = await User_model_1.UserModel.create({
                ...userData,
                password: hashedPassword
            });
            return this.transformUser(user);
        }
        catch (error) {
            logger_1.logger.error('Error in register:', { error, email: userData.email });
            throw error instanceof errors_1.BaseError ? error : new errors_1.BaseError('Registration failed', 500);
        }
    }
    async login(email, password) {
        try {
            const user = await User_model_1.UserModel.findOne({ email });
            if (!user) {
                throw new errors_1.BaseError('Invalid credentials', 401);
            }
            const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
            if (!isValidPassword) {
                throw new errors_1.BaseError('Invalid credentials', 401);
            }
            const token = this.generateToken(user);
            return {
                token,
                user: this.transformUser(user)
            };
        }
        catch (error) {
            logger_1.logger.error('Error in login:', { error, email });
            throw error instanceof errors_1.BaseError ? error : new errors_1.BaseError('Login failed', 500);
        }
    }
    generateToken(user) {
        const payload = {
            userId: user._id.toString(),
            email: user.email
        };
        return jsonwebtoken_1.default.sign(payload, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN });
    }
    async generate2FASecret(userId) {
        try {
            const user = await User_model_1.UserModel.findById(userId);
            if (!user) {
                throw new errors_1.BaseError('User not found', 404);
            }
            const secret = otplib_1.authenticator.generateSecret();
            const qrCode = otplib_1.authenticator.keyuri(user.email, 'YourApp', secret);
            user.twoFactorSecret = secret;
            await user.save();
            return { secret, qrCode };
        }
        catch (error) {
            logger_1.logger.error('Error generating 2FA secret:', { error, userId });
            throw error instanceof errors_1.BaseError ? error : new errors_1.BaseError('Failed to generate 2FA secret', 500);
        }
    }
    async verify2FAToken(userId, token) {
        try {
            const user = await User_model_1.UserModel.findById(userId);
            if (!user || !user.twoFactorSecret) {
                throw new errors_1.BaseError('2FA not set up', 400);
            }
            return otplib_1.authenticator.verify({
                token,
                secret: user.twoFactorSecret
            });
        }
        catch (error) {
            logger_1.logger.error('Error verifying 2FA token:', { error, userId });
            throw error instanceof errors_1.BaseError ? error : new errors_1.BaseError('2FA verification failed', 500);
        }
    }
}
exports.AuthService = AuthService;
