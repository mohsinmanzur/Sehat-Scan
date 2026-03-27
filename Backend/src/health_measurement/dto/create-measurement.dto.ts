import { IsNumber, IsOptional, IsUUID } from "class-validator";

export class CreateMeasurementDto
{
    @IsUUID()
    patient_id: string;

    @IsUUID()
    @IsOptional()
    record_id: string;

    @IsUUID()
    unit_id: string;

    @IsNumber()
    numeric_value: number;
}