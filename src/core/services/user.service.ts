import { UserModel, UserDocument } from '../models/User.model';
import { User, UserResponse } from '../interfaces/user.interface';
import { BaseError } from '../../utils/errors';
import { logger } from '../../infrastructure/logging/logger';

export class UserService {
    private transformUser(user: UserDocument): UserResponse {
        const { _id, password, ...userData } = user.toObject();
        return {
            ...userData,
            id: _id.toString()
        };
    }

    async findById(id: string): Promise<UserResponse | null> {
        try {
            const user = await UserModel.findById(id);
            if (!user) {
                throw new BaseError('User not found', 404, 'USER_NOT_FOUND');
            }
            return this.transformUser(user);
        } catch (error) {
            logger.error('Error finding user by ID:', { error, userId: id });
            throw error;
        }
    }

    async findByEmail(email: string): Promise<UserResponse | null> {
        try {
            const user = await UserModel.findOne({ email });
            if (!user) {
                throw new BaseError('User not found', 404, 'USER_NOT_FOUND');
            }
            return this.transformUser(user);
        } catch (error) {
            logger.error('Error finding user by email:', { error, email });
            throw error;
        }
    }

    async enable2FA(userId: string): Promise<UserResponse> {
        try {
            const user = await UserModel.findByIdAndUpdate(
                userId,
                { isTwoFactorEnabled: true },
                { new: true }
            );

            if (!user) {
                throw new BaseError('User not found', 404, 'USER_NOT_FOUND');
            }

            return this.transformUser(user);
        } catch (error) {
            logger.error('Error enabling 2FA:', { error, userId });
            throw error;
        }
    }

    async disable2FA(userId: string): Promise<UserResponse> {
        try {
            const user = await UserModel.findByIdAndUpdate(
                userId,
                { 
                    isTwoFactorEnabled: false,
                    twoFactorSecret: undefined
                },
                { new: true }
            );

            if (!user) {
                throw new BaseError('User not found', 404, 'USER_NOT_FOUND');
            }

            return this.transformUser(user);
        } catch (error) {
            logger.error('Error disabling 2FA:', { error, userId });
            throw error;
        }
    }

    async updateProfile(userId: string, updates: Partial<User>): Promise<UserResponse> {
        try {
            const { password, twoFactorSecret, isTwoFactorEnabled, ...safeUpdates } = updates;

            const user = await UserModel.findByIdAndUpdate(
                userId,
                { $set: safeUpdates },
                { new: true, runValidators: true }
            );

            if (!user) {
                throw new BaseError('User not found', 404, 'USER_NOT_FOUND');
            }

            return this.transformUser(user);
        } catch (error) {
            logger.error('Error updating user profile:', { error, userId });
            throw error;
        }
    }

    async deleteAccount(userId: string): Promise<void> {
        try {
            const user = await UserModel.findByIdAndDelete(userId);
            if (!user) {
                throw new BaseError('User not found', 404, 'USER_NOT_FOUND');
            }
        } catch (error) {
            logger.error('Error deleting user account:', { error, userId });
            throw error;
        }
    }
} 