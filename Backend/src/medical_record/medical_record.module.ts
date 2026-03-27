import { Module } from '@nestjs/common';
import { MedicalRecordService } from './medical_record.service';
import { MedicalRecordController } from './medical_record.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medical_Record } from 'src/entities/medical_record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Medical_Record])],
  controllers: [MedicalRecordController],
  providers: [MedicalRecordService],
})
export class MedicalRecordModule {}
