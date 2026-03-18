import { Column, CreateDateColumn, Entity, ForeignKey, PrimaryGeneratedColumn } from "typeorm";
import { Medical_Record } from "./medical_record.entity";

@Entity()
export class AI_Analysis {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ForeignKey(() => Medical_Record)
    @Column('uuid')
    record_id: string;

    @Column({ default: false })
    anomaly_detected: boolean;

    @Column({ nullable: true })
    suggested_text: string;

    @Column()
    severity_score: number;

    @CreateDateColumn()
    created_at: Date;
}