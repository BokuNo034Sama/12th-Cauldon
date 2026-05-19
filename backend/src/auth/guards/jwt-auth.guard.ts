import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import { AuthService } from "../auth.service";

type RequestWithUser = {
  headers: Record<string, string | string[] | undefined>;
  user?: unknown;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const header = request.headers.authorization;
    const value = Array.isArray(header) ? header[0] : header;
    const token = value?.startsWith("Bearer ") ? value.slice(7) : undefined;

    if (!token) {
      throw new UnauthorizedException("Missing bearer token.");
    }

    request.user = await this.authService.verifyAccessToken(token);
    return true;
  }
}
