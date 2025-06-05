"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const User_model_1 = require("../models/User.model");
const types_1 = require("../../types");
const logger_1 = require("../../infrastructure/logging/logger");
class UserService {
    async findById(id) {
        try {
            const user = await User_model_1.User.findById(id);
            if (!user) {
                throw new types_1.BaseError('User not found', 404, 'USER_NOT_FOUND');
            }
            return user;
        }
        catch (error) {
            logger_1.logger.error('Error finding user by ID:', { error, userId: id });
            throw error;
        }
    }
    async findByEmail(email) {
        try {
            const user = await User_model_1.User.findOne({ email });
            if (!user) {
                throw new types_1.BaseError('User not found', 404, 'USER_NOT_FOUND');
            }
            return user;
        }
        catch (error) {
            logger_1.logger.error('Error finding user by email:', { error, email });
            throw error;
        }
    }
    async enable2FA(userId) {
        try {
            const user = await User_model_1.User.findByIdAndUpdate(userId, { isTwoFactorEnabled: true }, { new: true });
            if (!user) {
                throw new types_1.BaseError('User not found', 404, 'USER_NOT_FOUND');
            }
            return user;
        }
        catch (error) {
            logger_1.logger.error('Error enabling 2FA:', { error, userId });
            throw error;
        }
    }
    async disable2FA(userId) {
        try {
            const user = await User_model_1.User.findByIdAndUpdate(userId, {
                isTwoFactorEnabled: false,
                twoFactorSecret: undefined
            }, { new: true });
            if (!user) {
                throw new types_1.BaseError('User not found', 404, 'USER_NOT_FOUND');
            }
            return user;
        }
        catch (error) {
            logger_1.logger.error('Error disabling 2FA:', { error, userId });
            throw error;
        }
    }
    async updateProfile(userId, updates) {
        try {
            // Remove fields that shouldn't be updated directly
            const { password, twoFactorSecret, isTwoFactorEnabled, ...safeUpdates } = updates;
            const user = await User_model_1.User.findByIdAndUpdate(userId, { $set: safeUpdates }, { new: true, runValidators: true });
            if (!user) {
                throw new types_1.BaseError('User not found', 404, 'USER_NOT_FOUND');
            }
            return user;
        }
        catch (error) {
            logger_1.logger.error('Error updating user profile:', { error, userId });
            throw error;
        }
    }
    async deleteAccount(userId) {
        try {
            const user = await User_model_1.User.findByIdAndDelete(userId);
            if (!user) {
                throw new types_1.BaseError('User not found', 404, 'USER_NOT_FOUND');
            }
        }
        catch (error) {
            logger_1.logger.error('Error deleting user account:', { error, userId });
            throw error;
        }
    }
}
exports.UserService = UserService;
