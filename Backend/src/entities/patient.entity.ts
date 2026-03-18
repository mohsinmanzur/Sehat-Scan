import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Patient {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    email: string;

    @Column()
    name: string;

    @Column()
    date_of_birth: Date;

    @Column({ nullable: true })
    blood_group: string;

    @Column({ nullable: true })
    emergency_contact: string;

    @Column({ nullable: true })
    reward_points: number;

    @Column({ nullable: true })
    is_research_opt_in: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}