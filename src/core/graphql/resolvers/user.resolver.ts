import { UserModel, UserDocument } from '../../models/User.model';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { UserResponse } from '../../interfaces/user.interface';
import { AuthenticationError } from '../../../utils/errors';
import { logger } from '../../../infrastructure/logging/logger';

const authService = new AuthService();
const userService = new UserService();

export const userResolvers = {
  Query: {
    me: async (_: any, __: any, { user }: { user?: { id: string } }): Promise<UserResponse> => {
      if (!user) {
        throw new AuthenticationError();
      }
      const userDoc = await UserModel.findById(user.id);
      if (!userDoc) {
        throw new AuthenticationError();
      }
      return authService.transformUser(userDoc);
    },
  },

  Mutation: {
    register: async (_: any, { input }: { input: { email: string; username: string; password: string } }): Promise<UserResponse> => {
      try {
        return await authService.register(input);
      } catch (error) {
        logger.error('Error in register mutation', { error });
        throw error;
      }
    },

    login: async (_: any, { input }: { input: { email: string; password: string } }): Promise<{ token: string; user: UserResponse }> => {
      try {
        return await authService.login(input.email, input.password);
      } catch (error) {
        logger.error('Error in login mutation', { error });
        throw error;
      }
    },

    generate2FASecret: async (_: any, __: any, { user }: { user?: { id: string } }): Promise<{ secret: string; qrCode: string }> => {
      if (!user) {
        throw new AuthenticationError();
      }
      return await authService.generate2FASecret(user.id);
    },

    verify2FA: async (_: any, { token }: { token: string }, { user }: { user?: { id: string } }): Promise<boolean> => {
      if (!user) {
        throw new AuthenticationError();
      }
      const isValid = await authService.verify2FAToken(user.id, token);
      if (isValid) {
        await userService.enable2FA(user.id);
      }
      return isValid;
    },

    disable2FA: async (_: any, { token }: { token: string }, { user }: { user?: { id: string } }): Promise<boolean> => {
      if (!user) {
        throw new AuthenticationError();
      }
      const isValid = await authService.verify2FAToken(user.id, token);
      if (isValid) {
        await userService.disable2FA(user.id);
      }
      return isValid;
    },
  },
};

export default userResolvers; 