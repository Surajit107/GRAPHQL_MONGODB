import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { LoggerService } from '../../common/services/logger.service';

@Injectable()
export class Jwt2faAuthGuard extends AuthGuard('jwt-2fa') {
  constructor(private logger: LoggerService) {
    super();
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      const errorMessage = err?.message || 'Unauthorized access or 2FA required';
      this.logger.warn(`JWT-2FA authentication failed: ${errorMessage}`);
      throw err || new UnauthorizedException(errorMessage);
    }
    return user;
  }
}