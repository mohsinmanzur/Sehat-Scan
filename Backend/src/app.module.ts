import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientModule } from './patient/patient.module';
import dbConfig from 'src/config/db.config';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { MedicalRecordModule } from './medical_record/medical_record.module';
import { HealthMeasurementModule } from './health_measurement/health_measurement.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, expandVariables: true }),
    AuthModule,
    PatientModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: dbConfig,
    }),
    MedicalRecordModule,
    HealthMeasurementModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {provide: APP_GUARD, useClass: JwtAuthGuard}
  ],
})
export class AppModule {}
