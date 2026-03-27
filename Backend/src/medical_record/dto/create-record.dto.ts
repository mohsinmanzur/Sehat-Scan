import { Type } from "class-transformer";
import { IsDate, IsEnum, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateRecordDto
{
    @IsUUID()
    patient_id: string;

    @IsString()
    file_name: string;

    @IsString()
    file_url: string;

    @IsEnum(['lab_report', 'prescription', 'imaging', 'other'])
    record_type: string;

    @IsString()
    @IsOptional()
    ocr_extracted_text: string;

    @IsDate()
    @Type(() => Date)
    date_issued: Date;
}