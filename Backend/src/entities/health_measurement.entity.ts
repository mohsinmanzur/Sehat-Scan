import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Medical_Document } from "./medical_document.entity";
import { Measurement_Unit } from "./measurement_unit.entity";
import { Patient } from "./patient.entity";
import { Access_Grant } from "./access_grant.entity";

@Entity()
export class Health_Measurement {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Medical_Document, (doc) => doc.health_measurements)
    @JoinColumn({ name: 'document_id' })
    medical_document: Medical_Document;

    @Column('uuid', { nullable: true })
    document_id: string;

    @ManyToOne(() => Patient, (patient) => patient.health_measurements)
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @Column('uuid')
    patient_id: string;

    @ManyToOne(() => Measurement_Unit, (unit) => unit.health_measurements)
    @JoinColumn({ name: 'unit_id' })
    measurement_unit: Measurement_Unit;

    @Column('uuid')
    unit_id: string;

    @Column()
    numeric_value: number;

    @Column('real', { nullable: true })
    numeric_value_2: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}