import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Measurement_Unit {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    unit_name: string;

    @Column()
    symbol: string;

    @Column('float', { array: true, nullable: true })
    reference_range: number[];
}