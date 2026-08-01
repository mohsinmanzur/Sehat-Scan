import { Type } from "class-transformer";
import { IsArray, IsDate, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateMeasurementDto {
    @IsUUID()
    @IsOptional()
    id?: string;

    @IsUUID()
    @IsOptional()
    document_id?: string;

    @IsUUID()
    patient_id: string;

    @IsUUID()
    unit_id: string;

    @IsNumber()
    numeric_value: number;

    @IsOptional()
    @IsNumber()
    numeric_value_2?: number;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    special_conditions?: string[];

    @Type(() => Date)
    @IsDate()
    @IsOptional()
    created_at?: Date;

    @Type(() => Date)
    @IsDate()
    @IsOptional()
    updated_at?: Date;
}