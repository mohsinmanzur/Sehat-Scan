export type createPatientDTO = {
    email: string;
    name: string;
    date_of_birth: Date;
    blood_group?: string;
    emergency_contact?: string;
    reward_points?: number;
    is_research_opt_in?: boolean;
};