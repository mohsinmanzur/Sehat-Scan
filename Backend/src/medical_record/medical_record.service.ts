import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Medical_Record } from 'src/entities/medical_record.entity';
import { Repository } from 'typeorm/browser/repository/Repository.js';
import { CreateRecordDto } from './dto/create-record.dto';

@Injectable()
export class MedicalRecordService
{
    constructor(@InjectRepository(Medical_Record) private medicalRecordRepo: Repository<Medical_Record>) {}

    async getAllRecords() : Promise<Medical_Record[] | null>
    {
        return await this.medicalRecordRepo.find();
    }

    async getRecordsByPatientId(id: string) : Promise<Medical_Record[] | null>
    {
        return await this.medicalRecordRepo.find({ where: { patient_id: id } });
    }

    async getRecordById(id: string) : Promise<Medical_Record | null>
    {
        return await this.medicalRecordRepo.findOne({ where: { id } });
    }

    async createRecord(body: CreateRecordDto) : Promise<Medical_Record>
    {
        const rec = this.medicalRecordRepo.create(body);
        return await this.medicalRecordRepo.save(rec);
    }
}
