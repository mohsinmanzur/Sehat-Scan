import { Module } from '@nestjs/common';
import { HealthMeasurementService } from './health_measurement.service';
import { HealthMeasurementController } from './health_measurement.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Health_Measurement } from 'src/entities/health_measurement.entity';
import { Measurement_Unit } from 'src/entities/measurement_unit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Health_Measurement]),
    TypeOrmModule.forFeature([Measurement_Unit])
  ],
  controllers: [HealthMeasurementController],
  providers: [HealthMeasurementService],
})
export class HealthMeasurementModule {}
