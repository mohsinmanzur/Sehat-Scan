import { Module } from '@nestjs/common';
import { HealthMeasurementService } from './health_measurement.service';
import { HealthMeasurementController } from './health_measurement.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Health_Measurement } from '../entities/health_measurement.entity';
import { Measurement_Unit } from '../entities/measurement_unit.entity';
import { Reference_Range } from '../entities/reference_range.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Health_Measurement, Measurement_Unit, Reference_Range]),
  ],
  controllers: [HealthMeasurementController],
  providers: [HealthMeasurementService],
  exports: [HealthMeasurementService],
})
export class HealthMeasurementModule {}
