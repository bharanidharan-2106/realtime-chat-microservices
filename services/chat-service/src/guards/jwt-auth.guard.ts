import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface JwtPayload {
  sub: string;
  email: string;
  username?: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid token');
    }

    try {
      const token = authHeader.split(' ')[1];
      const payload = await this.jwtService.verifyAsync(token) as JwtPayload;
      request.user = {
        userId: payload.sub,
        email: payload.email,
        username: payload.username,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
