import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { HealthMeasurementModule } from '../health_measurement/health_measurement.module';

@Module({
  imports: [HealthMeasurementModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
