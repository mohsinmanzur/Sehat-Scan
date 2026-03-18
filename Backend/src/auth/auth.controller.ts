import { Body, Controller, HttpCode, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { EmailService } from './services/email.service';
import { OtpService } from './services/otp.service';
import { GoogleAuthService } from './strategies/google-oauth.strategy';

@Public()
@Controller('auth')
export class AuthController
{
  constructor
  (
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly otpService: OtpService,
    private readonly googleAuthService: GoogleAuthService
  ) {}

  @Post('requestcode')
  @HttpCode(200)
  async requestCode(@Body() body: { email: string; })
  {
    if (!body.email) throw new UnauthorizedException('Email is required');
    
    const userExists = await this.authService.checkEmailExists(body.email);
    
    if (userExists)
    {
      //Login
    }
    else
    {
      //Signup
    }
    
    const { code } = await this.otpService.create(body.email);
    await this.emailService.sendLoginCode(body.email, code);

    return {
      status: 'Code sent'
    };
  }

  @Post('verifycode')
  @HttpCode(202)
  async verifyCode(@Body() dto: { email: string; code: string })
  {
    const { email, code } = dto;
    await this.otpService.verify(email, code, 5); // 5 attempts max

    const user = await this.authService.userinfofromemail(email);
    return await this.authService.signTokens(user.id);
  }
  
  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refresh(@Req() req)
  {
    return this.authService.refresh(req.user.id);
  }

  @Post('google')
  async googleLogin(@Body('idToken') idToken: string) {
    // 1. Verify the frontend's token and retrieve/create the user
    const userDetails = await this.googleAuthService.verifyGoogleToken(idToken);
    
    // 2. Generate your backend's internal JWT (using @nestjs/jwt)
    //const appToken = this.jwtService.sign({ userId: userDetails.id });
    
    // 3. Return the payload to the React Native app
    return {
      message: 'Authentication successful',
      user: userDetails,
      // accessToken: appToken 
    };
  }
}
