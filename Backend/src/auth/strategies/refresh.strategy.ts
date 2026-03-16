import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import refreshConfig from 'src/auth/config/refresh.config';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh')
{
  constructor(@Inject(refreshConfig.KEY) private refreshTokenConfig: ConfigType<typeof refreshConfig>)
  {
      super({
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          secretOrKey: refreshTokenConfig.secret as string
      });
  }

  validate(payload)
  {
      return { id: payload.sub };
  }
}