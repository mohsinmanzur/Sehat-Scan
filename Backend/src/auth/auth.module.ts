import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from 'src/auth/config/jwt.config';
import refreshConfig from 'src/auth/config/refresh.config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenStrategy } from './strategies/refresh.strategy';
import { ConfigModule } from '@nestjs/config';
import googleOauthConfig from './config/google-oauth.config';
import { EmailService } from './services/email.service';
import { OtpService } from './services/otp.service';
import emailConfig from '../../config/email.config';
import { PatientService } from 'src/patient/patient.service';
import { Patient } from 'src/entities/patient.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { PatientModule } from 'src/patient/patient.module';
import { GoogleAuthService } from './strategies/google-oauth.strategy';

@Module({
  controllers: [AuthController],
  
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenStrategy,
    EmailService,
    OtpService,
    GoogleAuthService
    ], 

  imports: [
    PatientModule,
    CacheModule.register(),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshConfig),
    ConfigModule.forFeature(googleOauthConfig),
    ConfigModule.forFeature(emailConfig),
  ],
})
export class AuthModule {}
