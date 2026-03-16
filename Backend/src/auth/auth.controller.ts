import { Body, Controller, Get, HttpCode, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import { EmailService } from './services/email.service';
import { OtpService } from './services/otp.service';

@Public()
@Controller('auth')
export class AuthController
{
  constructor
  (
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly otpService: OtpService
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

  @UseGuards(GoogleAuthGuard)
  @Get('google/verify')
  async googleVerify() {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @HttpCode(202)
  @Get('google/callback')
  async googleRedirect(@Req() req)
  {
    return await this.authService.signTokens(req.user.id);
    //res.redirect(`https://naimat-backend-f9drh3fcceewebcd.southeastasia-01.azurewebsites.net/?token=${response.jwt}&refresh=${response.refresh}`);
  }
}
