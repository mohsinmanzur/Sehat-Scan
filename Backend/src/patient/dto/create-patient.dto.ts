import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsNumber, IsOptional, IsString } from "class-validator";

export class CreatePatientDto
{
    @IsString()
    email: string;

    @IsString()
    name: string;

    @IsDate()
    @Type(() => Date)
    date_of_birth: Date;

    @IsString()
    @IsOptional()
    blood_group: string;

    @IsString()
    @IsOptional()
    emergency_contact: string;

    @IsNumber()
    @IsOptional()
    reward_points: number;

    @IsBoolean()
    @IsOptional()
    is_research_opt_in: boolean = false;
}