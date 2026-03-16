import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import googleOauthConfig from "../config/google-oauth.config";
import type { ConfigType } from "@nestjs/config";
import { AuthService } from "../auth.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'googleoauth')
{
  constructor(
    @Inject(googleOauthConfig.KEY) private googleConfig: ConfigType<typeof googleOauthConfig>,
    private readonly authService: AuthService
  )
  {
    super({
      clientID: googleConfig.clientID as string,
      clientSecret: googleConfig.clientSecret  as string,
      callbackURL: googleConfig.callbackURL as string,
      scope: ['email', 'profile'],
    });
  }
    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback)
    {
        const user = await this.authService.validateGoogleUser({
          username: profile.emails[0].value.split('@')[0],
          name: profile.displayName,
          email: profile.emails[0].value,
          password_hash: 'NULL_PASSWORD',
          phone_number: '',
          role: 'recipient',
          auth_provider: 'Google'
        });

        done(null, user);
    }
}