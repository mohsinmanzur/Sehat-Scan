import { Type } from "class-transformer";
import { IsArray, IsString } from "class-validator";

export class CreateUnitDto
{
    @IsString()
    unit_name: string;

    @IsString()
    symbol: string;

    @IsArray()
    @Type(() => Number)
    reference_range: number[];
}