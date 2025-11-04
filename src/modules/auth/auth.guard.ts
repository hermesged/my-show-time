import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { Request, Response } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    if (request.path === '/concerts' || request.path === '/artists') {
      return true;
    }

    let token = request.session?.user?.access_token;
    if (!token) {
      token = this.extractTokenFromHeader(request);
    }

    if (!token) {
      request.session.message = 'Please log in to access this page.';
      response.redirect('/auth/login');
      return false;
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      request['user'] = payload;
      return true;
    } catch {
      request.session.message = 'Your session has expired. Please log in again.';
      response.redirect('/auth/login');
      return false;
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
