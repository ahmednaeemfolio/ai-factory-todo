import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

interface AuthenticatedRequest {
  headers: { authorization?: string | string[] };
  userId?: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    const match = typeof authorization === 'string'
      ? /^Bearer\s+(\S+)$/i.exec(authorization)
      : null;
    const userId = match
      ? this.authService.getUserIdForToken(match[1])
      : undefined;

    if (!userId) {
      throw new UnauthorizedException('Missing or invalid bearer token');
    }

    request.userId = userId;
    return true;
  }
}
