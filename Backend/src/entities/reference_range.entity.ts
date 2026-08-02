import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Measurement_Unit } from "./measurement_unit.entity";

@Entity()
export class Reference_Range {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Measurement_Unit, (unit) => unit.reference_ranges)
    @JoinColumn({ name: 'unit_id' })
    measurement_unit: Measurement_Unit;

    @Column('uuid')
    unit_id: string;

    @Column({ type: 'real', default: 0 })
    min_value: number;

    @Column({ type: 'real', default: 0 })
    max_value: number;

    @Column({ type: 'real', nullable: true })
    min_value_2: number;

    @Column({ type: 'real', nullable: true })
    max_value_2: number;

    @Column({
        enum: ['male', 'female', 'other'],
        nullable: true,
        enumName: 'gender_enum'
    })
    target_gender: string;

    @Column({ nullable: true })
    min_age: number;

    @Column({ nullable: true })
    max_age: number;

    @Column({ nullable: true, type: 'text', array: true })
    special_conditions: string[];
}