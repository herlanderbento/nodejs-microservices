import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { expressjwt as jwt } from 'express-jwt';
import { promisify } from 'node:util';
import { expressJwtSecrets } from './express.jwt.secret';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  private readonly AUTH0_AUDIENCE: string;
  private readonly AUTH0_DOMAIN: string;

  constructor(private configService: ConfigService) {
    this.AUTH0_AUDIENCE = this.configService.get('AUTH0_AUDIENCE') ?? '';
    this.AUTH0_DOMAIN = this.configService.get('AUTH0_DOMAIN') ?? '';
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();

    const checkJWT = promisify(
      jwt({
        secret: expressJwtSecrets,
        audience: this.AUTH0_AUDIENCE,
        issuer: this.AUTH0_DOMAIN,
        algorithms: ['RS256'],
      }),
    );

    try {
      await checkJWT(request, response);

      return true;
    } catch (err) {
      throw new UnauthorizedException(err);
    }
  }
}
