import { Body, Controller, Delete, Get, Post, Put, Query } from '@nestjs/common';
import { PatientService } from './patient.service';
import { Patient } from 'src/entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Public()
@Controller('patient')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get()
  async getPatient(
    @Query('id') id?: string,
    @Query('email') email?: string,
    @Query('name') name?: string
  ): Promise<Patient | Patient[] | null>
  {
    if (id) return await this.patientService.getPatientById(id);
    if (email) return await this.patientService.getPatientByEmail(email);
    if (name) return await this.patientService.getPatientByName(name);
    return await this.patientService.getAllPatients();
  }

  @Post()
  async createPatient(@Body() patient: CreatePatientDto): Promise<Patient>
  {
    return await this.patientService.createPatient(patient);
  }

  @Put()
  async updatePatient(@Query('id') id: string, @Body() patient: UpdatePatientDto): Promise<Patient | null>
  {
    return await this.patientService.updatePatient(id, patient);
  }

  @Delete()
  async deletePatient(@Query('id') id: string): Promise<void>
  {
    await this.patientService.deletePatient(id);
  }
}
