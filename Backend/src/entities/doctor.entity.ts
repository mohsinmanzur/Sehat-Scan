import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Doctor {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    email: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    license_number: string;

    @Column({ nullable: true })
    associated_hospital: string;

    @Column({ nullable: true })
    specialization: string;

    @Column({ default: false })
    is_verified: boolean;
    
    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}