import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Health_Measurement } from "./health_measurement.entity";
import { Reference_Range } from "./reference_range.entity";

@Entity()
export class Measurement_Unit {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToMany(() => Health_Measurement, (measurement) => measurement.measurement_unit)
    health_measurements: Health_Measurement[];

    @OneToMany(() => Reference_Range, (range) => range.measurement_unit)
    reference_ranges: Reference_Range[];

    @Column()
    unit_name: string;

    @Column()
    symbol: string;

    @Column()
    measurement_group: string;

    @Column({ nullable: true })
    color_light: string;

    @Column({ nullable: true })
    color_dark: string;

    @Column({ nullable: true })
    icon_name: string;
}