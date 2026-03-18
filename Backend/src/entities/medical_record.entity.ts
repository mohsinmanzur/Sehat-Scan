import { Column, CreateDateColumn, Entity, ForeignKey, PrimaryGeneratedColumn } from "typeorm";
import { Patient } from "./patient.entity";

@Entity()
export class Medical_Record {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ForeignKey(() => Patient)
    @Column('uuid')
    patient_id: string;

    @Column()
    file_name: string;

    @Column()
    file_url: string;

    @Column({
        type: 'enum',
        enum: ['lab_report', 'prescription', 'imaging', 'other'],
        default: 'other'
    })
    record_type: string;

    @Column({ nullable: true })
    ocr_extracted_text: string;

    @Column({ nullable: true })
    date_issued: Date;
    
    @CreateDateColumn()
    created_at: Date;
}