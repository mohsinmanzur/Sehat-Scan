import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import dbConfig from 'config/db.config';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true, expandVariables: true }),
    TypeOrmModule.forRootAsync({useFactory: dbConfig}),
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
