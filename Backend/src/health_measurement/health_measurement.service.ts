import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Measurement_Unit } from 'src/entities/measurement_unit.entity';
import { CreateUnitDto } from './dto/create-unit.dto';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { Health_Measurement } from 'src/entities/health_measurement.entity';
import { Repository } from 'typeorm';

@Injectable()
export class HealthMeasurementService
{
    constructor(
        @InjectRepository(Health_Measurement) private healthMeasurementRepo: Repository<Health_Measurement>,
        @InjectRepository(Measurement_Unit) private measurementUnitRepo: Repository<Measurement_Unit>
    ) {}

    async getAllMeasurements() : Promise<Health_Measurement[] | null>
    {
        return await this.healthMeasurementRepo.find();
    }

    async getHealthMeasurementsByPatient(patient_id: string) : Promise<Health_Measurement[] | null>
    {
        return await this.healthMeasurementRepo.findBy({ patient_id });
    }

    async getHealthMeasurementById(id: string) : Promise<Health_Measurement | null>
    {
        return await this.healthMeasurementRepo.findOneBy({ id });
    }

    async createHealthMeasurement(measurement: CreateMeasurementDto) : Promise<Health_Measurement>
    {
        const record = await this.healthMeasurementRepo.findOneBy({ id: measurement.record_id });
        if (!record)
        {
            const { record_id, ...measurementInfo } = measurement;
            const createdRecord = this.healthMeasurementRepo.create(measurementInfo);
            return await this.healthMeasurementRepo.save(createdRecord);
        }

        const createdRecord = this.healthMeasurementRepo.create(measurement);
        return await this.healthMeasurementRepo.save(createdRecord);
    }

    async createUnit(unit: CreateUnitDto) : Promise<Measurement_Unit>
    {
        const newUnit = this.measurementUnitRepo.create(unit);
        return await this.measurementUnitRepo.save(newUnit);
    }
}
