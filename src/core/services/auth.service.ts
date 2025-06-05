import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';
import { User, UserInput, AuthPayload, UserResponse } from '../interfaces/user.interface';
import { UserModel, UserDocument } from '../models/User.model';
import { BaseError } from '../../utils/errors';
import { logger } from '../../infrastructure/logging/logger';
import { env } from '../../config/env';

export class AuthService {
    private readonly SALT_ROUNDS = 10;
    private readonly JWT_SECRET: string;
    private readonly JWT_EXPIRES_IN = '24h';

    constructor() {
        if (!env.jwtSecret) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }
        this.JWT_SECRET = env.jwtSecret;
    }

    public transformUser(user: UserDocument): UserResponse {
        const { _id, password, ...userData } = user.toObject();
        return {
            ...userData,
            id: _id.toString()
        };
    }

    async register(userData: UserInput): Promise<UserResponse> {
        try {
            const existingUser = await UserModel.findOne({
                $or: [
                    { email: userData.email },
                    { username: userData.username }
                ]
            });

            if (existingUser) {
                throw new BaseError('User already exists', 400);
            }

            const hashedPassword = await bcrypt.hash(userData.password, this.SALT_ROUNDS);
            const user = await UserModel.create({
                ...userData,
                password: hashedPassword
            });

            return this.transformUser(user);
        } catch (error) {
            logger.error('Error in register:', { error, email: userData.email });
            throw error instanceof BaseError ? error : new BaseError('Registration failed', 500);
        }
    }

    async login(email: string, password: string): Promise<AuthPayload> {
        try {
            const user = await UserModel.findOne({ email });
            if (!user) {
                throw new BaseError('Invalid credentials', 401);
            }

            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                throw new BaseError('Invalid credentials', 401);
            }

            const token = this.generateToken(user);
            return {
                token,
                user: this.transformUser(user)
            };
        } catch (error) {
            logger.error('Error in login:', { error, email });
            throw error instanceof BaseError ? error : new BaseError('Login failed', 500);
        }
    }

    private generateToken(user: UserDocument): string {
        const payload = {
            userId: user._id.toString(),
            email: user.email
        };

        return jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN });
    }

    async generate2FASecret(userId: string): Promise<{ secret: string; qrCode: string }> {
        try {
            const user = await UserModel.findById(userId);
            if (!user) {
                throw new BaseError('User not found', 404);
            }

            const secret = authenticator.generateSecret();
            const qrCode = authenticator.keyuri(user.email, 'YourApp', secret);

            user.twoFactorSecret = secret;
            await user.save();

            return { secret, qrCode };
        } catch (error) {
            logger.error('Error generating 2FA secret:', { error, userId });
            throw error instanceof BaseError ? error : new BaseError('Failed to generate 2FA secret', 500);
        }
    }

    async verify2FAToken(userId: string, token: string): Promise<boolean> {
        try {
            const user = await UserModel.findById(userId);
            if (!user || !user.twoFactorSecret) {
                throw new BaseError('2FA not set up', 400);
            }

            return authenticator.verify({
                token,
                secret: user.twoFactorSecret
            });
        } catch (error) {
            logger.error('Error verifying 2FA token:', { error, userId });
            throw error instanceof BaseError ? error : new BaseError('2FA verification failed', 500);
        }
    }
} 