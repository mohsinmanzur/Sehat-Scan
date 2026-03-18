import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from 'src/entities/patient.entity';
import { Repository } from 'typeorm';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientService
{
    constructor(@InjectRepository(Patient) private patientRepo: Repository<Patient>) { }

    async getAllPatients(): Promise<Patient[]>
    {
        return await this.patientRepo.find();
    }

    async getPatientById(id: string): Promise<Patient | null>
    {
        return await this.patientRepo.findOne({ where: { id } });
    }

    async getPatientByEmail(email: string): Promise<Patient | null>
    {
        return await this.patientRepo.findOne({ where: { email } });
    }

    async getPatientByName(name: string): Promise<Patient | null>
    {
        return await this.patientRepo.findOne({ where: { name } });
    }

    async createPatient(patient: CreatePatientDto): Promise<Patient>
    {
        return await this.patientRepo.save(patient);
    }

    async updatePatient(id: string, patient: UpdatePatientDto): Promise<Patient | null>
    {
        await this.patientRepo.update(id, patient);
        return await this.getPatientById(id);
    }

    async deletePatient(id: string): Promise<void>
    {
        await this.patientRepo.delete(id);
    }
}
