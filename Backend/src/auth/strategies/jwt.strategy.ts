import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import jwtConfig from '../config/jwt.config';
import type { ConfigType } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(jwtConfig.KEY) private jwtTokenConfig: ConfigType<typeof jwtConfig>)
  {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtTokenConfig.secret || 'super-secret-key',
    });
  }

  async validate(payload: any) {
    // Return user object with id property for consistency
    return { id: payload.sub, userId: payload.sub };
  }
}
