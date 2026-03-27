import { Module } from '@nestjs/common';
import { HealthMeasurementService } from './health_measurement.service';
import { HealthMeasurementController } from './health_measurement.controller';

@Module({
  controllers: [HealthMeasurementController],
  providers: [HealthMeasurementService],
})
export class HealthMeasurementModule {}
