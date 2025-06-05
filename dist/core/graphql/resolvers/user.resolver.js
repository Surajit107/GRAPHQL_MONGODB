"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userResolvers = void 0;
const User_model_1 = require("../../models/User.model");
const auth_service_1 = require("../../services/auth.service");
const user_service_1 = require("../../services/user.service");
const errors_1 = require("../../../utils/errors");
const logger_1 = require("../../../infrastructure/logging/logger");
const authService = new auth_service_1.AuthService();
const userService = new user_service_1.UserService();
exports.userResolvers = {
    Query: {
        me: async (_, __, { user }) => {
            if (!user) {
                throw new errors_1.AuthenticationError();
            }
            const userDoc = await User_model_1.UserModel.findById(user.id);
            if (!userDoc) {
                throw new errors_1.AuthenticationError();
            }
            return authService.transformUser(userDoc);
        },
    },
    Mutation: {
        register: async (_, { input }) => {
            try {
                return await authService.register(input);
            }
            catch (error) {
                logger_1.logger.error('Error in register mutation', { error });
                throw error;
            }
        },
        login: async (_, { input }) => {
            try {
                return await authService.login(input.email, input.password);
            }
            catch (error) {
                logger_1.logger.error('Error in login mutation', { error });
                throw error;
            }
        },
        generate2FASecret: async (_, __, { user }) => {
            if (!user) {
                throw new errors_1.AuthenticationError();
            }
            return await authService.generate2FASecret(user.id);
        },
        verify2FA: async (_, { token }, { user }) => {
            if (!user) {
                throw new errors_1.AuthenticationError();
            }
            const isValid = await authService.verify2FAToken(user.id, token);
            if (isValid) {
                await userService.enable2FA(user.id);
            }
            return isValid;
        },
        disable2FA: async (_, { token }, { user }) => {
            if (!user) {
                throw new errors_1.AuthenticationError();
            }
            const isValid = await authService.verify2FAToken(user.id, token);
            if (isValid) {
                await userService.disable2FA(user.id);
            }
            return isValid;
        },
    },
};
exports.default = exports.userResolvers;
