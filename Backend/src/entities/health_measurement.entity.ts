import { Column, CreateDateColumn, Entity, ForeignKey, PrimaryGeneratedColumn } from "typeorm";
import { Medical_Record } from "./medical_record.entity";
import { Measurement_Unit } from "./measurement_unit.entity";

@Entity()
export class Health_Measurement {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ForeignKey(() => Medical_Record)
    @Column('uuid')
    record_id: string;

    @ForeignKey(() => Measurement_Unit)
    @Column('uuid')
    unit_id: string;

    @Column()
    numeric_value: number;

    @CreateDateColumn()
    created_at: Date;
}