import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { HealthMeasurementService } from './health_measurement.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { Measurement_Unit } from 'src/entities/measurement_unit.entity';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { Health_Measurement } from 'src/entities/health_measurement.entity';

@Controller('health-measurement')
export class HealthMeasurementController {
  constructor(private readonly healthMeasurementService: HealthMeasurementService) {}

  @Get()
  async getHealthMeasurements(
    @Query() patient_id?: string,
    @Query() id?: string
  ) : Promise<Health_Measurement[] | Promise<Health_Measurement> | null>
  {
    if (patient_id)
    {
      return await this.healthMeasurementService.getHealthMeasurementsByPatient(patient_id);
    }
    if (id)
    {
      return await this.healthMeasurementService.getHealthMeasurementById(id);
    }
    return await this.healthMeasurementService.getAllMeasurements();
  }

  @Post()
  async createHealthMeasurement(@Body() measurement: CreateMeasurementDto) : Promise<Health_Measurement>
  {
    return await this.healthMeasurementService.createHealthMeasurement(measurement);
  }


  @Post('unit')
  async createUnit(@Body() unit: CreateUnitDto) : Promise<Measurement_Unit>
  {
    return await this.healthMeasurementService.createUnit(unit);
  }
}
