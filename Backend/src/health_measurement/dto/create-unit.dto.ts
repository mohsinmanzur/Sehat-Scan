import { IsOptional, IsString, IsUUID } from "class-validator";

export class CreateMeasurementUnitDto
{
    @IsUUID()
    @IsOptional()
    id?: string;

    @IsString()
    unit_name: string;

    @IsString()
    symbol: string;

    @IsString()
    measurement_group: string;

    @IsString()
    @IsOptional()
    color_light?: string;

    @IsString()
    @IsOptional()
    color_dark?: string;

    @IsString()
    @IsOptional()
    icon_name?: string;
}