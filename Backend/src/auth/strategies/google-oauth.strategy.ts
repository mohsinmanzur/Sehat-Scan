// google-auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleAuthService {
  private client: OAuth2Client;

  constructor(private configService: ConfigService) {
    // Uses the Web Client ID defined in your googleOAuth config
    const clientId = process.env.GOOGLE_CLIENT_ID || this.configService.get<string>('googleOAuth.clientID');
    this.client = new OAuth2Client(clientId);
  }

  async verifyGoogleToken(idToken: string) {
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID || this.configService.get<string>('googleOAuth.clientID');
      
      const ticket = await this.client.verifyIdToken({
        idToken: idToken,
        audience: clientId, 
      });

      const payload = ticket.getPayload();
      
      if (!payload) {
        throw new UnauthorizedException('Invalid Google token payload');
      }

      const { email, given_name, family_name, picture, sub: googleId } = payload;

      // Database Logic Integration:
      // 1. Query your DB to see if a user exists with this `email` or `googleId`
      // 2. If no user exists, create a new record using the destructured data above
      // 3. Return the user record

      return {
        email,
        firstName: given_name,
        lastName: family_name,
        profileImage: picture,
        googleId,
      };

    } catch (error) {
      console.error('Error verifying Google Token:', error);
      throw new UnauthorizedException('Failed to authenticate with Google');
    }
  }
}