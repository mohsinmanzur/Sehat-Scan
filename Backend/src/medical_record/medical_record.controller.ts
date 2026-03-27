import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MedicalRecordService } from './medical_record.service';
import { Medical_Record } from 'src/entities/medical_record.entity';
import { CreateRecordDto } from './dto/create-record.dto';

@Controller('record')
export class MedicalRecordController
{
  constructor(private readonly medicalRecordService: MedicalRecordService) {}

  @Get()
  async getRecord(
    @Query('id') id?: string,
    @Query('patient_id') patient_id?: string
  ): Promise<Medical_Record | Medical_Record[] | null>
  {
    if (id) return await this.medicalRecordService.getRecordById(id);
    if (patient_id) return await this.medicalRecordService.getRecordsByPatientId(patient_id);
    return await this.medicalRecordService.getAllRecords();
  }

  @Post()
  async createRecord(@Body() body: CreateRecordDto) : Promise<Medical_Record>
  {
    return await this.medicalRecordService.createRecord(body);
  }
}
