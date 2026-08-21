import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientModule } from './patient/patient.module';
import dbConfig from './config/db.config';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { MedicalDocumentModule } from './medical_document/medical_document.module';
import { HealthMeasurementModule } from './health_measurement/health_measurement.module';
import { DoctorModule } from './doctor/doctor.module';
import { ShareModule } from './share/share.module';
import { AiModule } from './ai/ai.module';

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
    MedicalDocumentModule,
    HealthMeasurementModule,
    DoctorModule,
    ShareModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard }
  ],
})
export class AppModule { }
