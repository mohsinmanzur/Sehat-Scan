import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import refreshConfig from '../auth/config/refresh.config';
import { Patient } from '../entities/patient.entity';
import { PatientService } from '../patient/patient.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly patientService: PatientService,
        private readonly jwtService: JwtService,
        @Inject(refreshConfig.KEY) private refreshTokenConfig: ConfigType<typeof refreshConfig>
    ) { }

    async signTokens(id: string)
    {
        return {
            id,
            jwtToken: this.jwtService.sign({ sub: id }),
            refreshToken: this.jwtService.sign({ sub: id }, this.refreshTokenConfig),
        };
    }

    refresh(id: number)
    {
        let payload = { sub: id };

        let jwt = this.jwtService.sign(payload);

        return { id, jwt };
    }q

    async userinfofromemail(email: string): Promise<Patient> {
        let patient = await this.patientService.getPatientByEmail(email);
        if (!patient) throw new UnauthorizedException("Error: Email doesn't exist!");

        return patient;
    }

    async checkEmailExists(email: string): Promise<boolean> {
        const patient = await this.patientService.getPatientByEmail(email);
        return !!patient;
    }
}