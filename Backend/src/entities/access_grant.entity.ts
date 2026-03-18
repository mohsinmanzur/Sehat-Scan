import { Column, Entity, ForeignKey, PrimaryGeneratedColumn } from "typeorm";
import { Patient } from "./patient.entity";
import { Doctor } from "./doctor.entity";

@Entity()
export class Access_Grant {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ForeignKey(() => Patient)
    @Column('uuid')
    patient_id: string;

    @ForeignKey(() => Doctor)
    @Column('uuid')
    doctor_id: string;

    @Column()
    access_token: string;

    @Column({
        enum: ['view_only', 'emergency', 'full_access'],
        default: 'view_only'
    })
    permission: string;

    @Column({ default: false })
    is_revoked: boolean;

    @Column()
    expires_at: Date;
}