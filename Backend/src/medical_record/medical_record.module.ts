import { Module } from '@nestjs/common';
import { MedicalRecordService } from './medical_record.service';
import { MedicalRecordController } from './medical_record.controller';

@Module({
  controllers: [MedicalRecordController],
  providers: [MedicalRecordService],
})
export class MedicalRecordModule {}
