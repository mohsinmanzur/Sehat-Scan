import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { verify, hash } from 'argon2';
import refreshConfig from 'src/auth/config/refresh.config';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        @Inject(refreshConfig.KEY) private refreshTokenConfig: ConfigType<typeof refreshConfig>
    ) { }

    async signTokens(id: number)
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
    }

    async validateGoogleUser(googleUser) {
        const user = await this.userService.findbyemail(googleUser.email);
        if (!user) return await this.userService.createUser(googleUser);
        if (user.auth_provider !== 'Google') throw new UnauthorizedException("Error: Invalid authentication provider!");

        return user;
    }

    async userinfofromemail(email: string): Promise<User> {
        let user = await this.userService.findbyemail(email);
        if (!user) throw new UnauthorizedException("Error: Email doesn't exist!");

        return user;
    }

    async checkEmailExists(email: string): Promise<boolean> {
        const user = await this.userService.findbyemail(email);
        return !!user; // Returns true if user exists, false otherwise
    }
}